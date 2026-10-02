// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import "forge-std/Test.sol";
import "../src/MapCityVault.sol";
import "../src/TwapUsdFeed.sol";

interface IQuoter {
    function quoteExactInput(bytes memory path, uint256 amountIn)
        external returns (uint256, uint160[] memory, uint32[] memory, uint256);
}
interface IV2R {
    function getAmountsOut(uint256, address[] calldata) external view returns (uint256[] memory);
    function swapExactETHForTokens(uint256, address[] calldata, address, uint256) external payable returns (uint256[] memory);
}

contract Ops { uint256 public got; receive() external payable { got += msg.value; } }
contract RevertingOps { receive() external payable { revert("no"); } }
contract GasBombOps { receive() external payable { while (true) {} } }

contract ForkBase is Test {
    MapCityVaultUpgradeable vault;
    Ops ops;
    address guardian = 0x9e27098dcD8844bcc6287a557E0b4D09C86B8a4b;
    address owner_ = address(0xA11CE);
    uint256 signerPk = 0xC0FFEE;
    address signer;
    address constant WBNB = 0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c;
    address constant USDT = 0x55d398326f99059fF775485246999027B3197955;
    TwapUsdFeed qqqFeed;
    TwapUsdFeed spyFeed;
    address constant QQQ_POOL = 0x47BC06722295AC316A569EEF87aC32FAA455F441; // WBNB/QQQB 0.05%
    address constant SPY_POOL = 0x7aA6d92Fc369A8C1EDc631A3aAc44eFB0808ddbF; // USDT/SPYB 0.01%
    address constant BNB_USD = 0x0567F2323251f0Aab15c8dFb1967E4e8A7D42aeE;
    address constant USDT_USD = 0xB97Ad0E74fa7d920791E90258A6E2085088b4320;
    IQuoter quoter = IQuoter(0xB048Bbc1Ee6b733FFfCFb9e9CeF7375518e25997);
    string[9] names = ["NVDAB","AAPLB","TSLAB","MSFTB","GOOGLB","SPCXB","QQQB","MUB","SPYB"];

    function setUp() public virtual {
        vm.createSelectFork(vm.envString("BSC_RPC"), vm.envUint("BLOCK"));
        ops = new Ops();
        MapCityVaultUpgradeable impl = new MapCityVaultUpgradeable();
        UpgradeableBeacon beacon = new UpgradeableBeacon(address(impl), address(this));
        BeaconProxy proxy = new BeaconProxy(
            address(beacon), abi.encodeCall(MapCityVaultUpgradeable.initialize, (owner_, address(0), address(ops)))
        );
        vault = MapCityVaultUpgradeable(payable(address(proxy)));
        signer = vm.addr(signerPk);
        vm.prank(guardian);
        vault.setGameSigner(signer);
        // QQQB / SPYB: no Chainlink feed on BSC -> 30-min PancakeSwap TWAP ruler.
        qqqFeed = new TwapUsdFeed(QQQ_POOL, vault.districtAsset(6), BNB_USD, 1800, "QQQB / USD (TWAP)");
        spyFeed = new TwapUsdFeed(SPY_POOL, vault.districtAsset(8), USDT_USD, 1800, "SPYB / USD (TWAP)");
        vm.startPrank(guardian);
        vault.setDistrictFeed(6, address(qqqFeed));
        vault.setDistrictFeed(8, address(spyFeed));
        vm.stopPrank();
    }

    function fund(uint256 amt) internal {
        address payer = address(0xBEEF);
        vm.deal(payer, amt);
        vm.prank(payer);
        (bool ok,) = address(vault).call{value: amt}("");
        require(ok);
    }

    function refill(uint8 d, uint256 bnb) internal returns (uint256) {
        if (vault.districtFeed(d) == address(0)) {
            (, bytes memory p,) = vault.districtRoute(d);
            (uint256 q,,,) = quoter.quoteExactInput(p, bnb);
            vm.prank(owner_);
            return vault.refillViaSwap(d, bnb, q * 97 / 100);
        }
        return vault.refillViaSwap(d, bnb, 0);
    }

    function sign(address to, uint8 d, uint256 amt, bytes32 sp, uint256 nonce, uint256 dl, uint256 pk)
        internal view returns (bytes memory)
    {
        bytes32 dg = vault.gameVoucherDigest(to, d, amt, sp, nonce, dl);
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(pk, dg);
        return abi.encodePacked(r, s, v);
    }

    function claim(address to, uint8 d, uint256 amt, uint256 nonce) internal {
        uint256 dl = vm.getBlockTimestamp() + 900;
        bytes memory sg = sign(to, d, amt, bytes32(nonce), nonce, dl, signerPk);
        vault.claimGameVoucher(to, d, amt, bytes32(nonce), nonce, dl, sg);
    }

    /// Ledger: every wei of BNB the vault ever received is ops-paid, in a bucket, or spent.
    function assertLedger() internal view {
        uint256 spent; uint256 pend;
        for (uint8 d = 0; d < 9; d++) { spent += vault.totalBnbSpent(d); pend += vault.pendingBnb(d); }
        assertEq(vault.totalTaxReceived(), vault.totalOpsBnbPaid() + pend + spent + vault.totalOwnerBnbWithdrawn(), "BNB ledger");
        assertGe(address(vault).balance, vault.outstandingRewards(), "BNB backing");
        for (uint8 d = 0; d < 9; d++) {
            assertLe(vault.gamePool(d), vault.totalGameFunded(d) - vault.totalGamePaid(d), "stock ledger");
        }
    }
}

