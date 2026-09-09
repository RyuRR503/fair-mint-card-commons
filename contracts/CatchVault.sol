// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// Minimal ERC-20 surface the vault needs.
interface IERC20 {
    function transfer(address to, uint256 value) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

/**
 * CatchVault
 *
 * Holds tokenised stock fragments and releases them only against a voucher
 * signed by the claim server. Nothing is minted here: the vault can never pay
 * out more than it already holds.
 *
 * Flow:
 *   1. player walks to a real place and hits claim
 *   2. server re-checks the GPS evidence and signs an EIP-712 voucher
 *   3. player (or any relayer) submits claim(voucher, signature)
 *   4. vault verifies the signer, burns the nonce, transfers the tokens
 */
contract CatchVault {
    struct Voucher {
        address to; // recipient wallet
        address token; // fragment token being paid out
        uint256 amount; // amount in token decimals
        bytes32 spawnId; // keccak256 of the spawn id
        uint256 nonce; // unique per voucher, burned on use
        uint256 deadline; // unix seconds
    }

    bytes32 private constant VOUCHER_TYPEHASH =
        keccak256(
            "Voucher(address to,address token,uint256 amount,bytes32 spawnId,uint256 nonce,uint256 deadline)"
        );

    bytes32 private constant EIP712_DOMAIN_TYPEHASH =
        keccak256(
            "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
        );

    string public constant NAME = "Catch";
    string public constant VERSION = "1";

    address public owner;
    address public signer;
    bool public paused;

    mapping(uint256 => bool) public usedNonce;
    mapping(address => bool) public allowedToken;

    event Claimed(
        address indexed to,
        address indexed token,
        uint256 amount,
        bytes32 indexed spawnId,
        uint256 nonce
    );
    event SignerChanged(address indexed signer);
    event PausedChanged(bool paused);
    event TokenAllowed(address indexed token, bool allowed);
    event OwnerChanged(address indexed owner);
    event Withdrawn(address indexed token, address indexed to, uint256 amount);

    error NotOwner();
    error Paused();
    error Expired();
    error NonceUsed();
    error BadSignature();
    error TokenNotAllowed();
    error TransferFailed();

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    constructor(address _signer) {
        owner = msg.sender;
        signer = _signer;
        emit OwnerChanged(msg.sender);
        emit SignerChanged(_signer);
    }

    /* ------------------------------------------------------------- claim */

    function claim(Voucher calldata v, bytes calldata sig) external {
        if (paused) revert Paused();
        if (block.timestamp > v.deadline) revert Expired();
        if (usedNonce[v.nonce]) revert NonceUsed();
        if (!allowedToken[v.token]) revert TokenNotAllowed();
        if (_recover(_digest(v), sig) != signer) revert BadSignature();

        usedNonce[v.nonce] = true;

        if (!IERC20(v.token).transfer(v.to, v.amount)) revert TransferFailed();

        emit Claimed(v.to, v.token, v.amount, v.spawnId, v.nonce);
    }

    /* --------------------------------------------------------------- view */

    function domainSeparator() public view returns (bytes32) {
        return
            keccak256(
                abi.encode(
                    EIP712_DOMAIN_TYPEHASH,
                    keccak256(bytes(NAME)),
                    keccak256(bytes(VERSION)),
                    block.chainid,
                    address(this)
                )
            );
    }

    function reserveOf(address token) external view returns (uint256) {
        return IERC20(token).balanceOf(address(this));
    }

    /* -------------------------------------------------------------- admin */

    function setSigner(address _signer) external onlyOwner {
        signer = _signer;
        emit SignerChanged(_signer);
    }

    function setPaused(bool _paused) external onlyOwner {
        paused = _paused;
        emit PausedChanged(_paused);
    }

    function setToken(address token, bool allowed) external onlyOwner {
        allowedToken[token] = allowed;
        emit TokenAllowed(token, allowed);
    }

    function setTokens(address[] calldata tokens, bool allowed) external onlyOwner {
        for (uint256 i = 0; i < tokens.length; i++) {
            allowedToken[tokens[i]] = allowed;
            emit TokenAllowed(tokens[i], allowed);
        }
    }

    function withdraw(address token, address to, uint256 amount) external onlyOwner {
        if (!IERC20(token).transfer(to, amount)) revert TransferFailed();
        emit Withdrawn(token, to, amount);
    }

    function transferOwnership(address newOwner) external onlyOwner {
        owner = newOwner;
        emit OwnerChanged(newOwner);
    }

    /* ------------------------------------------------------------ internal */

    function _digest(Voucher calldata v) internal view returns (bytes32) {
        bytes32 structHash = keccak256(
            abi.encode(
                VOUCHER_TYPEHASH,
                v.to,
                v.token,
                v.amount,
                v.spawnId,
                v.nonce,
                v.deadline
            )
        );
        return keccak256(abi.encodePacked("\x19\x01", domainSeparator(), structHash));
    }

    function _recover(bytes32 digest, bytes calldata sig) internal pure returns (address) {
        if (sig.length != 65) revert BadSignature();
        bytes32 r;
        bytes32 s;
        uint8 v;
        assembly {
            r := calldataload(sig.offset)
            s := calldataload(add(sig.offset, 32))
            v := byte(0, calldataload(add(sig.offset, 64)))
        }
        if (v < 27) v += 27;
        address a = ecrecover(digest, v, r, s);
        if (a == address(0)) revert BadSignature();
        return a;
    }
}
