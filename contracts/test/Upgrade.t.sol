// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;
import "forge-std/Test.sol";
import "../src/MapCityVault.sol";

contract UpgradeTest is Test {
    address dev = address(0xD3);
    address guardian = 0x9e27098dcD8844bcc6287a557E0b4D09C86B8a4b;
    MapCityBeaconFactory f;
    function setUp() public { vm.chainId(56); f = new MapCityBeaconFactory(dev); }

    function test_ownerCanUpgrade() public {
        address impl = address(new MapCityVaultUpgradeable());
        vm.prank(dev); f.upgradeVaultImplementation(impl);
        assertEq(f.beaconImplementation(), impl);
    }
    function test_guardianCanUpgrade() public {
        address impl = address(new MapCityVaultUpgradeable());
        vm.prank(guardian); f.upgradeVaultImplementation(impl);
        assertEq(f.beaconImplementation(), impl);
    }
    function test_strangerCannotUpgrade() public {
        address impl = address(new MapCityVaultUpgradeable());
        vm.prank(address(0xBAD));
        vm.expectRevert(MapCityBeaconFactory.OnlyGuardian.selector);
        f.upgradeVaultImplementation(impl);
    }
    function test_ownerCanLock() public {
        vm.prank(dev); f.lockVaultUpgrades();
        assertTrue(f.isVaultUpgradesLocked());
    }
}

contract SchemaTest is Test {
    function test_schemaReadable() public {
        vm.chainId(56);
        MapCityVaultUpgradeable v = new MapCityVaultUpgradeable();
        VaultUISchema_1 memory s = v.vaultUISchema();
        assertEq(s.methods.length, 4);
        assertEq(s.methods[0].outputs.length, 5);
        assertEq(s.methods[3].inputs.length, 7);
        (uint256 a,,,,) = v.vaultStats();
        assertEq(a, 0);
    }
}