contract E2E is ForkBase {
    function test_01_full_flow_all_9_districts() public {
        fund(10 ether);
        assertEq(ops.got(), 1 ether, "10% ops");
        for (uint8 d = 0; d < 9; d++) assertApproxEqAbs(vault.pendingBnb(d), 1 ether, 9, "bucket");

        for (uint8 d = 0; d < 9; d++) {
            uint256 got = refill(d, 0.5 ether);
            assertGt(got, 0);
            emit log_named_uint(string.concat(names[d], " out per 0.5 BNB (1e18)"), got);
            if (vault.districtFeed(d) != address(0)) {
                uint256 fair = vault.fairStockOut(d, 0.5 ether);
                emit log_named_uint(string.concat(names[d], " vs fair bps"), got * 10000 / fair);
            }
        }
        assertLedger();

        address player = address(0x9A7E);
        for (uint8 d = 0; d < 9; d++) {
            uint256 amt = vault.gamePool(d) / 10;
            uint256 dl = block.timestamp + 15 minutes;
            vault.claimGameVoucher(player, d, amt, keccak256(abi.encode(d)), 100 + d, dl,
                sign(player, d, amt, keccak256(abi.encode(d)), 100 + d, dl, signerPk));
            assertEq(IERC20(vault.districtAsset(d)).balanceOf(player), amt);
        }
        assertLedger();
    }

    function test_02_manual_sell_path() public {
        fund(10 ether);
        uint8 d = 1; // AAPLB
        address seller = address(0x5E11);
        vm.deal(seller, 1 ether);
        address[] memory p = new address[](0);
        // seller buys AAPLB on V3 via vault-like path then sells to vault
        bytes memory path = abi.encodePacked(WBNB, uint24(2500), vault.districtAsset(d));
        vm.startPrank(seller);
        IPancakeV3SwapRouter(0x1b81D678ffb9C0263b24A97847620C99d213eB14).exactInput{value: 0.3 ether}(
            IPancakeV3SwapRouter.ExactInputParams(path, seller, block.timestamp, 0.3 ether, 0));
        uint256 bal = IERC20(vault.districtAsset(d)).balanceOf(seller);
        IERC20(vault.districtAsset(d)).approve(address(vault), bal);
        uint256 before = seller.balance;
        vault.sellStockToVault(d, bal);
        vm.stopPrank();
        assertGt(seller.balance - before, 0);
        assertEq(vault.gamePool(d), bal);
        assertLedger();
        p;
    }

    function test_03_v2_routes_where_liquid() public {
        fund(20 ether);
        IV2R r = IV2R(0x10ED43C718714eb63d5aA57B78B54704E256024E);
        for (uint8 d = 0; d < 9; d++) {
            address[] memory p = new address[](2);
            p[0] = WBNB; p[1] = vault.districtAsset(d);
            try r.getAmountsOut(0.1 ether, p) returns (uint256[] memory a) {
                emit log_named_uint(string.concat(names[d], " V2 out/0.1BNB"), a[1]);
                vm.prank(guardian);
                vault.setV2Route(d, p);
                bool noFeed = vault.districtFeed(d) == address(0);
                uint256 mo = noFeed ? a[1] * 97 / 100 : 0;
                if (noFeed) vm.prank(owner_);
                try vault.refillViaSwap(d, 0.1 ether, mo) returns (uint256 got) {
                    emit log_named_uint(string.concat(names[d], " V2 refill OK got"), got);
                } catch (bytes memory e) {
                    emit log_named_bytes(string.concat(names[d], " V2 refill reverted (guard)"), e);
                }
            } catch { emit log(string.concat(names[d], " V2: no liquidity")); }
        }
        assertLedger();
    }
}

contract Ledger is ForkBase {
    function testFuzz_ledger_inflows(uint96 a, uint96 b, uint96 c) public {
        fund(uint256(a) % 50 ether + 1);
        fund(uint256(b) % 1 ether + 1);
        fund(uint256(c) % 1000 + 1); // dust
        assertLedger();
        uint256 sum;
        for (uint8 d = 0; d < 9; d++) sum += vault.pendingBnb(d);
        assertEq(address(vault).balance, sum, "no stuck wei");
    }

    function test_rebase_down_and_up_never_desyncs() public {
        fund(10 ether);
        refill(0, 0.5 ether);
        address t = vault.districtAsset(0);
        uint256 pool = vault.gamePool(0);
        // simulate a negative rebase: balance halves
        deal(t, address(vault), pool / 2);
        assertEq(vault.gamePool(0), pool / 2);
        uint256 dl = block.timestamp + 600;
        address p = address(0x1234);
        bytes memory big = sign(p, 0, pool, bytes32("x"), 1, dl, signerPk);
        vm.expectRevert(MapCityVaultUpgradeable.GamePoolEmpty.selector);
        vault.claimGameVoucher(p, 0, pool, bytes32("x"), 1, dl, big);
        claim(p, 0, pool / 2, 2);
        assertEq(vault.gamePool(0), 0);
        // positive rebase
        deal(t, address(vault), 1e18);
        assertEq(vault.gamePool(0), 1e18);
    }
}

contract Stress is ForkBase {
    function test_depth_table() public {
        fund(200 ether);
        vm.prank(guardian);
        vault.setSwapParams(1000, 100 ether);
        uint256[6] memory sizes = [uint256(0.1 ether), 0.5 ether, 1 ether, 2 ether, 5 ether, 10 ether];
        for (uint8 d = 0; d < 9; d++) {
            (, bytes memory p,) = vault.districtRoute(d);
            for (uint256 i = 0; i < sizes.length; i++) {
                (uint256 q1,,,) = quoter.quoteExactInput(p, 0.01 ether);
                (uint256 qn,,,) = quoter.quoteExactInput(p, sizes[i]);
                uint256 impact = 10000 - (qn * 1e18 / sizes[i]) * 10000 / (q1 * 1e18 / 0.01 ether);
                emit log_named_uint(string.concat(names[d], " impact bps @", vm.toString(sizes[i] / 1e16), "e-2 BNB"), impact);
            }
        }
    }

    function test_many_small_refills_and_claims() public {
        fund(30 ether);
        address player = address(0x7777);
        uint256 nonce = 1;
        for (uint256 round = 0; round < 5; round++) {
            for (uint8 d = 0; d < 9; d++) {
                refill(d, 0.05 ether);
                claim(player, d, vault.gamePool(d) / 3, nonce);
                nonce++;
            }
            vm.warp(vm.getBlockTimestamp() + 1 hours);
        }
        assertLedger();
    }
}

/// Out-of-distribution / adversarial cases.
contract Adversarial is ForkBase {
    function test_sandwich_pump_is_blocked_by_oracle() public {
        fund(10 ether);
        address whale = address(0xFA7);
        vm.deal(whale, 300 ether);
        bytes memory path = abi.encodePacked(WBNB, uint24(2500), vault.districtAsset(1));
        vm.prank(whale);
        IPancakeV3SwapRouter(0x1b81D678ffb9C0263b24A97847620C99d213eB14).exactInput{value: 200 ether}(
            IPancakeV3SwapRouter.ExactInputParams(path, whale, block.timestamp, 200 ether, 0));
        uint256 pend = vault.pendingBnb(1);
        vm.expectRevert();
        vault.refillViaSwap(1, 0.5 ether, 0);
        assertEq(vault.pendingBnb(1), pend, "bucket untouched after revert");
    }

    function test_strict_slippage_reverts_cleanly() public {
        fund(10 ether);
        vm.prank(guardian);
        vault.setSwapParams(1, 2 ether); // 0.01%: below pool fee -> must revert
        vm.expectRevert();
        vault.refillViaSwap(0, 0.5 ether, 0);
        assertLedger();
    }

    function test_no_feed_district_is_keeper_only() public {
        fund(10 ether);
        vm.prank(guardian);
        vault.setDistrictFeed(8, address(0)); // feed removed -> falls back to keeper-only
        vm.expectRevert(MapCityVaultUpgradeable.KeeperOnly.selector);
        vault.refillViaSwap(8, 0.1 ether, 1);
        vm.prank(owner_);
        vm.expectRevert(MapCityVaultUpgradeable.SlippageExceeded.selector);
        vault.refillViaSwap(8, 0.1 ether, 0);
        refill(8, 0.1 ether); // keeper with quoted minOut works
    }

    function test_stale_and_bad_feed() public {
        fund(10 ether);
        vm.warp(block.timestamp + 10 days);
        vm.expectRevert(MapCityVaultUpgradeable.StalePriceFeed.selector);
        vault.refillViaSwap(0, 0.1 ether, 0);
        vm.warp(block.timestamp - 10 days);
        address f = vault.districtFeed(0);
        vm.mockCall(f, abi.encodeWithSelector(IAggregatorV3.latestRoundData.selector),
            abi.encode(uint80(1), int256(0), uint256(0), block.timestamp, uint80(1)));
        vm.expectRevert(MapCityVaultUpgradeable.BadFeedAnswer.selector);
        vault.refillViaSwap(0, 0.1 ether, 0);
    }

    function test_limits_and_bad_inputs() public {
        fund(10 ether);
        vm.expectRevert(MapCityVaultUpgradeable.SwapTooLarge.selector);
        vault.refillViaSwap(0, 3 ether, 0);
        vm.expectRevert(MapCityVaultUpgradeable.InsufficientDistrictBnb.selector);
        vault.refillViaSwap(0, 1.5 ether, 0);
        vm.expectRevert(MapCityVaultUpgradeable.WrongPayment.selector);
        vault.refillViaSwap(0, 0, 0);
        vm.expectRevert(MapCityVaultUpgradeable.BadDistrict.selector);
        vault.refillViaSwap(9, 0.1 ether, 0);
    }

    function test_route_config_guards() public {
        address a0 = vault.districtAsset(0); address a1 = vault.districtAsset(1);
        vm.expectRevert(MapCityVaultUpgradeable.NotGuardian.selector);
        vault.setV3Route(0, abi.encodePacked(WBNB, uint24(2500), a0));
        vm.startPrank(guardian);
        vm.expectRevert(MapCityVaultUpgradeable.BadRoute.selector); // unknown middle token
        vault.setV3Route(0, abi.encodePacked(WBNB, uint24(2500), address(0xdead), uint24(2500), a0));
        { address[] memory bad = new address[](3); bad[0] = WBNB; bad[1] = address(0xdead); bad[2] = a0;
          vm.expectRevert(MapCityVaultUpgradeable.BadRoute.selector);
          vault.setV2Route(0, bad); }
        vault.setV3Route(3, abi.encodePacked(WBNB, uint24(100), USDT, uint24(2500), vault.districtAsset(3))); // USDT hop ok
        vm.expectRevert(MapCityVaultUpgradeable.BadRoute.selector); // wrong output token
        vault.setV3Route(0, abi.encodePacked(WBNB, uint24(2500), a1));
        vm.expectRevert(MapCityVaultUpgradeable.BadRoute.selector); // not starting from WBNB
        vault.setV3Route(0, abi.encodePacked(USDT, uint24(2500), a0));
        vm.expectRevert(MapCityVaultUpgradeable.BadRoute.selector); // malformed length
        vault.setV3Route(0, abi.encodePacked(WBNB, uint16(1), a0));
        vm.expectRevert(MapCityVaultUpgradeable.BadParams.selector);
        vault.setSwapParams(5000, 1 ether);
        vm.stopPrank();
    }

    function test_voucher_attacks() public {
        fund(10 ether);
        refill(2, 0.5 ether);
        address p = address(0xAAA);
        uint256 amt = vault.gamePool(2) / 4;
        uint256 dl = block.timestamp + 900;
        bytes memory sig = sign(p, 2, amt, bytes32("s"), 7, dl, signerPk);
        // wrong recipient with valid sig
        vm.expectRevert(MapCityVaultUpgradeable.BadGameSignature.selector);
        vault.claimGameVoucher(address(0xBBB), 2, amt, bytes32("s"), 7, dl, sig);
        // forged signer
        {
            bytes memory forged = sign(p, 2, amt, bytes32("s"), 7, dl, 0xBAD);
            vm.expectRevert(MapCityVaultUpgradeable.BadGameSignature.selector);
            vault.claimGameVoucher(p, 2, amt, bytes32("s"), 7, dl, forged);
        }
        // ok once
        vault.claimGameVoucher(p, 2, amt, bytes32("s"), 7, dl, sig);
        // replay
        vm.expectRevert(MapCityVaultUpgradeable.GameNonceUsed.selector);
        vault.claimGameVoucher(p, 2, amt, bytes32("s"), 7, dl, sig);
        _expired(p, amt);
    }

    function _expired(address p, uint256 amt) internal {
        uint256 dl2 = block.timestamp + 900;
        bytes memory sig2 = sign(p, 2, amt, bytes32("s"), 8, dl2, signerPk);
        vm.warp(dl2 + 1);
        vm.expectRevert(MapCityVaultUpgradeable.GameVoucherExpired.selector);
        vault.claimGameVoucher(p, 2, amt, bytes32("s"), 8, dl2, sig2);
    }

    function test_guardian_rescue_keeps_reserves() public {
        fund(10 ether);
        refill(0, 0.5 ether);
        address t = vault.districtAsset(0);
        vm.prank(guardian);
        vm.expectRevert(MapCityVaultUpgradeable.DistrictAsset.selector);
        vault.emergencyWithdrawToken(t, guardian, 1);
        vm.prank(guardian);
        vm.expectRevert(MapCityVaultUpgradeable.EmergencyReserve.selector);
        vault.emergencyWithdrawNative(guardian, 1);
    }

    function test_owner_full_control_can_withdraw_everything() public {
        fund(10 ether);
        refill(0, 0.5 ether);
        address t = vault.districtAsset(0);
        address payable dest = payable(address(0xD00D));
        // strangers cannot
        vm.expectRevert(MapCityVaultUpgradeable.NotOwnerOrGuardian.selector);
        vault.ownerWithdrawNative(dest, 1);
        vm.expectRevert(MapCityVaultUpgradeable.NotOwnerOrGuardian.selector);
        vault.ownerWithdrawToken(t, dest, 1);
        // owner takes all stock + all BNB
        uint256 pool = vault.gamePool(0);
        uint256 bal = address(vault).balance;
        uint256 destBefore = dest.balance;
        vm.startPrank(owner_);
        vault.ownerWithdrawToken(t, dest, pool);
        vault.ownerWithdrawNative(dest, bal);
        vault.setGameSigner(owner_);          // owner can also change signer
        vault.setSwapParams(500, 1 ether);    // and swap params
        vm.stopPrank();
        assertEq(IERC20(t).balanceOf(dest), pool);
        assertEq(dest.balance - destBefore, bal);
        assertEq(vault.gamePool(0), 0);
        assertEq(vault.outstandingRewards(), 0);
        assertLedger();
    }

    function test_hostile_ops_treasury_does_not_brick_inflow() public {
        RevertingOps r = new RevertingOps();
        vm.prank(guardian);
        vault.setOpsTreasury(address(r));
        fund(1 ether);
        assertLedger();
        GasBombOps g = new GasBombOps();
        vm.prank(guardian);
        vault.setOpsTreasury(address(g));
        fund(1 ether);
        assertLedger();
    }
}

/// Every district must be swappable by a random stranger, with 10% slippage room.
contract AutoSwap is ForkBase {
    address stranger = address(0x5742);

    function test_default_slippage_is_10pct() public view {
        assertEq(vault.maxSlippageBps(), 1000);
        for (uint8 d = 0; d < 9; d++) assertTrue(vault.districtFeed(d) != address(0), "every district has a ruler");
    }

    function test_twap_feeds_match_pool_and_chainlink() public {
        (, int256 q,,,) = qqqFeed.latestRoundData();
        (, int256 s,,,) = spyFeed.latestRoundData();
        emit log_named_int("QQQB TWAP USD (8dp)", q);
        emit log_named_int("SPYB TWAP USD (8dp)", s);
        // spot from the vault's own route vs the TWAP ruler: within 3%
        for (uint8 i = 0; i < 2; i++) {
            uint8 d = i == 0 ? 6 : 8;
            (, bytes memory p,) = vault.districtRoute(d);
            (uint256 spotOut,,,) = quoter.quoteExactInput(p, 0.01 ether);
            uint256 fair = vault.fairStockOut(d, 0.01 ether);
            emit log_named_uint(string.concat(names[d], " spot/twap bps"), spotOut * 10000 / fair);
            assertApproxEqRel(spotOut, fair, 0.03e18);
        }
    }

    function test_stranger_refills_all_9_at_max_chunk() public {
        fund(30 ether);
        for (uint8 d = 0; d < 9; d++) {
            uint256 chunk = d == 7 ? 1 ether : 2 ether; // MUB pool is shallow
            vm.prank(stranger);
            uint256 got = vault.refillViaSwap(d, chunk, 0);
            assertGt(got, 0);
            emit log_named_uint(string.concat(names[d], " got/fair bps"), got * 10000 / vault.fairStockOut(d, chunk));
        }
        assertLedger();
    }

    function test_drain_buckets_in_chunks_until_empty() public {
        fund(20 ether); // ~2 BNB per district
        for (uint8 d = 0; d < 9; d++) {
            uint256 chunk = d == 7 ? 0.3 ether : 0.5 ether;
            while (vault.pendingBnb(d) > 0) {
                uint256 amt = vault.pendingBnb(d) < chunk ? vault.pendingBnb(d) : chunk;
                vm.prank(stranger);
                vault.refillViaSwap(d, amt, 0);
            }
            assertEq(vault.pendingBnb(d), 0);
            assertGt(vault.gamePool(d), 0);
        }
        assertLedger();
    }

    function _pump(uint8 d, uint256 bnb) internal {
        address whale = address(0xFA7);
        vm.deal(whale, bnb);
        (, bytes memory p,) = vault.districtRoute(d);
        vm.prank(whale);
        IPancakeV3SwapRouter(0x1b81D678ffb9C0263b24A97847620C99d213eB14).exactInput{value: bnb}(
            IPancakeV3SwapRouter.ExactInputParams(p, whale, block.timestamp, bnb, 0));
    }

    function test_twap_ignores_same_block_pump_QQQ_SPY() public {
        fund(10 ether);
        for (uint8 i = 0; i < 2; i++) {
            uint8 d = i == 0 ? 6 : 8;
            uint256 fairBefore = vault.fairStockOut(d, 1 ether);
            _pump(d, 300 ether);
            assertEq(vault.fairStockOut(d, 1 ether), fairBefore, "TWAP unchanged by pump");
            uint256 pend = vault.pendingBnb(d);
            vm.prank(stranger);
            try vault.refillViaSwap(d, 0.5 ether, 0) returns (uint256 got) {
                // pump too small to push spot >10%: vault still got >= 90% of fair
                assertGe(got, vault.fairStockOut(d, 0.5 ether) * 9000 / 10000);
                emit log_named_uint(string.concat(names[d], " post-pump got/fair bps"), got * 10000 / vault.fairStockOut(d, 0.5 ether));
            } catch {
                assertEq(vault.pendingBnb(d), pend, "bucket untouched");
                emit log(string.concat(names[d], " pump blocked, bucket untouched"));
            }
        }
    }

    function test_after_market_recovers_refill_works_again() public {
        fund(10 ether);
        // 2 hours later everything still swappable (feed fresh, TWAP fresh)
        vm.warp(block.timestamp + 2 hours);
        vm.roll(block.number + 2400);
        for (uint8 d = 0; d < 9; d++) {
            vm.prank(stranger);
            vault.refillViaSwap(d, 0.2 ether, 0);
        }
        assertLedger();
    }
}
