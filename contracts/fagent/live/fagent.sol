// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13 ^0.8.20 ^0.8.24;

// lib/openzeppelin-contracts/contracts/utils/Address.sol

// OpenZeppelin Contracts (last updated v5.0.0) (utils/Address.sol)

/**
 * @dev Collection of functions related to the address type
 */
library Address {
    /**
     * @dev The ETH balance of the account is not enough to perform the operation.
     */
    error AddressInsufficientBalance(address account);

    /**
     * @dev There's no code at `target` (it is not a contract).
     */
    error AddressEmptyCode(address target);

    /**
     * @dev A call to an address target failed. The target may have reverted.
     */
    error FailedInnerCall();

    /**
     * @dev Replacement for Solidity's `transfer`: sends `amount` wei to
     * `recipient`, forwarding all available gas and reverting on errors.
     *
     * https://eips.ethereum.org/EIPS/eip-1884[EIP1884] increases the gas cost
     * of certain opcodes, possibly making contracts go over the 2300 gas limit
     * imposed by `transfer`, making them unable to receive funds via
     * `transfer`. {sendValue} removes this limitation.
     *
     * https://consensys.net/diligence/blog/2019/09/stop-using-soliditys-transfer-now/[Learn more].
     *
     * IMPORTANT: because control is transferred to `recipient`, care must be
     * taken to not create reentrancy vulnerabilities. Consider using
     * {ReentrancyGuard} or the
     * https://solidity.readthedocs.io/en/v0.8.20/security-considerations.html#use-the-checks-effects-interactions-pattern[checks-effects-interactions pattern].
     */
    function sendValue(address payable recipient, uint256 amount) internal {
        if (address(this).balance < amount) {
            revert AddressInsufficientBalance(address(this));
        }

        (bool success, ) = recipient.call{value: amount}("");
        if (!success) {
            revert FailedInnerCall();
        }
    }

    /**
     * @dev Performs a Solidity function call using a low level `call`. A
     * plain `call` is an unsafe replacement for a function call: use this
     * function instead.
     *
     * If `target` reverts with a revert reason or custom error, it is bubbled
     * up by this function (like regular Solidity function calls). However, if
     * the call reverted with no returned reason, this function reverts with a
     * {FailedInnerCall} error.
     *
     * Returns the raw returned data. To convert to the expected return value,
     * use https://solidity.readthedocs.io/en/latest/units-and-global-variables.html?highlight=abi.decode#abi-encoding-and-decoding-functions[`abi.decode`].
     *
     * Requirements:
     *
     * - `target` must be a contract.
     * - calling `target` with `data` must not revert.
     */
    function functionCall(address target, bytes memory data) internal returns (bytes memory) {
        return functionCallWithValue(target, data, 0);
    }

    /**
     * @dev Same as {xref-Address-functionCall-address-bytes-}[`functionCall`],
     * but also transferring `value` wei to `target`.
     *
     * Requirements:
     *
     * - the calling contract must have an ETH balance of at least `value`.
     * - the called Solidity function must be `payable`.
     */
    function functionCallWithValue(address target, bytes memory data, uint256 value) internal returns (bytes memory) {
        if (address(this).balance < value) {
            revert AddressInsufficientBalance(address(this));
        }
        (bool success, bytes memory returndata) = target.call{value: value}(data);
        return verifyCallResultFromTarget(target, success, returndata);
    }

    /**
     * @dev Same as {xref-Address-functionCall-address-bytes-}[`functionCall`],
     * but performing a static call.
     */
    function functionStaticCall(address target, bytes memory data) internal view returns (bytes memory) {
        (bool success, bytes memory returndata) = target.staticcall(data);
        return verifyCallResultFromTarget(target, success, returndata);
    }

    /**
     * @dev Same as {xref-Address-functionCall-address-bytes-}[`functionCall`],
     * but performing a delegate call.
     */
    function functionDelegateCall(address target, bytes memory data) internal returns (bytes memory) {
        (bool success, bytes memory returndata) = target.delegatecall(data);
        return verifyCallResultFromTarget(target, success, returndata);
    }

    /**
     * @dev Tool to verify that a low level call to smart-contract was successful, and reverts if the target
     * was not a contract or bubbling up the revert reason (falling back to {FailedInnerCall}) in case of an
     * unsuccessful call.
     */
    function verifyCallResultFromTarget(
        address target,
        bool success,
        bytes memory returndata
    ) internal view returns (bytes memory) {
        if (!success) {
            _revert(returndata);
        } else {
            // only check if target is a contract if the call was successful and the return data is empty
            // otherwise we already know that it was a contract
            if (returndata.length == 0 && target.code.length == 0) {
                revert AddressEmptyCode(target);
            }
            return returndata;
        }
    }

    /**
     * @dev Tool to verify that a low level call was successful, and reverts if it wasn't, either by bubbling the
     * revert reason or with a default {FailedInnerCall} error.
     */
    function verifyCallResult(bool success, bytes memory returndata) internal pure returns (bytes memory) {
        if (!success) {
            _revert(returndata);
        } else {
            return returndata;
        }
    }

    /**
     * @dev Reverts with returndata if present. Otherwise reverts with {FailedInnerCall}.
     */
    function _revert(bytes memory returndata) private pure {
        // Look for revert reason and bubble it up if present
        if (returndata.length > 0) {
            // The easiest way to bubble the revert reason is using memory via assembly
            assembly ("memory-safe") {
                let returndata_size := mload(returndata)
                revert(add(32, returndata), returndata_size)
            }
        } else {
            revert FailedInnerCall();
        }
    }
}

// lib/openzeppelin-contracts/contracts/utils/Context.sol

// OpenZeppelin Contracts (last updated v5.0.1) (utils/Context.sol)

pragma solidity ^0.8.20;

/**
 * @dev Provides information about the current execution context, including the
 * sender of the transaction and its data. While these are generally available
 * via msg.sender and msg.data, they should not be accessed in such a direct
 * manner, since when dealing with meta-transactions the account sending and
 * paying for execution may not be the actual sender (as far as an application
 * is concerned).
 *
 * This contract is only required for intermediate, library-like contracts.
 */
abstract contract Context {
    function _msgSender() internal view virtual returns (address) {
        return msg.sender;
    }

    function _msgData() internal view virtual returns (bytes calldata) {
        return msg.data;
    }

    function _contextSuffixLength() internal view virtual returns (uint256) {
        return 0;
    }
}

// lib/openzeppelin-contracts/contracts/access/IAccessControl.sol

// OpenZeppelin Contracts (last updated v5.0.0) (access/IAccessControl.sol)

pragma solidity ^0.8.20;

/**
 * @dev External interface of AccessControl declared to support ERC165 detection.
 */
interface IAccessControl {
    /**
     * @dev The `account` is missing a role.
     */
    error AccessControlUnauthorizedAccount(address account, bytes32 neededRole);

    /**
     * @dev The caller of a function is not the expected one.
     *
     * NOTE: Don't confuse with {AccessControlUnauthorizedAccount}.
     */
    error AccessControlBadConfirmation();

    /**
     * @dev Emitted when `newAdminRole` is set as ``role``'s admin role, replacing `previousAdminRole`
     *
     * `DEFAULT_ADMIN_ROLE` is the starting admin for all roles, despite
     * {RoleAdminChanged} not being emitted signaling this.
     */
    event RoleAdminChanged(bytes32 indexed role, bytes32 indexed previousAdminRole, bytes32 indexed newAdminRole);

    /**
     * @dev Emitted when `account` is granted `role`.
     *
     * `sender` is the account that originated the contract call, an admin role
     * bearer except when using {AccessControl-_setupRole}.
     */
    event RoleGranted(bytes32 indexed role, address indexed account, address indexed sender);

    /**
     * @dev Emitted when `account` is revoked `role`.
     *
     * `sender` is the account that originated the contract call:
     *   - if using `revokeRole`, it is the admin role bearer
     *   - if using `renounceRole`, it is the role bearer (i.e. `account`)
     */
    event RoleRevoked(bytes32 indexed role, address indexed account, address indexed sender);

    /**
     * @dev Returns `true` if `account` has been granted `role`.
     */
    function hasRole(bytes32 role, address account) external view returns (bool);

    /**
     * @dev Returns the admin role that controls `role`. See {grantRole} and
     * {revokeRole}.
     *
     * To change a role's admin, use {AccessControl-_setRoleAdmin}.
     */
    function getRoleAdmin(bytes32 role) external view returns (bytes32);

    /**
     * @dev Grants `role` to `account`.
     *
     * If `account` had not been already granted `role`, emits a {RoleGranted}
     * event.
     *
     * Requirements:
     *
     * - the caller must have ``role``'s admin role.
     */
    function grantRole(bytes32 role, address account) external;

    /**
     * @dev Revokes `role` from `account`.
     *
     * If `account` had been granted `role`, emits a {RoleRevoked} event.
     *
     * Requirements:
     *
     * - the caller must have ``role``'s admin role.
     */
    function revokeRole(bytes32 role, address account) external;

    /**
     * @dev Revokes `role` from the calling account.
     *
     * Roles are often managed via {grantRole} and {revokeRole}: this function's
     * purpose is to provide a mechanism for accounts to lose their privileges
     * if they are compromised (such as when a trusted device is misplaced).
     *
     * If the calling account had been granted `role`, emits a {RoleRevoked}
     * event.
     *
     * Requirements:
     *
     * - the caller must be `callerConfirmation`.
     */
    function renounceRole(bytes32 role, address callerConfirmation) external;
}

// lib/openzeppelin-contracts/contracts/proxy/beacon/IBeacon.sol

// OpenZeppelin Contracts (last updated v5.0.0) (proxy/beacon/IBeacon.sol)

pragma solidity ^0.8.20;

/**
 * @dev This is the interface that {BeaconProxy} expects of its beacon.
 */
interface IBeacon {
    /**
     * @dev Must return an address that can be used as a delegate call target.
     *
     * {UpgradeableBeacon} will check that this address is a contract.
     */
    function implementation() external view returns (address);
}

// lib/openzeppelin-contracts/contracts/utils/introspection/IERC165.sol

// OpenZeppelin Contracts (last updated v5.0.0) (utils/introspection/IERC165.sol)

pragma solidity ^0.8.20;

/**
 * @dev Interface of the ERC165 standard, as defined in the
 * https://eips.ethereum.org/EIPS/eip-165[EIP].
 *
 * Implementers can declare support of contract interfaces, which can then be
 * queried by others ({ERC165Checker}).
 *
 * For an implementation, see {ERC165}.
 */
interface IERC165 {
    /**
     * @dev Returns true if this contract implements the interface defined by
     * `interfaceId`. See the corresponding
     * https://eips.ethereum.org/EIPS/eip-165#how-interfaces-are-identified[EIP section]
     * to learn more about how these ids are created.
     *
     * This function call must use less than 30 000 gas.
     */
    function supportsInterface(bytes4 interfaceId) external view returns (bool);
}

// lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol

// OpenZeppelin Contracts (last updated v5.0.0) (token/ERC20/IERC20.sol)

pragma solidity ^0.8.20;

/**
 * @dev Interface of the ERC20 standard as defined in the EIP.
 */
interface IERC20 {
    /**
     * @dev Emitted when `value` tokens are moved from one account (`from`) to
     * another (`to`).
     *
     * Note that `value` may be zero.
     */
    event Transfer(address indexed from, address indexed to, uint256 value);

    /**
     * @dev Emitted when the allowance of a `spender` for an `owner` is set by
     * a call to {approve}. `value` is the new allowance.
     */
    event Approval(address indexed owner, address indexed spender, uint256 value);

    /**
     * @dev Returns the value of tokens in existence.
     */
    function totalSupply() external view returns (uint256);

    /**
     * @dev Returns the value of tokens owned by `account`.
     */
    function balanceOf(address account) external view returns (uint256);

    /**
     * @dev Moves a `value` amount of tokens from the caller's account to `to`.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transfer(address to, uint256 value) external returns (bool);

    /**
     * @dev Returns the remaining number of tokens that `spender` will be
     * allowed to spend on behalf of `owner` through {transferFrom}. This is
     * zero by default.
     *
     * This value changes when {approve} or {transferFrom} are called.
     */
    function allowance(address owner, address spender) external view returns (uint256);

    /**
     * @dev Sets a `value` amount of tokens as the allowance of `spender` over the
     * caller's tokens.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * IMPORTANT: Beware that changing an allowance with this method brings the risk
     * that someone may use both the old and the new allowance by unfortunate
     * transaction ordering. One possible solution to mitigate this race
     * condition is to first reduce the spender's allowance to 0 and set the
     * desired value afterwards:
     * https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
     *
     * Emits an {Approval} event.
     */
    function approve(address spender, uint256 value) external returns (bool);

    /**
     * @dev Moves a `value` amount of tokens from `from` to `to` using the
     * allowance mechanism. `value` is then deducted from the caller's
     * allowance.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transferFrom(address from, address to, uint256 value) external returns (bool);
}

// lib/openzeppelin-contracts/contracts/token/ERC20/extensions/IERC20Permit.sol

// OpenZeppelin Contracts (last updated v5.0.0) (token/ERC20/extensions/IERC20Permit.sol)

pragma solidity ^0.8.20;

/**
 * @dev Interface of the ERC20 Permit extension allowing approvals to be made via signatures, as defined in
 * https://eips.ethereum.org/EIPS/eip-2612[EIP-2612].
 *
 * Adds the {permit} method, which can be used to change an account's ERC20 allowance (see {IERC20-allowance}) by
 * presenting a message signed by the account. By not relying on {IERC20-approve}, the token holder account doesn't
 * need to send a transaction, and thus is not required to hold Ether at all.
 *
 * ==== Security Considerations
 *
 * There are two important considerations concerning the use of `permit`. The first is that a valid permit signature
 * expresses an allowance, and it should not be assumed to convey additional meaning. In particular, it should not be
 * considered as an intention to spend the allowance in any specific way. The second is that because permits have
 * built-in replay protection and can be submitted by anyone, they can be frontrun. A protocol that uses permits should
 * take this into consideration and allow a `permit` call to fail. Combining these two aspects, a pattern that may be
 * generally recommended is:
 *
 * ```solidity
 * function doThingWithPermit(..., uint256 value, uint256 deadline, uint8 v, bytes32 r, bytes32 s) public {
 *     try token.permit(msg.sender, address(this), value, deadline, v, r, s) {} catch {}
 *     doThing(..., value);
 * }
 *
 * function doThing(..., uint256 value) public {
 *     token.safeTransferFrom(msg.sender, address(this), value);
 *     ...
 * }
 * ```
 *
 * Observe that: 1) `msg.sender` is used as the owner, leaving no ambiguity as to the signer intent, and 2) the use of
 * `try/catch` allows the permit to fail and makes the code tolerant to frontrunning. (See also
 * {SafeERC20-safeTransferFrom}).
 *
 * Additionally, note that smart contract wallets (such as Argent or Safe) are not able to produce permit signatures, so
 * contracts should have entry points that don't rely on permit.
 */
interface IERC20Permit {
    /**
     * @dev Sets `value` as the allowance of `spender` over ``owner``'s tokens,
     * given ``owner``'s signed approval.
     *
     * IMPORTANT: The same issues {IERC20-approve} has related to transaction
     * ordering also apply here.
     *
     * Emits an {Approval} event.
     *
     * Requirements:
     *
     * - `spender` cannot be the zero address.
     * - `deadline` must be a timestamp in the future.
     * - `v`, `r` and `s` must be a valid `secp256k1` signature from `owner`
     * over the EIP712-formatted function arguments.
     * - the signature must use ``owner``'s current nonce (see {nonces}).
     *
     * For more information on the signature format, see the
     * https://eips.ethereum.org/EIPS/eip-2612#specification[relevant EIP
     * section].
     *
     * CAUTION: See Security Considerations above.
     */
    function permit(
        address owner,
        address spender,
        uint256 value,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external;

    /**
     * @dev Returns the current nonce for `owner`. This value must be
     * included whenever a signature is generated for {permit}.
     *
     * Every successful call to {permit} increases ``owner``'s nonce by one. This
     * prevents a signature from being used multiple times.
     */
    function nonces(address owner) external view returns (uint256);

    /**
     * @dev Returns the domain separator used in the encoding of the signature for {permit}, as defined by {EIP712}.
     */
    // solhint-disable-next-line func-name-mixedcase
    function DOMAIN_SEPARATOR() external view returns (bytes32);
}

// lib/openzeppelin-contracts/contracts/token/ERC721/IERC721Receiver.sol

// OpenZeppelin Contracts (last updated v5.0.0) (token/ERC721/IERC721Receiver.sol)

pragma solidity ^0.8.20;

/**
 * @title ERC721 token receiver interface
 * @dev Interface for any contract that wants to support safeTransfers
 * from ERC721 asset contracts.
 */
interface IERC721Receiver {
    /**
     * @dev Whenever an {IERC721} `tokenId` token is transferred to this contract via {IERC721-safeTransferFrom}
     * by `operator` from `from`, this function is called.
     *
     * It must return its Solidity selector to confirm the token transfer.
     * If any other value is returned or the interface is not implemented by the recipient, the transfer will be
     * reverted.
     *
     * The selector can be obtained in Solidity with `IERC721Receiver.onERC721Received.selector`.
     */
    function onERC721Received(
        address operator,
        address from,
        uint256 tokenId,
        bytes calldata data
    ) external returns (bytes4);
}

// src/flap/IVaultSchemasV1.sol

/// @title IVaultSchemasV1
/// @author The Flap Team
/// @notice Shared struct definitions used by VaultFactory and Vault UI schema methods.
///
/// @dev  ── WHY THIS FILE EXISTS ──────────────────────────────────────────────
///
/// The Flap protocol allows anyone to create new vault factories.  Any
/// contract that implements `VaultFactoryBaseV2` can be used to launch
/// tokens via VaultPortal — no on-chain registration is required.
/// Each factory decodes the opaque `vaultData` bytes in
/// `newVault()` differently, and each vault exposes a unique set of
/// user-facing view and write methods.
///
/// Existing vault types (FlapXVault, SplitVault, SnowBallVault,
/// BlackHoleVault) already have purpose-built UIs.  However, the protocol
/// is designed to be extended — any third-party developer can create a new
/// vault factory and vault implementation without modifying the core
/// contracts or the UI codebase.
///
/// Without a self-describing mechanism, a new vault type would require a
/// custom UI to be built and deployed before users could interact with it.
/// The structs in this file solve this problem by providing an on-chain
/// schema that enables **automatic UI generation for any future vault type**.
///
/// Both `VaultFactoryBaseV2.vaultDataSchema()` and
/// `VaultBaseV2.vaultUISchema()` return structs defined here, allowing a
/// generic UI to render creation forms and vault interaction pages for
/// vault types that did not exist when the UI was built.
///
///
/// ── STRUCT CONSOLIDATION ───────────────────────────────────────────────────
///
/// `FieldDescriptor` is the unified leaf type shared by both the factory
/// schema (`VaultDataSchema.fields`) and the vault UI schema
/// (`VaultMethodSchema.inputs` / `VaultMethodSchema.outputs`).  Keeping one
/// struct avoids duplication and ensures the type system is consistent across
/// the protocol.
///
///
/// ── HOW THE UI USES VaultDataSchema (factory side) ─────────────────────────
///
///   1. UI obtains the factory address (e.g. from the token-launch event
///      or a directory service).
///   2. UI calls factory.vaultDataSchema() → gets VaultDataSchema.
///   3. For each field in schema.fields, UI renders an input:
///        "string"   → text input
///        "address"  → address input (with checksum validation)
///        "uint16"   → number input (0–65535)
///        "uint256"  → big-number input
///        "time"     → date/time picker input (alias for uint256;
///                      value is a Unix timestamp in seconds).
///                      When used in outputs, rendered as a
///                      human-readable time string or countdown clock
///        "bool"     → checkbox
///        "bytes"    → hex input
///        "bytes32"  → hex input (32 bytes)
///      For numeric fields, if field.decimals > 0 the UI multiplies the
///      user's input by 10^decimals before encoding.
///        e.g. decimals=18: user types "1" → encoded value is 1e18
///      If decimals == 0 the raw value is used as-is.
///   4. If schema.isArray == true, UI renders an "Add Item" button for
///      dynamic array entries.
///   5. UI encodes the user input via:
///        If isArray: abi.encode(tuple[])
///        Else:       abi.encode(tuple)
///      using the fieldType values to construct the ABI type string.
///   6. Encoded bytes are passed as `vaultData` in NewTaxTokenWithVaultParams.
///
/// NOTE: The current spec only supports either a single tuple or an array
///       of tuples.
///
///
/// ── HOW THE UI USES VaultUISchema (vault side) ─────────────────────────────
///
///   1. UI calls vault.vaultUISchema() → gets VaultUISchema.
///   2. UI displays schema.vaultType as a badge/header and
///      schema.description as subtitle.
///   3. UI always calls vault.description() and displays the result as a
///      dynamic status banner.
///   4. For each method in schema.methods:
///      a. If method.isWriteMethod == false (VIEW):
///         - If method.inputs is empty: call immediately and display results.
///         - If method.inputs is non-empty: render input fields, add a
///           "Query" button.
///           - If method.isInputArray == true, render an "Add Item" button.
///         - For outputs: use field.decimals to format numeric values
///           (e.g. decimals=18: raw 1.5e18 → display "1.5").
///           For "time" fields, display the raw uint256 value as a
///           human-readable time string or a countdown clock.
///         - Derive the ABI type string from outputs[].fieldType +
///           method.isOutputArray.
///         - Use field.name and field.description as column headers/tooltips.
///      b. If method.isWriteMethod == true (WRITE):
///         - Render a form with inputs from method.inputs.
///         - If method.isInputArray == true, render "Add Item" button.
///         - Each input renders based on fieldType:
///             "address" → address input with checksum validation
///             "uint256" → big-number input
///             "uint128" → number input
///             "time"    → date/time picker input (alias for uint256;
///                          value is a Unix timestamp in seconds)
///             "string"  → text input
///             "bytes"   → hex input
///             "bool"    → checkbox
///         - If field.decimals > 0, the UI multiplies the user's
///           human-readable input by 10^decimals before encoding.
///         - If method.approvals is non-empty, BEFORE sending the write
///           transaction the UI executes each ApproveAction in order:
///             i.   Resolve the token address from approval.tokenType:
///                    "taxToken" → call vault.taxToken()
///                    "lpToken"  → call vault.lpToken()
///                    unknown    → skip (log warning, forward-compatible)
///             ii.  Read the amount from the user's input field named by
///                  approval.amountFieldName (already scaled by decimals).
///             iii. Check current allowance: token.allowance(user, vault).
///                  If already sufficient, skip.
///             iv.  Send token.approve(vault, amount) and wait for
///                  confirmation.
///             v.   Repeat for the next ApproveAction.
///         - After all approvals succeed, send the write transaction.
///         - Add a "Submit" / "Execute" button that sends the transaction.
///         - If method.inputs is empty, just render a single action button.
///   5. All methods are displayed in the order returned by vaultUISchema().
///   6. description() output is polled/refreshed periodically as a live
///      status indicator.

// ──────────────────────────────────────────────────────────────────────────────
//  Shared Struct Definitions
// ──────────────────────────────────────────────────────────────────────────────

/// @notice Describes a single field (parameter, return value, or vault-data component).
///
/// @dev   This is the unified leaf type used in both:
///        - `VaultDataSchema.fields`   (factory → describes vaultData encoding)
///        - `VaultMethodSchema.inputs` / `VaultMethodSchema.outputs`  (vault UI)
///
///        Keeping one struct avoids duplication and ensures the type system is
///        consistent across the protocol.
///
/// @param name        Machine-readable name of the field.
///                    Examples: "xHandle", "recipient", "bps", "user", "amount".
///
/// @param fieldType   Solidity ABI type string for the field.
///                    Examples: "string", "address", "uint16", "uint256", "uint128",
///                    "bool", "bytes", "bytes32".
///                    The special value "time" is an alias for "uint256".
///                    The encoded value is a Unix timestamp in seconds.
///                    For ABI encoding purposes the UI treats "time"
///                    identically to "uint256".
///                    - As an **input**, the UI renders a date/time picker.
///                    - As an **output**, the UI renders the value as a
///                      human-readable time string or a countdown clock.
///                    The special value "msg.value" indicates that the field
///                    represents the native currency amount (in wei) to send
///                    with the transaction.  Rules for this type:
///                    - This field is **NOT** ABI-encoded into the function
///                      call data.  Instead, the UI uses the value as the
///                     call's `value` (i.e `msg.value`).
///                    - It **MUST** only be used for inputs in write methods
///                      (i.e. when `VaultMethodSchema.isWriteMethod == true`).
///                    - Only one "msg.value" field per method is meaningful.
///                    Example – a payable deposit method:
///                    //   function deposit() public payable
///                    //
///                    //   inputs[0] = FieldDescriptor(
///                    //       "amount", "msg.value",
///                    //       "Amount to deposit (BNB)", 18
///                    //   );
///                    The UI uses this to decide which input widget to render
///                    and how to ABI-encode/decode the value.
///
/// @param description Human-readable explanation of the field, shown as a
///                    label or tooltip in the UI.
///                    Examples: "The Twitter/X handle of the token creator",
///                    "Recipient wallet address",
///                    "Basis points share (10000 = 100%)".
///
/// @param decimals    Decimal precision hint for numeric fields.
///                    - For **factory encoding** (VaultDataSchema context):
///                      If decimals > 0, the UI multiplies the user's input
///                      by 10^decimals before ABI-encoding.
///                      e.g. decimals=18: user types "1" → encoded as 1e18.
///                      If decimals == 0, the raw value is used as-is.
///                    - For **vault display** (VaultMethodSchema.outputs context):
///                      If decimals > 0, the UI divides the raw on-chain value
///                      by 10^decimals for display.
///                      e.g. decimals=18: raw 1.5e18 → display "1.5".
///                      If decimals == 0, the raw value is displayed.
///                    - For non-numeric fields (string, address, bytes, bool),
///                      this should always be 0.
struct FieldDescriptor {
    string name;
    string fieldType;
    string description;
    uint8 decimals;
}

// ──────────────────────────────────────────────────────────────────────────────
//  Factory-side: VaultDataSchema
// ──────────────────────────────────────────────────────────────────────────────

/// @notice Describes the shape of the `vaultData` bytes expected by a
///         VaultFactory's `newVault()` method.
///
/// @dev   A UI calls `factory.vaultDataSchema()` to discover what fields the
///        factory expects, then renders a form accordingly.
///
///        The current spec supports two shapes:
///          • A single tuple   (`isArray == false`)  – e.g. `(string)`
///          • An array of tuples (`isArray == true`)  – e.g. `(address,uint16)[]`
///
///        If `fields` is empty and `isArray` is false, the factory ignores
///        `vaultData` entirely (e.g. SnowBallFactory).
///
/// @param description  Free-form string explaining what the vault does and
///                     what data is required. Shown to the user in the UI.
///
/// @param fields       Ordered list of field descriptors.  Each entry maps to
///                     one component of the ABI-encoded tuple.
///                     For a factory that requires no user input, return an
///                     empty array.
///
/// @param isArray      If true, `vaultData` is ABI-encoded as `tuple[]`
///                     (an array of the tuple described by `fields`).
///                     If false, `vaultData` is ABI-encoded as a single `tuple`.
struct VaultDataSchema {
    string description;
    FieldDescriptor[] fields;
    bool isArray;
}

// ──────────────────────────────────────────────────────────────────────────────
//  Vault-side: VaultUISchema & supporting types
// ──────────────────────────────────────────────────────────────────────────────

/// @notice An ERC-20 `approve` action that the UI must execute **before**
///         calling a write method on the vault.
///
/// @dev   The spender is always the vault contract itself.
///
///        Known `tokenType` values:
///          • "taxToken" – the vault's own tax token (resolved via vault.taxToken())
///          • "lpToken"  – the associated LP token  (resolved via vault.lpToken())
///
///        New token types can be added in the future without changing this
///        struct.  The UI **MUST** ignore any `tokenType` it does not
///        recognise (forward-compatible).
///
///        Workflow for the UI when processing an ApproveAction:
///          1. Resolve the token address from `tokenType`:
///               "taxToken" → call vault.taxToken()
///               "lpToken"  → call vault.lpToken()
///               unknown    → skip with a warning (forward-compatible)
///          2. Read the amount from the user's input field whose `name`
///             matches `amountFieldName`.  The value should already be
///             scaled by the field's `decimals`.
///          3. Check current allowance: token.allowance(user, vault).
///             If already sufficient, skip.
///          4. Send token.approve(vault, amount) and wait for confirmation.
///
/// @param tokenType       Which token to approve.
///                        e.g. "taxToken", "lpToken".
///
/// @param amountFieldName The `name` of the write method's input
///                        FieldDescriptor whose value should be used as
///                        the approve amount.
///                        e.g. "amount".
struct ApproveAction {
    string tokenType;
    string amountFieldName;
}

/// @notice Describes a single view or write method that the UI should render
///         for a vault.
///
/// @dev   The UI iterates over the `methods` array in `VaultUISchema` and
///        renders each method as either a read-only query panel (view) or an
///        interactive form (write).
///
/// @param name          Solidity method name.
///                      e.g. "claim", "getRecipientsInfo", "stats",
///                      "dispatch", "transitState", "manageByProof".
///
/// @param description   Human-readable explanation of what the method does.
///                      Shown as a subtitle or tooltip in the UI.
///
/// @param inputs        Ordered list of input parameters.
///                      Empty for no-arg methods (e.g. dispatch(), stats()).
///                      Each FieldDescriptor maps to one method parameter.
///
/// @param outputs       Ordered list of return values.
///                      Empty for write methods (tx receipts don't return data
///                      to the UI).
///                      Each FieldDescriptor maps to one return component.
///                      The UI uses `field.decimals` to format numeric values
///                      for display.
///
/// @param approvals     Ordered list of ERC-20 approve actions the UI must
///                      execute **before** sending the write transaction.
///                      The spender is always the vault contract.
///                      Empty for:
///                        • view methods
///                        • write methods that need no prior approval
///
/// @param isInputArray  If true, the method's input is an array of tuples
///                      described by `inputs`.  The UI should render an
///                      "Add Row" button for dynamic array entries.
///
/// @param isOutputArray If true, the method's return value is an array of
///                      tuples described by `outputs`.  The UI should render
///                      results as a table with one row per element.
///
/// @param isWriteMethod If true, the method is state-changing and the UI
///                      should send a transaction.
///                      If false, the method is a view call and the UI
///                      should display the returned data.
struct VaultMethodSchema {
    string name;
    string description;
    FieldDescriptor[] inputs;
    FieldDescriptor[] outputs;
    ApproveAction[] approvals;
    bool isInputArray;
    bool isOutputArray;
    bool isWriteMethod;
}

/// @notice Top-level schema describing the vault's entire UI surface.
///
/// @dev   Returned by `VaultBaseV2.vaultUISchema()`.  The UI uses this to
///        build the complete vault interaction page.
///
///        Rendering algorithm:
///          1. Display `vaultType` as a badge/header.
///          2. Display `description` as a subtitle.
///          3. Always call `vault.description()` and display the result as a
///             dynamic status banner (polled/refreshed periodically).
///          4. Iterate `methods` and render each one according to its
///             `isWriteMethod` flag (see VaultMethodSchema docs above).
///          5. Methods are displayed in the order returned.
///
/// @param vaultType    Human-readable vault type identifier.
///                     e.g. "FlapXVault", "SplitVault", "SnowBallVault",
///                     "BlackHoleVault".
///
/// @param description  Overall explanation of the vault for the UI.
///                     e.g. "Distributes received BNB among a fixed set of
///                     recipients by basis-point shares."
///
/// @param methods      All methods the UI should render.
///                     Ordered — the UI displays them in this order.
struct VaultUISchema {
    string vaultType;
    string description;
    VaultMethodSchema[] methods;
}

// ──────────────────────────────────────────────────────────────────────────────
//  Factory-side: FactoryPolicy (VaultFactoryBaseV2 v2.1)
// ──────────────────────────────────────────────────────────────────────────────

/// @notice A single constraint on the parameters passed to newTokenV6WithVault.
///
/// @dev    Inspired by AWS IAM policy conditions.  Each FactoryPolicy describes
///         one constraint: "field <target> must satisfy <operator> <value>".
///
///         These policies are **informational only** — they are intended for
///         UI rendering (inline validation hints, error messages).  The actual
///         enforcement always happens inside `onBeforeNewTokenV6WithVault`.
///
///         Factories that override `onBeforeNewTokenV6WithVault` SHOULD also
///         override `tokenCreationPolicies()` to describe their constraints in
///         this machine-readable form so the UI can surface them proactively.
///
///
/// ── FIELD REFERENCE ────────────────────────────────────────────────────────
///
/// @param target      The Solidity field name in
///                    IVaultPortalTypes.NewTokenV6WithVaultParams that this
///                    constraint applies to.
///                    Examples: "dividendToken", "dividendBps", "taxBps",
///                    "quoteToken", "migratorType".
///
/// @param operator    The comparison operator.  Supported values:
///                    "eq"    – field must equal value
///                    "neq"   – field must not equal value
///                    "gt"    – field must be strictly greater than value
///                    "gte"   – field must be greater than or equal to value
///                    "lt"    – field must be strictly less than value
///                    "lte"   – field must be less than or equal to value
///                    "in"    – field must be one of a set; `value` is an
///                              ABI-encoded dynamic array of that field's type
///                    "notIn" – field must not be any of a set (same encoding)
///                    Unknown operators MUST be ignored by the UI (forward-compat).
///
/// @param value       ABI-encoded expected value.
///                    Since `target` identifies a specific field in
///                    NewTokenV6WithVaultParams whose Solidity type is fixed,
///                    the UI already knows the ABI type and can decode `value`
///                    directly without an additional type hint.
///                    For "in" / "notIn", `value` is an ABI-encoded dynamic
///                    array of that field's element type.
///
/// @param description Human-readable explanation shown as a tooltip or inline
///                    validation hint in the UI.
///                    Examples:
///                    "Dividend token must equal the quote token (WBNB)."
///                    "Dividend BPS must be at least 100 (1%)."
///
///
/// ── EXAMPLES ───────────────────────────────────────────────────────────────
///
///   // dividendToken must equal WBNB
///   FactoryPolicy({
///       target:      "dividendToken",
///       operator:    "eq",
///       value:       abi.encode(WBNB_ADDRESS),
///       description: "Dividend token must equal the quote token (WBNB)."
///   })
///
///   // dividendBps must be >= 100 (1%)
///   FactoryPolicy({
///       target:      "dividendBps",
///       operator:    "gte",
///       value:       abi.encode(uint256(100)),
///       description: "Dividend BPS must be at least 100 (1%)."
///   })
///
///   // quoteToken must be one of an allowed set
///   FactoryPolicy({
///       target:      "quoteToken",
///       operator:    "in",
///       value:       abi.encode(allowedAddresses),   // address[]
///       description: "Quote token must be WBNB or USDT."
///   })
///
struct FactoryPolicy {
    string target;
    string operator;
    bytes value;
    string description;
}

// lib/openzeppelin-contracts-upgradeable/contracts/proxy/utils/Initializable.sol

// OpenZeppelin Contracts (last updated v5.0.0) (proxy/utils/Initializable.sol)

pragma solidity ^0.8.20;

/**
 * @dev This is a base contract to aid in writing upgradeable contracts, or any kind of contract that will be deployed
 * behind a proxy. Since proxied contracts do not make use of a constructor, it's common to move constructor logic to an
 * external initializer function, usually called `initialize`. It then becomes necessary to protect this initializer
 * function so it can only be called once. The {initializer} modifier provided by this contract will have this effect.
 *
 * The initialization functions use a version number. Once a version number is used, it is consumed and cannot be
 * reused. This mechanism prevents re-execution of each "step" but allows the creation of new initialization steps in
 * case an upgrade adds a module that needs to be initialized.
 *
 * For example:
 *
 * [.hljs-theme-light.nopadding]
 * ```solidity
 * contract MyToken is ERC20Upgradeable {
 *     function initialize() initializer public {
 *         __ERC20_init("MyToken", "MTK");
 *     }
 * }
 *
 * contract MyTokenV2 is MyToken, ERC20PermitUpgradeable {
 *     function initializeV2() reinitializer(2) public {
 *         __ERC20Permit_init("MyToken");
 *     }
 * }
 * ```
 *
 * TIP: To avoid leaving the proxy in an uninitialized state, the initializer function should be called as early as
 * possible by providing the encoded function call as the `_data` argument to {ERC1967Proxy-constructor}.
 *
 * CAUTION: When used with inheritance, manual care must be taken to not invoke a parent initializer twice, or to ensure
 * that all initializers are idempotent. This is not verified automatically as constructors are by Solidity.
 *
 * [CAUTION]
 * ====
 * Avoid leaving a contract uninitialized.
 *
 * An uninitialized contract can be taken over by an attacker. This applies to both a proxy and its implementation
 * contract, which may impact the proxy. To prevent the implementation contract from being used, you should invoke
 * the {_disableInitializers} function in the constructor to automatically lock it when it is deployed:
 *
 * [.hljs-theme-light.nopadding]
 * ```
 * /// @custom:oz-upgrades-unsafe-allow constructor
 * constructor() {
 *     _disableInitializers();
 * }
 * ```
 * ====
 */
abstract contract Initializable {
    /**
     * @dev Storage of the initializable contract.
     *
     * It's implemented on a custom ERC-7201 namespace to reduce the risk of storage collisions
     * when using with upgradeable contracts.
     *
     * @custom:storage-location erc7201:openzeppelin.storage.Initializable
     */
    struct InitializableStorage {
        /**
         * @dev Indicates that the contract has been initialized.
         */
        uint64 _initialized;
        /**
         * @dev Indicates that the contract is in the process of being initialized.
         */
        bool _initializing;
    }

    // keccak256(abi.encode(uint256(keccak256("openzeppelin.storage.Initializable")) - 1)) & ~bytes32(uint256(0xff))
    bytes32 private constant INITIALIZABLE_STORAGE = 0xf0c57e16840df040f15088dc2f81fe391c3923bec73e23a9662efc9c229c6a00;

    /**
     * @dev The contract is already initialized.
     */
    error InvalidInitialization();

    /**
     * @dev The contract is not initializing.
     */
    error NotInitializing();

    /**
     * @dev Triggered when the contract has been initialized or reinitialized.
     */
    event Initialized(uint64 version);

    /**
     * @dev A modifier that defines a protected initializer function that can be invoked at most once. In its scope,
     * `onlyInitializing` functions can be used to initialize parent contracts.
     *
     * Similar to `reinitializer(1)`, except that in the context of a constructor an `initializer` may be invoked any
     * number of times. This behavior in the constructor can be useful during testing and is not expected to be used in
     * production.
     *
     * Emits an {Initialized} event.
     */
    modifier initializer() {
        // solhint-disable-next-line var-name-mixedcase
        InitializableStorage storage $ = _getInitializableStorage();

        // Cache values to avoid duplicated sloads
        bool isTopLevelCall = !$._initializing;
        uint64 initialized = $._initialized;

        // Allowed calls:
        // - initialSetup: the contract is not in the initializing state and no previous version was
        //                 initialized
        // - construction: the contract is initialized at version 1 (no reininitialization) and the
        //                 current contract is just being deployed
        bool initialSetup = initialized == 0 && isTopLevelCall;
        bool construction = initialized == 1 && address(this).code.length == 0;

        if (!initialSetup && !construction) {
            revert InvalidInitialization();
        }
        $._initialized = 1;
        if (isTopLevelCall) {
            $._initializing = true;
        }
        _;
        if (isTopLevelCall) {
            $._initializing = false;
            emit Initialized(1);
        }
    }

    /**
     * @dev A modifier that defines a protected reinitializer function that can be invoked at most once, and only if the
     * contract hasn't been initialized to a greater version before. In its scope, `onlyInitializing` functions can be
     * used to initialize parent contracts.
     *
     * A reinitializer may be used after the original initialization step. This is essential to configure modules that
     * are added through upgrades and that require initialization.
     *
     * When `version` is 1, this modifier is similar to `initializer`, except that functions marked with `reinitializer`
     * cannot be nested. If one is invoked in the context of another, execution will revert.
     *
     * Note that versions can jump in increments greater than 1; this implies that if multiple reinitializers coexist in
     * a contract, executing them in the right order is up to the developer or operator.
     *
     * WARNING: Setting the version to 2**64 - 1 will prevent any future reinitialization.
     *
     * Emits an {Initialized} event.
     */
    modifier reinitializer(uint64 version) {
        // solhint-disable-next-line var-name-mixedcase
        InitializableStorage storage $ = _getInitializableStorage();

        if ($._initializing || $._initialized >= version) {
            revert InvalidInitialization();
        }
        $._initialized = version;
        $._initializing = true;
        _;
        $._initializing = false;
        emit Initialized(version);
    }

    /**
     * @dev Modifier to protect an initialization function so that it can only be invoked by functions with the
     * {initializer} and {reinitializer} modifiers, directly or indirectly.
     */
    modifier onlyInitializing() {
        _checkInitializing();
        _;
    }

    /**
     * @dev Reverts if the contract is not in an initializing state. See {onlyInitializing}.
     */
    function _checkInitializing() internal view virtual {
        if (!_isInitializing()) {
            revert NotInitializing();
        }
    }

    /**
     * @dev Locks the contract, preventing any future reinitialization. This cannot be part of an initializer call.
     * Calling this in the constructor of a contract will prevent that contract from being initialized or reinitialized
     * to any version. It is recommended to use this to lock implementation contracts that are designed to be called
     * through proxies.
     *
     * Emits an {Initialized} event the first time it is successfully executed.
     */
    function _disableInitializers() internal virtual {
        // solhint-disable-next-line var-name-mixedcase
        InitializableStorage storage $ = _getInitializableStorage();

        if ($._initializing) {
            revert InvalidInitialization();
        }
        if ($._initialized != type(uint64).max) {
            $._initialized = type(uint64).max;
            emit Initialized(type(uint64).max);
        }
    }

    /**
     * @dev Returns the highest version that has been initialized. See {reinitializer}.
     */
    function _getInitializedVersion() internal view returns (uint64) {
        return _getInitializableStorage()._initialized;
    }

    /**
     * @dev Returns `true` if the contract is currently initializing. See {onlyInitializing}.
     */
    function _isInitializing() internal view returns (bool) {
        return _getInitializableStorage()._initializing;
    }

    /**
     * @dev Returns a pointer to the storage namespace.
     */
    // solhint-disable-next-line var-name-mixedcase
    function _getInitializableStorage() private pure returns (InitializableStorage storage $) {
        assembly {
            $.slot := INITIALIZABLE_STORAGE
        }
    }
}

// lib/openzeppelin-contracts/contracts/utils/math/Math.sol

// OpenZeppelin Contracts (last updated v5.0.0) (utils/math/Math.sol)

/**
 * @dev Standard math utilities missing in the Solidity language.
 */
library Math {
    /**
     * @dev Muldiv operation overflow.
     */
    error MathOverflowedMulDiv();

    enum Rounding {
        Floor, // Toward negative infinity
        Ceil, // Toward positive infinity
        Trunc, // Toward zero
        Expand // Away from zero
    }

    /**
     * @dev Returns the addition of two unsigned integers, with an overflow flag.
     */
    function tryAdd(uint256 a, uint256 b) internal pure returns (bool, uint256) {
        unchecked {
            uint256 c = a + b;
            if (c < a) return (false, 0);
            return (true, c);
        }
    }

    /**
     * @dev Returns the subtraction of two unsigned integers, with an overflow flag.
     */
    function trySub(uint256 a, uint256 b) internal pure returns (bool, uint256) {
        unchecked {
            if (b > a) return (false, 0);
            return (true, a - b);
        }
    }

    /**
     * @dev Returns the multiplication of two unsigned integers, with an overflow flag.
     */
    function tryMul(uint256 a, uint256 b) internal pure returns (bool, uint256) {
        unchecked {
            // Gas optimization: this is cheaper than requiring 'a' not being zero, but the
            // benefit is lost if 'b' is also tested.
            // See: https://github.com/OpenZeppelin/openzeppelin-contracts/pull/522
            if (a == 0) return (true, 0);
            uint256 c = a * b;
            if (c / a != b) return (false, 0);
            return (true, c);
        }
    }

    /**
     * @dev Returns the division of two unsigned integers, with a division by zero flag.
     */
    function tryDiv(uint256 a, uint256 b) internal pure returns (bool, uint256) {
        unchecked {
            if (b == 0) return (false, 0);
            return (true, a / b);
        }
    }

    /**
     * @dev Returns the remainder of dividing two unsigned integers, with a division by zero flag.
     */
    function tryMod(uint256 a, uint256 b) internal pure returns (bool, uint256) {
        unchecked {
            if (b == 0) return (false, 0);
            return (true, a % b);
        }
    }

    /**
     * @dev Returns the largest of two numbers.
     */
    function max(uint256 a, uint256 b) internal pure returns (uint256) {
        return a > b ? a : b;
    }

    /**
     * @dev Returns the smallest of two numbers.
     */
    function min(uint256 a, uint256 b) internal pure returns (uint256) {
        return a < b ? a : b;
    }

    /**
     * @dev Returns the average of two numbers. The result is rounded towards
     * zero.
     */
    function average(uint256 a, uint256 b) internal pure returns (uint256) {
        // (a + b) / 2 can overflow.
        return (a & b) + (a ^ b) / 2;
    }

    /**
     * @dev Returns the ceiling of the division of two numbers.
     *
     * This differs from standard division with `/` in that it rounds towards infinity instead
     * of rounding towards zero.
     */
    function ceilDiv(uint256 a, uint256 b) internal pure returns (uint256) {
        if (b == 0) {
            // Guarantee the same behavior as in a regular Solidity division.
            return a / b;
        }

        // (a + b - 1) / b can overflow on addition, so we distribute.
        return a == 0 ? 0 : (a - 1) / b + 1;
    }

    /**
     * @notice Calculates floor(x * y / denominator) with full precision. Throws if result overflows a uint256 or
     * denominator == 0.
     * @dev Original credit to Remco Bloemen under MIT license (https://xn--2-umb.com/21/muldiv) with further edits by
     * Uniswap Labs also under MIT license.
     */
    function mulDiv(uint256 x, uint256 y, uint256 denominator) internal pure returns (uint256 result) {
        unchecked {
            // 512-bit multiply [prod1 prod0] = x * y. Compute the product mod 2^256 and mod 2^256 - 1, then use
            // use the Chinese Remainder Theorem to reconstruct the 512 bit result. The result is stored in two 256
            // variables such that product = prod1 * 2^256 + prod0.
            uint256 prod0 = x * y; // Least significant 256 bits of the product
            uint256 prod1; // Most significant 256 bits of the product
            assembly {
                let mm := mulmod(x, y, not(0))
                prod1 := sub(sub(mm, prod0), lt(mm, prod0))
            }

            // Handle non-overflow cases, 256 by 256 division.
            if (prod1 == 0) {
                // Solidity will revert if denominator == 0, unlike the div opcode on its own.
                // The surrounding unchecked block does not change this fact.
                // See https://docs.soliditylang.org/en/latest/control-structures.html#checked-or-unchecked-arithmetic.
                return prod0 / denominator;
            }

            // Make sure the result is less than 2^256. Also prevents denominator == 0.
            if (denominator <= prod1) {
                revert MathOverflowedMulDiv();
            }

            ///////////////////////////////////////////////
            // 512 by 256 division.
            ///////////////////////////////////////////////

            // Make division exact by subtracting the remainder from [prod1 prod0].
            uint256 remainder;
            assembly {
                // Compute remainder using mulmod.
                remainder := mulmod(x, y, denominator)

                // Subtract 256 bit number from 512 bit number.
                prod1 := sub(prod1, gt(remainder, prod0))
                prod0 := sub(prod0, remainder)
            }

            // Factor powers of two out of denominator and compute largest power of two divisor of denominator.
            // Always >= 1. See https://cs.stackexchange.com/q/138556/92363.

            uint256 twos = denominator & (0 - denominator);
            assembly {
                // Divide denominator by twos.
                denominator := div(denominator, twos)

                // Divide [prod1 prod0] by twos.
                prod0 := div(prod0, twos)

                // Flip twos such that it is 2^256 / twos. If twos is zero, then it becomes one.
                twos := add(div(sub(0, twos), twos), 1)
            }

            // Shift in bits from prod1 into prod0.
            prod0 |= prod1 * twos;

            // Invert denominator mod 2^256. Now that denominator is an odd number, it has an inverse modulo 2^256 such
            // that denominator * inv = 1 mod 2^256. Compute the inverse by starting with a seed that is correct for
            // four bits. That is, denominator * inv = 1 mod 2^4.
            uint256 inverse = (3 * denominator) ^ 2;

            // Use the Newton-Raphson iteration to improve the precision. Thanks to Hensel's lifting lemma, this also
            // works in modular arithmetic, doubling the correct bits in each step.
            inverse *= 2 - denominator * inverse; // inverse mod 2^8
            inverse *= 2 - denominator * inverse; // inverse mod 2^16
            inverse *= 2 - denominator * inverse; // inverse mod 2^32
            inverse *= 2 - denominator * inverse; // inverse mod 2^64
            inverse *= 2 - denominator * inverse; // inverse mod 2^128
            inverse *= 2 - denominator * inverse; // inverse mod 2^256

            // Because the division is now exact we can divide by multiplying with the modular inverse of denominator.
            // This will give us the correct result modulo 2^256. Since the preconditions guarantee that the outcome is
            // less than 2^256, this is the final result. We don't need to compute the high bits of the result and prod1
            // is no longer required.
            result = prod0 * inverse;
            return result;
        }
    }

    /**
     * @notice Calculates x * y / denominator with full precision, following the selected rounding direction.
     */
    function mulDiv(uint256 x, uint256 y, uint256 denominator, Rounding rounding) internal pure returns (uint256) {
        uint256 result = mulDiv(x, y, denominator);
        if (unsignedRoundsUp(rounding) && mulmod(x, y, denominator) > 0) {
            result += 1;
        }
        return result;
    }

    /**
     * @dev Returns the square root of a number. If the number is not a perfect square, the value is rounded
     * towards zero.
     *
     * Inspired by Henry S. Warren, Jr.'s "Hacker's Delight" (Chapter 11).
     */
    function sqrt(uint256 a) internal pure returns (uint256) {
        if (a == 0) {
            return 0;
        }

        // For our first guess, we get the biggest power of 2 which is smaller than the square root of the target.
        //
        // We know that the "msb" (most significant bit) of our target number `a` is a power of 2 such that we have
        // `msb(a) <= a < 2*msb(a)`. This value can be written `msb(a)=2**k` with `k=log2(a)`.
        //
        // This can be rewritten `2**log2(a) <= a < 2**(log2(a) + 1)`
        // → `sqrt(2**k) <= sqrt(a) < sqrt(2**(k+1))`
        // → `2**(k/2) <= sqrt(a) < 2**((k+1)/2) <= 2**(k/2 + 1)`
        //
        // Consequently, `2**(log2(a) / 2)` is a good first approximation of `sqrt(a)` with at least 1 correct bit.
        uint256 result = 1 << (log2(a) >> 1);

        // At this point `result` is an estimation with one bit of precision. We know the true value is a uint128,
        // since it is the square root of a uint256. Newton's method converges quadratically (precision doubles at
        // every iteration). We thus need at most 7 iteration to turn our partial result with one bit of precision
        // into the expected uint128 result.
        unchecked {
            result = (result + a / result) >> 1;
            result = (result + a / result) >> 1;
            result = (result + a / result) >> 1;
            result = (result + a / result) >> 1;
            result = (result + a / result) >> 1;
            result = (result + a / result) >> 1;
            result = (result + a / result) >> 1;
            return min(result, a / result);
        }
    }

    /**
     * @notice Calculates sqrt(a), following the selected rounding direction.
     */
    function sqrt(uint256 a, Rounding rounding) internal pure returns (uint256) {
        unchecked {
            uint256 result = sqrt(a);
            return result + (unsignedRoundsUp(rounding) && result * result < a ? 1 : 0);
        }
    }

    /**
     * @dev Return the log in base 2 of a positive value rounded towards zero.
     * Returns 0 if given 0.
     */
    function log2(uint256 value) internal pure returns (uint256) {
        uint256 result = 0;
        unchecked {
            if (value >> 128 > 0) {
                value >>= 128;
                result += 128;
            }
            if (value >> 64 > 0) {
                value >>= 64;
                result += 64;
            }
            if (value >> 32 > 0) {
                value >>= 32;
                result += 32;
            }
            if (value >> 16 > 0) {
                value >>= 16;
                result += 16;
            }
            if (value >> 8 > 0) {
                value >>= 8;
                result += 8;
            }
            if (value >> 4 > 0) {
                value >>= 4;
                result += 4;
            }
            if (value >> 2 > 0) {
                value >>= 2;
                result += 2;
            }
            if (value >> 1 > 0) {
                result += 1;
            }
        }
        return result;
    }

    /**
     * @dev Return the log in base 2, following the selected rounding direction, of a positive value.
     * Returns 0 if given 0.
     */
    function log2(uint256 value, Rounding rounding) internal pure returns (uint256) {
        unchecked {
            uint256 result = log2(value);
            return result + (unsignedRoundsUp(rounding) && 1 << result < value ? 1 : 0);
        }
    }

    /**
     * @dev Return the log in base 10 of a positive value rounded towards zero.
     * Returns 0 if given 0.
     */
    function log10(uint256 value) internal pure returns (uint256) {
        uint256 result = 0;
        unchecked {
            if (value >= 10 ** 64) {
                value /= 10 ** 64;
                result += 64;
            }
            if (value >= 10 ** 32) {
                value /= 10 ** 32;
                result += 32;
            }
            if (value >= 10 ** 16) {
                value /= 10 ** 16;
                result += 16;
            }
            if (value >= 10 ** 8) {
                value /= 10 ** 8;
                result += 8;
            }
            if (value >= 10 ** 4) {
                value /= 10 ** 4;
                result += 4;
            }
            if (value >= 10 ** 2) {
                value /= 10 ** 2;
                result += 2;
            }
            if (value >= 10 ** 1) {
                result += 1;
            }
        }
        return result;
    }

    /**
     * @dev Return the log in base 10, following the selected rounding direction, of a positive value.
     * Returns 0 if given 0.
     */
    function log10(uint256 value, Rounding rounding) internal pure returns (uint256) {
        unchecked {
            uint256 result = log10(value);
            return result + (unsignedRoundsUp(rounding) && 10 ** result < value ? 1 : 0);
        }
    }

    /**
     * @dev Return the log in base 256 of a positive value rounded towards zero.
     * Returns 0 if given 0.
     *
     * Adding one to the result gives the number of pairs of hex symbols needed to represent `value` as a hex string.
     */
    function log256(uint256 value) internal pure returns (uint256) {
        uint256 result = 0;
        unchecked {
            if (value >> 128 > 0) {
                value >>= 128;
                result += 16;
            }
            if (value >> 64 > 0) {
                value >>= 64;
                result += 8;
            }
            if (value >> 32 > 0) {
                value >>= 32;
                result += 4;
            }
            if (value >> 16 > 0) {
                value >>= 16;
                result += 2;
            }
            if (value >> 8 > 0) {
                result += 1;
            }
        }
        return result;
    }

    /**
     * @dev Return the log in base 256, following the selected rounding direction, of a positive value.
     * Returns 0 if given 0.
     */
    function log256(uint256 value, Rounding rounding) internal pure returns (uint256) {
        unchecked {
            uint256 result = log256(value);
            return result + (unsignedRoundsUp(rounding) && 1 << (result << 3) < value ? 1 : 0);
        }
    }

    /**
     * @dev Returns whether a provided rounding mode is considered rounding up for unsigned integers.
     */
    function unsignedRoundsUp(Rounding rounding) internal pure returns (bool) {
        return uint8(rounding) % 2 == 1;
    }
}

// lib/openzeppelin-contracts/contracts/proxy/Proxy.sol

// OpenZeppelin Contracts (last updated v5.0.0) (proxy/Proxy.sol)

pragma solidity ^0.8.20;

/**
 * @dev This abstract contract provides a fallback function that delegates all calls to another contract using the EVM
 * instruction `delegatecall`. We refer to the second contract as the _implementation_ behind the proxy, and it has to
 * be specified by overriding the virtual {_implementation} function.
 *
 * Additionally, delegation to the implementation can be triggered manually through the {_fallback} function, or to a
 * different contract through the {_delegate} function.
 *
 * The success and return data of the delegated call will be returned back to the caller of the proxy.
 */
abstract contract Proxy {
    /**
     * @dev Delegates the current call to `implementation`.
     *
     * This function does not return to its internal call site, it will return directly to the external caller.
     */
    function _delegate(address implementation) internal virtual {
        assembly {
            // Copy msg.data. We take full control of memory in this inline assembly
            // block because it will not return to Solidity code. We overwrite the
            // Solidity scratch pad at memory position 0.
            calldatacopy(0, 0, calldatasize())

            // Call the implementation.
            // out and outsize are 0 because we don't know the size yet.
            let result := delegatecall(gas(), implementation, 0, calldatasize(), 0, 0)

            // Copy the returned data.
            returndatacopy(0, 0, returndatasize())

            switch result
            // delegatecall returns 0 on error.
            case 0 {
                revert(0, returndatasize())
            }
            default {
                return(0, returndatasize())
            }
        }
    }

    /**
     * @dev This is a virtual function that should be overridden so it returns the address to which the fallback
     * function and {_fallback} should delegate.
     */
    function _implementation() internal view virtual returns (address);

    /**
     * @dev Delegates the current call to the address returned by `_implementation()`.
     *
     * This function does not return to its internal call site, it will return directly to the external caller.
     */
    function _fallback() internal virtual {
        _delegate(_implementation());
    }

    /**
     * @dev Fallback function that delegates calls to the address returned by `_implementation()`. Will run if no other
     * function in the contract matches the call data.
     */
    fallback() external payable virtual {
        _fallback();
    }
}

// lib/openzeppelin-contracts/contracts/utils/math/SignedMath.sol

// OpenZeppelin Contracts (last updated v5.0.0) (utils/math/SignedMath.sol)

/**
 * @dev Standard signed math utilities missing in the Solidity language.
 */
library SignedMath {
    /**
     * @dev Returns the largest of two signed numbers.
     */
    function max(int256 a, int256 b) internal pure returns (int256) {
        return a > b ? a : b;
    }

    /**
     * @dev Returns the smallest of two signed numbers.
     */
    function min(int256 a, int256 b) internal pure returns (int256) {
        return a < b ? a : b;
    }

    /**
     * @dev Returns the average of two signed numbers without overflow.
     * The result is rounded towards zero.
     */
    function average(int256 a, int256 b) internal pure returns (int256) {
        // Formula from the book "Hacker's Delight"
        int256 x = (a & b) + ((a ^ b) >> 1);
        return x + (int256(uint256(x) >> 255) & (a ^ b));
    }

    /**
     * @dev Returns the absolute unsigned value of a signed value.
     */
    function abs(int256 n) internal pure returns (uint256) {
        unchecked {
            // must be unchecked in order to support `n = type(int256).min`
            return uint256(n >= 0 ? n : -n);
        }
    }
}

// lib/openzeppelin-contracts/contracts/utils/StorageSlot.sol

// OpenZeppelin Contracts (last updated v5.0.0) (utils/StorageSlot.sol)
// This file was procedurally generated from scripts/generate/templates/StorageSlot.js.

/**
 * @dev Library for reading and writing primitive types to specific storage slots.
 *
 * Storage slots are often used to avoid storage conflict when dealing with upgradeable contracts.
 * This library helps with reading and writing to such slots without the need for inline assembly.
 *
 * The functions in this library return Slot structs that contain a `value` member that can be used to read or write.
 *
 * Example usage to set ERC1967 implementation slot:
 * ```solidity
 * contract ERC1967 {
 *     bytes32 internal constant _IMPLEMENTATION_SLOT = 0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc;
 *
 *     function _getImplementation() internal view returns (address) {
 *         return StorageSlot.getAddressSlot(_IMPLEMENTATION_SLOT).value;
 *     }
 *
 *     function _setImplementation(address newImplementation) internal {
 *         require(newImplementation.code.length > 0);
 *         StorageSlot.getAddressSlot(_IMPLEMENTATION_SLOT).value = newImplementation;
 *     }
 * }
 * ```
 */
library StorageSlot {
    struct AddressSlot {
        address value;
    }

    struct BooleanSlot {
        bool value;
    }

    struct Bytes32Slot {
        bytes32 value;
    }

    struct Uint256Slot {
        uint256 value;
    }

    struct StringSlot {
        string value;
    }

    struct BytesSlot {
        bytes value;
    }

    /**
     * @dev Returns an `AddressSlot` with member `value` located at `slot`.
     */
    function getAddressSlot(bytes32 slot) internal pure returns (AddressSlot storage r) {
        assembly ("memory-safe") {
            r.slot := slot
        }
    }

    /**
     * @dev Returns an `BooleanSlot` with member `value` located at `slot`.
     */
    function getBooleanSlot(bytes32 slot) internal pure returns (BooleanSlot storage r) {
        assembly ("memory-safe") {
            r.slot := slot
        }
    }

    /**
     * @dev Returns an `Bytes32Slot` with member `value` located at `slot`.
     */
    function getBytes32Slot(bytes32 slot) internal pure returns (Bytes32Slot storage r) {
        assembly ("memory-safe") {
            r.slot := slot
        }
    }

    /**
     * @dev Returns an `Uint256Slot` with member `value` located at `slot`.
     */
    function getUint256Slot(bytes32 slot) internal pure returns (Uint256Slot storage r) {
        assembly ("memory-safe") {
            r.slot := slot
        }
    }

    /**
     * @dev Returns an `StringSlot` with member `value` located at `slot`.
     */
    function getStringSlot(bytes32 slot) internal pure returns (StringSlot storage r) {
        assembly ("memory-safe") {
            r.slot := slot
        }
    }

    /**
     * @dev Returns an `StringSlot` representation of the string storage pointer `store`.
     */
    function getStringSlot(string storage store) internal pure returns (StringSlot storage r) {
        assembly ("memory-safe") {
            r.slot := store.slot
        }
    }

    /**
     * @dev Returns an `BytesSlot` with member `value` located at `slot`.
     */
    function getBytesSlot(bytes32 slot) internal pure returns (BytesSlot storage r) {
        assembly ("memory-safe") {
            r.slot := slot
        }
    }

    /**
     * @dev Returns an `BytesSlot` representation of the bytes storage pointer `store`.
     */
    function getBytesSlot(bytes storage store) internal pure returns (BytesSlot storage r) {
        assembly ("memory-safe") {
            r.slot := store.slot
        }
    }
}

// src/flap/VaultBase.sol

/// @title VaultBase
/// @notice Abstract base contract for all vault implementations
/// @author The Flap Team
/// @dev How to implement your own vault contract:
///
/// 1. **Inherit from this base contract**
///    - All vault implementations must extend this contract
///
/// 2. **Implement the description() method**
///    - This method should return a dynamic string describing the vault's current state
///    - The description should change based on vault state (e.g., balance, streaming status, etc.)
///    - Example: "Flap Tax Vault for TOKEN, this vault automatically buyback tokens, we have bought back 3.2M tokens. Developed by Alice (twitter.com/alice)"
///
/// 3. **Use _getPortal() for Portal interactions**
///    - Call this internal method to get the Portal address for the current chain
///    - The method reverts if the current chain is not supported
///    - Currently only BNB Chain (chain ID 56) and BNB Testnet (chain ID 97) are supported
///
/// 4. **Use _getGuardian() for Guardian address**
///    - Call this internal method to get the Guardian address for the current chain
///    - The Guardian is a privileged address that can always call permissioned functions if you have any
///    - The method reverts if the current chain is not supported
///    - Currently only BNB Chain (chain ID 56) and BNB Testnet (chain ID 97) are supported
///
/// 5. **Handle tax token revenue**
///    - Implement a receive() function to accept BNB from the tax token
///    - Process the revenue according to your vault's logic (accumulate, stream, buyback, etc.)
///
/// 6. **MANDATE: Guardian access to permissioned functions**
///    - If you have any permissioned functions that should be triggered by an external address,
///      and it is not suitable to make them public (e.g. buyback which may be sandwich attacked),
///      you MUST ALSO give the guardian address the permissions alongside other allowed addresses as a backup.
///    - The guardian can always call permissioned functions and must have the necessary roles/permissions.
///    - The guardian's role MUST NOT be revocable by any other account — only the guardian itself
///      may renounce its own access.
///
///    When using OpenZeppelin's `AccessControl`, override `revokeRole()` to enforce this:
///
///      ```
///      function revokeRole(bytes32 role, address account)
///          public
///          override
///          onlyRole(getRoleAdmin(role))
///      {
///          address guardian = _getGuardian();
///          if (account == guardian) {
///              revert CannotRevokeGuardianRole();
///          }
///          super.revokeRole(role, account);
///      }
///      ```
///
///    This ensures that the Guardian always retains a backup path to call
///    permissioned functions, regardless of any admin action.
///
abstract contract VaultBase {
    /// @notice Error thrown when the current chain is not supported
    error UnsupportedChain(uint256 chainId);

    /// @notice Get the Portal address for the current chain
    /// @dev Currently supports BNB Chain (chain ID 56) and BNB Testnet (chain ID 97)
    /// @return portal The Portal contract address
    function _getPortal() internal view returns (address portal) {
        uint256 chainId = block.chainid;
        if (chainId == 56) {
            // BNB Chain Portal
            return 0xe2cE6ab80874Fa9Fa2aAE65D277Dd6B8e65C9De0;
        } else if (chainId == 97) {
            // BNB Testnet Portal
            return 0x5bEacaF7ABCbB3aB280e80D007FD31fcE26510e9;
        } else if (chainId == 4663 || chainId == 46630) {
            // Robinhood Chain Portal
            return 0x26605f322f7fF986f381bB9A6e3f5DAb0bEaEb09;
        }
        revert UnsupportedChain(chainId);
    }

    /// @notice Get the Guardian address for the current chain
    /// @dev Currently supports BNB Chain (chain ID 56) and BNB Testnet (chain ID 97)
    /// @return guardian The Guardian contract address
    function _getGuardian() internal view returns (address guardian) {
        uint256 chainId = block.chainid;
        if (chainId == 56) {
            // BNB Chain Guardian address
            return 0x9e27098dcD8844bcc6287a557E0b4D09C86B8a4b;
        } else if (chainId == 97) {
            // BNB Testnet Guardian address
            return 0x76Fa8C526f8Bc27ba6958B76DeEf92a0dbE46950;
        } else if (chainId == 4663 || chainId == 46630) {
            // Robinhood Chain Guardian address
            return 0x0000b48720d3B4ED6BC5031768B07F2b59270000;
        }
        revert UnsupportedChain(chainId);
    }

    /// @notice Returns a description of the vault
    /// @dev This method should be overridden by implementing contracts to provide
    ///      a dynamic description based on the vault's current state
    /// @return A string describing the vault's current state and configuration
    function description() public view virtual returns (string memory);
}

// lib/openzeppelin-contracts/contracts/interfaces/draft-IERC6093.sol

// OpenZeppelin Contracts (last updated v5.0.0) (interfaces/draft-IERC6093.sol)
pragma solidity ^0.8.20;

/**
 * @dev Standard ERC20 Errors
 * Interface of the https://eips.ethereum.org/EIPS/eip-6093[ERC-6093] custom errors for ERC20 tokens.
 */
interface IERC20Errors {
    /**
     * @dev Indicates an error related to the current `balance` of a `sender`. Used in transfers.
     * @param sender Address whose tokens are being transferred.
     * @param balance Current balance for the interacting account.
     * @param needed Minimum amount required to perform a transfer.
     */
    error ERC20InsufficientBalance(address sender, uint256 balance, uint256 needed);

    /**
     * @dev Indicates a failure with the token `sender`. Used in transfers.
     * @param sender Address whose tokens are being transferred.
     */
    error ERC20InvalidSender(address sender);

    /**
     * @dev Indicates a failure with the token `receiver`. Used in transfers.
     * @param receiver Address to which tokens are being transferred.
     */
    error ERC20InvalidReceiver(address receiver);

    /**
     * @dev Indicates a failure with the `spender`’s `allowance`. Used in transfers.
     * @param spender Address that may be allowed to operate on tokens without being their owner.
     * @param allowance Amount of tokens a `spender` is allowed to operate with.
     * @param needed Minimum amount required to perform a transfer.
     */
    error ERC20InsufficientAllowance(address spender, uint256 allowance, uint256 needed);

    /**
     * @dev Indicates a failure with the `approver` of a token to be approved. Used in approvals.
     * @param approver Address initiating an approval operation.
     */
    error ERC20InvalidApprover(address approver);

    /**
     * @dev Indicates a failure with the `spender` to be approved. Used in approvals.
     * @param spender Address that may be allowed to operate on tokens without being their owner.
     */
    error ERC20InvalidSpender(address spender);
}

/**
 * @dev Standard ERC721 Errors
 * Interface of the https://eips.ethereum.org/EIPS/eip-6093[ERC-6093] custom errors for ERC721 tokens.
 */
interface IERC721Errors {
    /**
     * @dev Indicates that an address can't be an owner. For example, `address(0)` is a forbidden owner in EIP-20.
     * Used in balance queries.
     * @param owner Address of the current owner of a token.
     */
    error ERC721InvalidOwner(address owner);

    /**
     * @dev Indicates a `tokenId` whose `owner` is the zero address.
     * @param tokenId Identifier number of a token.
     */
    error ERC721NonexistentToken(uint256 tokenId);

    /**
     * @dev Indicates an error related to the ownership over a particular token. Used in transfers.
     * @param sender Address whose tokens are being transferred.
     * @param tokenId Identifier number of a token.
     * @param owner Address of the current owner of a token.
     */
    error ERC721IncorrectOwner(address sender, uint256 tokenId, address owner);

    /**
     * @dev Indicates a failure with the token `sender`. Used in transfers.
     * @param sender Address whose tokens are being transferred.
     */
    error ERC721InvalidSender(address sender);

    /**
     * @dev Indicates a failure with the token `receiver`. Used in transfers.
     * @param receiver Address to which tokens are being transferred.
     */
    error ERC721InvalidReceiver(address receiver);

    /**
     * @dev Indicates a failure with the `operator`’s approval. Used in transfers.
     * @param operator Address that may be allowed to operate on tokens without being their owner.
     * @param tokenId Identifier number of a token.
     */
    error ERC721InsufficientApproval(address operator, uint256 tokenId);

    /**
     * @dev Indicates a failure with the `approver` of a token to be approved. Used in approvals.
     * @param approver Address initiating an approval operation.
     */
    error ERC721InvalidApprover(address approver);

    /**
     * @dev Indicates a failure with the `operator` to be approved. Used in approvals.
     * @param operator Address that may be allowed to operate on tokens without being their owner.
     */
    error ERC721InvalidOperator(address operator);
}

/**
 * @dev Standard ERC1155 Errors
 * Interface of the https://eips.ethereum.org/EIPS/eip-6093[ERC-6093] custom errors for ERC1155 tokens.
 */
interface IERC1155Errors {
    /**
     * @dev Indicates an error related to the current `balance` of a `sender`. Used in transfers.
     * @param sender Address whose tokens are being transferred.
     * @param balance Current balance for the interacting account.
     * @param needed Minimum amount required to perform a transfer.
     * @param tokenId Identifier number of a token.
     */
    error ERC1155InsufficientBalance(address sender, uint256 balance, uint256 needed, uint256 tokenId);

    /**
     * @dev Indicates a failure with the token `sender`. Used in transfers.
     * @param sender Address whose tokens are being transferred.
     */
    error ERC1155InvalidSender(address sender);

    /**
     * @dev Indicates a failure with the token `receiver`. Used in transfers.
     * @param receiver Address to which tokens are being transferred.
     */
    error ERC1155InvalidReceiver(address receiver);

    /**
     * @dev Indicates a failure with the `operator`’s approval. Used in transfers.
     * @param operator Address that may be allowed to operate on tokens without being their owner.
     * @param owner Address of the current owner of a token.
     */
    error ERC1155MissingApprovalForAll(address operator, address owner);

    /**
     * @dev Indicates a failure with the `approver` of a token to be approved. Used in approvals.
     * @param approver Address initiating an approval operation.
     */
    error ERC1155InvalidApprover(address approver);

    /**
     * @dev Indicates a failure with the `operator` to be approved. Used in approvals.
     * @param operator Address that may be allowed to operate on tokens without being their owner.
     */
    error ERC1155InvalidOperator(address operator);

    /**
     * @dev Indicates an array length mismatch between ids and values in a safeBatchTransferFrom operation.
     * Used in batch transfers.
     * @param idsLength Length of the array of token identifiers
     * @param valuesLength Length of the array of token amounts
     */
    error ERC1155InvalidArrayLength(uint256 idsLength, uint256 valuesLength);
}

// lib/openzeppelin-contracts-upgradeable/contracts/utils/ContextUpgradeable.sol

// OpenZeppelin Contracts (last updated v5.0.1) (utils/Context.sol)

pragma solidity ^0.8.20;

/**
 * @dev Provides information about the current execution context, including the
 * sender of the transaction and its data. While these are generally available
 * via msg.sender and msg.data, they should not be accessed in such a direct
 * manner, since when dealing with meta-transactions the account sending and
 * paying for execution may not be the actual sender (as far as an application
 * is concerned).
 *
 * This contract is only required for intermediate, library-like contracts.
 */
abstract contract ContextUpgradeable is Initializable {
    function __Context_init() internal onlyInitializing {
    }

    function __Context_init_unchained() internal onlyInitializing {
    }
    function _msgSender() internal view virtual returns (address) {
        return msg.sender;
    }

    function _msgData() internal view virtual returns (bytes calldata) {
        return msg.data;
    }

    function _contextSuffixLength() internal view virtual returns (uint256) {
        return 0;
    }
}

// lib/openzeppelin-contracts/contracts/token/ERC721/IERC721.sol

// OpenZeppelin Contracts (last updated v5.0.0) (token/ERC721/IERC721.sol)

pragma solidity ^0.8.20;


/**
 * @dev Required interface of an ERC721 compliant contract.
 */
interface IERC721 is IERC165 {
    /**
     * @dev Emitted when `tokenId` token is transferred from `from` to `to`.
     */
    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);

    /**
     * @dev Emitted when `owner` enables `approved` to manage the `tokenId` token.
     */
    event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId);

    /**
     * @dev Emitted when `owner` enables or disables (`approved`) `operator` to manage all of its assets.
     */
    event ApprovalForAll(address indexed owner, address indexed operator, bool approved);

    /**
     * @dev Returns the number of tokens in ``owner``'s account.
     */
    function balanceOf(address owner) external view returns (uint256 balance);

    /**
     * @dev Returns the owner of the `tokenId` token.
     *
     * Requirements:
     *
     * - `tokenId` must exist.
     */
    function ownerOf(uint256 tokenId) external view returns (address owner);

    /**
     * @dev Safely transfers `tokenId` token from `from` to `to`.
     *
     * Requirements:
     *
     * - `from` cannot be the zero address.
     * - `to` cannot be the zero address.
     * - `tokenId` token must exist and be owned by `from`.
     * - If the caller is not `from`, it must be approved to move this token by either {approve} or {setApprovalForAll}.
     * - If `to` refers to a smart contract, it must implement {IERC721Receiver-onERC721Received}, which is called upon
     *   a safe transfer.
     *
     * Emits a {Transfer} event.
     */
    function safeTransferFrom(address from, address to, uint256 tokenId, bytes calldata data) external;

    /**
     * @dev Safely transfers `tokenId` token from `from` to `to`, checking first that contract recipients
     * are aware of the ERC721 protocol to prevent tokens from being forever locked.
     *
     * Requirements:
     *
     * - `from` cannot be the zero address.
     * - `to` cannot be the zero address.
     * - `tokenId` token must exist and be owned by `from`.
     * - If the caller is not `from`, it must have been allowed to move this token by either {approve} or
     *   {setApprovalForAll}.
     * - If `to` refers to a smart contract, it must implement {IERC721Receiver-onERC721Received}, which is called upon
     *   a safe transfer.
     *
     * Emits a {Transfer} event.
     */
    function safeTransferFrom(address from, address to, uint256 tokenId) external;

    /**
     * @dev Transfers `tokenId` token from `from` to `to`.
     *
     * WARNING: Note that the caller is responsible to confirm that the recipient is capable of receiving ERC721
     * or else they may be permanently lost. Usage of {safeTransferFrom} prevents loss, though the caller must
     * understand this adds an external call which potentially creates a reentrancy vulnerability.
     *
     * Requirements:
     *
     * - `from` cannot be the zero address.
     * - `to` cannot be the zero address.
     * - `tokenId` token must be owned by `from`.
     * - If the caller is not `from`, it must be approved to move this token by either {approve} or {setApprovalForAll}.
     *
     * Emits a {Transfer} event.
     */
    function transferFrom(address from, address to, uint256 tokenId) external;

    /**
     * @dev Gives permission to `to` to transfer `tokenId` token to another account.
     * The approval is cleared when the token is transferred.
     *
     * Only a single account can be approved at a time, so approving the zero address clears previous approvals.
     *
     * Requirements:
     *
     * - The caller must own the token or be an approved operator.
     * - `tokenId` must exist.
     *
     * Emits an {Approval} event.
     */
    function approve(address to, uint256 tokenId) external;

    /**
     * @dev Approve or remove `operator` as an operator for the caller.
     * Operators can call {transferFrom} or {safeTransferFrom} for any token owned by the caller.
     *
     * Requirements:
     *
     * - The `operator` cannot be the address zero.
     *
     * Emits an {ApprovalForAll} event.
     */
    function setApprovalForAll(address operator, bool approved) external;

    /**
     * @dev Returns the account approved for `tokenId` token.
     *
     * Requirements:
     *
     * - `tokenId` must exist.
     */
    function getApproved(uint256 tokenId) external view returns (address operator);

    /**
     * @dev Returns if the `operator` is allowed to manage all of the assets of `owner`.
     *
     * See {setApprovalForAll}
     */
    function isApprovedForAll(address owner, address operator) external view returns (bool);
}

// src/flap/IPortal.sol

/// @dev Magic address value for `dividendToken` in NewTokenV6Params.
///      When set to this address, the dividend token is resolved to the tax token's own address
///      after it is created. This is a sugar for devs who do not want to pre-compute the tax token
///      address (it is deterministically computed from the salt).
///      Uses a well-known non-conflicting sentinel (0xfEED...fEED) to avoid conflict with:
///        - address(0): native gas token dividend (only valid when quoteToken is also native gas)
///        - any ERC-20 address: use that token as dividend (including quoteToken)
address constant MAGIC_DIVIDEND_SELF = address(0xfEEDFEEDfeEDFEedFEEdFEEDFeEdfEEdFeEdFEEd);

/// @dev Magic address value for `dividendToken` in NewTokenV6Params / FeeConfig.
///      When set to this address, VaultPortal asks the selected vault factory to compute the
///      actual dividend token from the CREATE2-predicted tax-token address before forwarding the
///      launch into Portal. Requires a v2.3+ vault factory.
///      Uses a dedicated sentinel (0xC0DE...C0DE) that does not collide with real ERC-20s,
///      address(0), or MAGIC_DIVIDEND_SELF.
address constant MAGIC_DIVIDEND_COMPUTED = address(0xC0Dec0dec0DeC0Dec0dEc0DEC0DEC0DEC0DEC0dE);

/// @title Common Types
/// @notice This interface defines common types shared across the portal
interface IPortalCommonTypes {
    /// @dev curve Types
    enum CurveType {
        CURVE_LEGACY_15, // r = 15
        CURVE_4, // r = 4
        CURVE_0_974, // r = 0.974
        CURVE_0_5, // r = 0.5
        CURVE_1000, // r = 1000
        CURVE_20000, // r = 20000
        CURVE_2500, // r = 2500
        CURVE_500, // r = 500
        CURVE_2, // r = 2
        CURVE_6, // r = 6
        CURVE_75, // r = 75
        CURVE_4M, // r= 4 M
        CURVE_28, // r = 28
        CURVE_21_25, // r = 21.25
        CURVE_RH_UNUSED, // r = 27.6, h = 352755468
        CURVE_RH_28D25_108002126, // r = 28.25, h = 108002126, k = 31301060059.5
        CURVE_RH_14981_108002125, // r = 14981, h = 108002125, k = 16598979834625
        CURVE_RH_TOSHI_MORPH_2ETH, // r = 0.7672, h = 107036751, k = 849318595.3672 - TOSHI/MORPH 2ETH curve
        CURVE_RH_TOSHI, // r = 6140351, h = 107036752, k = 6797594227179952 - TOSHI Curve
        CURVE_RH_BGB, // r = 767.5, h = 107036752, k = 849650707160 - BGB curve
        CURVE_RH_BNB, // r = 6.14, h = 107036752, k = 6797205657.28 - BNB Curve
        CURVE_RH_USD, // r = 3837, h = 107036752, k = 4247700017424 - USD curve
        CURVE_RH_MONAD, // r = 50000, h = 107036752, k = 55351837600000 - MONAD curve
        CURVE_RH_MONAD_V2, // r = 107400, h = 107036752, k = 118895747164800  - MONAD V2 curve
        CURVE_RH_KGST // r = 380000, h = 107036752, k = 420673965760000 - KGST curve
    }

    /// @dev dex threshold types
    enum DexThreshType {
        TWO_THIRDS, //  66.67% supply
        FOUR_FIFTHS, // 80% supply
        HALF, // 50% supply
        _95_PERCENT, // 95% supply
        _81_PERCENT, // 81% supply
        _1_PERCENT // 1% supply => mainly for testing
    }

    /// @notice Fee profile for tokens
    /// @dev Determines the fee structure applied to a token's trades and liquidity operations
    /// Fees are represented in basis points (bps), where 1% = 100 bps
    enum FlapFeeProfile {
        FEE_GLOBAL_DEFAULT, // Default fee profile used when no specific profile is set for a token
        FEE_FLAPSALE_V0 // Fee profile for FlapSale V0
    }

    //
    // Custom Errors for Common Types
    //

    /// @notice error if the curve type is invalid
    /// @param curveType The invalid curve type
    error InvalidCurveType(CurveType curveType);

    /// @notice error if the dex threshold type is invalid
    error InvalidDexThresholdType(DexThreshType threshold);
}

/// @title Types and Structs
/// @notice This interface defines the types and structs used in the portal
interface IPortalTypes is IPortalCommonTypes {
    //
    // public constants
    //

    //
    // Types and Structs
    //

    /// @dev Profile types for deployment-specific parameters or behaviors
    enum Profile {
        DEFAULT,
        TOSHI_MART,
        X_LAYER,
        MORPH,
        MONAD
    }

    /// @dev Token version
    /// Which token implementation is used
    enum TokenVersion {
        TOKEN_LEGACY_MINT_NO_PERMIT,
        TOKEN_LEGACY_MINT_NO_PERMIT_DUPLICATE, // for historical reasons, both 0 and 1 are the same: TOKEN_LEGACY_MINT_NO_PERMIT
        TOKEN_V2_PERMIT, // 2
        TOKEN_GOPLUS, // 3
        TOKEN_TAXED, // 4: The original tax token (FlapTaxToken)
        TOKEN_TAXED_V2, // 5: The new advanced tax token (FlapTaxTokenV2)
        TOKEN_TAXED_V3, // 6: The next-generation tax token with asymmetric buy/sell rates (FlapTaxTokenV3)
        TOKEN_V3_PERMIT // 7: Non-tax token using TokenV3 implementation with permit support
    }

    /// @dev the quote token, i.e, the token as the reserve
    enum QuoteTokenType {
        NATIVE_GAS_TOKEN, // The native gas token
        ERC20_TOKEN_WITH_PERMIT, //  The ERC20 token with permit
        ERC20_TOKEN_WITHOUT_PERMIT // The ERC20 token without permit
    }

    /// @notice the status of a token
    /// The token has 5 statuses:
    //    - Tradable: The token can be traded(buy/sell)
    //    - InDuel: (obsolete) The token is in a battle, it can only be bought but not sold.
    //    - Killed: (obsolete) The token is killed, it can not be traded anymore. Can only be redeemed for another token.
    //    - DEX: The token has been added to the DEX
    //    - Staged: The token is staged but not yet created (address is predetermined)
    enum TokenStatus {
        Invalid, // The token does not exist
        Tradable,
        InDuel, // obsolete
        Killed, // obsolete
        DEX,
        Staged // The token is staged (address determined, but not yet created)
    }

    /// @notice the migrator type
    /// @dev the migrator type determines how the liquidity is added to the DEX.
    /// Note: To mitigate the risk of DOS, if a V3 migrator is used but the liquidity cannot
    /// be added to v3 pools, the migrator will fallback to a V2 migrator.
    /// A TAX token must use a V2 migrator.
    enum MigratorType {
        V3_MIGRATOR, // Migrate the liquidity to a Uniswap V3 like pool
        V2_MIGRATOR, // Migrate the liquidity to a Uniswap V2 like pool
        V4_UNI_MIGRATOR, // Migrate the liquidity to a Uniswap V4 pool (Base, XLayer)
        PCS_INFINITY_CL_MIGRATOR // Migrate the liquidity to a Pancake Infinity CL Pool (BNB)
    }

    /// @notice the V3 LP fee profile
    /// @dev determines the LP fee tier to use when migrating tokens to Uniswap V3 or Pancake V3
    enum V3LPFeeProfile {
        LP_FEE_PROFILE_STANDARD, // Standard fee tier:  0.25% on PancakeSwap, 0.3% on Uniswap
        LP_FEE_PROFILE_LOW, // Low fee tier: typically, 0.01% on PancakeSwap, 0.05% on Uniswap
        LP_FEE_PROFILE_HIGH // High fee tier (1% for exotic pairs)
    }

    /// @notice the DEX ID
    /// @dev determines the DEX we want to migrate to
    /// On BSC:
    ///   - only DEX0 will be enabled, which is PancakeSwap
    /// On xLayer:
    ///   - only DEX0 will be enabled, which is PotatoSwap
    /// On Monad:
    ///   - DEX0 is Uniswap
    ///   - DEX1 is PancakeSwap
    ///   - DEX2 is Monday
    /// Note that, currently, we only support at most 3 DEXes
    /// We may add more DEXes in the future if needed
    enum DEXId {
        DEX0,
        DEX1,
        DEX2
    }

    /// @notice the state of a token (with dex related fields)
    struct TokenStateV2 {
        TokenStatus status; // the status of the token
        uint256 reserve; // the reserve of the token
        uint256 circulatingSupply; // the circulatingSupply of the token
        uint256 price; // the price of the token
        TokenVersion tokenVersion; // the version of the token implementation this token is using
        uint256 r; // the r of the curve of the token
        uint256 dexSupplyThresh; // the cirtulating supply threshold for adding the token to the DEX
    }

    /// @notice the state of a token (with all V2 fields plus quoteTokenAddress and nativeToQuoteSwapEnabled)
    struct TokenStateV3 {
        /// The status of the token (see TokenStatus enum)
        TokenStatus status;
        /// The reserve amount of the quote token held by the bonding curve
        uint256 reserve;
        /// The circulating supply of the token
        uint256 circulatingSupply;
        /// The current price of the token (in quote token units, 18 decimals)
        uint256 price;
        /// The version of the token implementation (see TokenVersion enum)
        TokenVersion tokenVersion;
        /// The curve parameter 'r' used for the bonding curve
        uint256 r;
        /// The circulating supply threshold for adding the token to the DEX
        uint256 dexSupplyThresh;
        /// The address of the quote token (address(0) if native gas token)
        address quoteTokenAddress;
        /// Whether native-to-quote swap is enabled for this token
        bool nativeToQuoteSwapEnabled;
    }

    /// @notice the state of a token (with all V3 fields plus extensionID and 'r' curve parameter only)
    struct TokenStateV4 {
        /// The status of the token (see TokenStatus enum)
        TokenStatus status;
        /// The reserve amount of the quote token held by the bonding curve
        uint256 reserve;
        /// The circulating supply of the token
        uint256 circulatingSupply;
        /// The current price of the token (in quote token units, 18 decimals)
        uint256 price;
        /// The version of the token implementation (see TokenVersion enum)
        TokenVersion tokenVersion;
        /// The curve parameter 'r' used for the bonding curve
        uint256 r;
        /// The circulating supply threshold for adding the token to the DEX
        uint256 dexSupplyThresh;
        /// The address of the quote token (address(0) if native gas token)
        address quoteTokenAddress;
        /// Whether native-to-quote swap is enabled for this token
        bool nativeToQuoteSwapEnabled;
        /// The extension ID used by the token (bytes32(0) if no extension)
        bytes32 extensionID;
    }

    /// @notice the state of a token (with all V4 fields plus all curve parameters)
    struct TokenStateV5 {
        /// The status of the token (see TokenStatus enum)
        TokenStatus status;
        /// The reserve amount of the quote token held by the bonding curve
        uint256 reserve;
        /// The circulating supply of the token
        uint256 circulatingSupply;
        /// The current price of the token (in quote token units, 18 decimals)
        uint256 price;
        /// The version of the token implementation (see TokenVersion enum)
        TokenVersion tokenVersion;
        /// The curve parameter 'r' used for the bonding curve
        uint256 r;
        /// The curve parameter 'h' - virtual token reserve
        uint256 h;
        /// The curve parameter 'k' - square of virtual liquidity
        uint256 k;
        /// The circulating supply threshold for adding the token to the DEX
        uint256 dexSupplyThresh;
        /// The address of the quote token (address(0) if native gas token)
        address quoteTokenAddress;
        /// Whether native-to-quote swap is enabled for this token
        bool nativeToQuoteSwapEnabled;
        /// The extension ID used by the token (bytes32(0) if no extension)
        bytes32 extensionID;
    }

    /// @notice the state of a token (with all V5 fields plus taxRate, pool, and progress)
    struct TokenStateV6 {
        /// The status of the token (see TokenStatus enum)
        TokenStatus status;
        /// The reserve amount of the quote token held by the bonding curve
        uint256 reserve;
        /// The circulating supply of the token
        uint256 circulatingSupply;
        /// The current price of the token (in quote token units, 18 decimals)
        uint256 price;
        /// The version of the token implementation (see TokenVersion enum)
        TokenVersion tokenVersion;
        /// The curve parameter 'r' used for the bonding curve
        uint256 r;
        /// The curve parameter 'h' - virtual token reserve
        uint256 h;
        /// The curve parameter 'k' - square of virtual liquidity
        uint256 k;
        /// The circulating supply threshold for adding the token to the DEX
        uint256 dexSupplyThresh;
        /// The address of the quote token (address(0) if native gas token)
        address quoteTokenAddress;
        /// Whether native-to-quote swap is enabled for this token
        bool nativeToQuoteSwapEnabled;
        /// The extension ID used by the token (bytes32(0) if no extension)
        bytes32 extensionID;
        /// The tax rate in basis points (0 if not a tax token)
        uint256 taxRate;
        /// The DEX pool address (address(0) if not listed on DEX)
        address pool;
        /// The progress towards DEX listing (0 to 1e18, where 1e18 = 100%)
        uint256 progress;
    }

    /// @notice the state of a token (with all V6 fields plus lpFeeProfile)
    struct TokenStateV7 {
        /// The status of the token (see TokenStatus enum)
        TokenStatus status;
        /// The reserve amount of the quote token held by the bonding curve
        uint256 reserve;
        /// The circulating supply of the token
        uint256 circulatingSupply;
        /// The current price of the token (in quote token units, 18 decimals)
        uint256 price;
        /// The version of the token implementation (see TokenVersion enum)
        TokenVersion tokenVersion;
        /// The curve parameter 'r' used for the bonding curve
        uint256 r;
        /// The curve parameter 'h' - virtual token reserve
        uint256 h;
        /// The curve parameter 'k' - square of virtual liquidity
        uint256 k;
        /// The circulating supply threshold for adding the token to the DEX
        uint256 dexSupplyThresh;
        /// The address of the quote token (address(0) if native gas token)
        address quoteTokenAddress;
        /// Whether native-to-quote swap is enabled for this token
        bool nativeToQuoteSwapEnabled;
        /// The extension ID used by the token (bytes32(0) if no extension)
        bytes32 extensionID;
        /// The tax rate in basis points (0 if not a tax token)
        uint256 taxRate;
        /// The DEX pool address (address(0) if not listed on DEX)
        address pool;
        /// The progress towards DEX listing (0 to 1e18, where 1e18 = 100%)
        uint256 progress;
        /// The V3 LP fee profile for the token
        V3LPFeeProfile lpFeeProfile;
        /// The Dex Id
        DEXId dexId;
    }

    struct TokenStateV8 {
        /// The status of the token (see TokenStatus enum)
        TokenStatus status;
        /// The reserve amount of the quote token held by the bonding curve
        uint256 reserve;
        /// The circulating supply of the token
        uint256 circulatingSupply;
        /// The current price of the token (in quote token units, 18 decimals)
        uint256 price;
        /// The version of the token implementation (see TokenVersion enum)
        TokenVersion tokenVersion;
        /// The curve parameter 'r' used for the bonding curve
        uint256 r;
        /// The curve parameter 'h' - virtual token reserve
        uint256 h;
        /// The curve parameter 'k' - square of virtual liquidity
        uint256 k;
        /// The circulating supply threshold for adding the token to the DEX
        uint256 dexSupplyThresh;
        /// The address of the quote token (address(0) if native gas token)
        address quoteTokenAddress;
        /// Whether native-to-quote swap is enabled for this token
        bool nativeToQuoteSwapEnabled;
        /// The extension ID used by the token (bytes32(0) if no extension)
        bytes32 extensionID;
        /// The buy tax rate in basis points (0 if not a tax token)
        uint256 buyTaxRate;
        /// The sell tax rate in basis points (0 if not a tax token)
        uint256 sellTaxRate;
        /// The DEX pool address (address(0) if not listed on DEX)
        address pool;
        /// The progress towards DEX listing (0 to 1e18, where 1e18 = 100%)
        uint256 progress;
        /// The V3 LP fee profile for the token
        V3LPFeeProfile lpFeeProfile;
        /// The Dex Id
        DEXId dexId;
    }

    /// @notice A forward-compatible version of TokenStateV8, where enum-typed fields are returned
    ///         as uint8 instead of their Solidity enum types.
    /// @dev Safe because Solidity revert when decoding an enum value that exceeds the enum's
    ///      declared maximum (e.g. a new TOKEN_TAXED_V3 value read by a contract compiled against
    ///      an old TokenVersion enum). By using uint8 for TokenStatus, TokenVersion,
    ///      V3LPFeeProfile, and DEXId, callers are not affected when new variants are added to
    ///      any of those enums in the future. Use getTokenV8 if you are always up-to-date with
    ///      the latest interface; use this method if you need forward/backward compatibility.
    struct TokenStateV8Safe {
        /// The status of the token (see TokenStatus enum for interpretation)
        uint8 status;
        /// The reserve amount of the quote token held by the bonding curve
        uint256 reserve;
        /// The circulating supply of the token
        uint256 circulatingSupply;
        /// The current price of the token (in quote token units, 18 decimals)
        uint256 price;
        /// The version of the token implementation (see TokenVersion enum for interpretation)
        uint8 tokenVersion;
        /// The curve parameter 'r' used for the bonding curve
        uint256 r;
        /// The curve parameter 'h' - virtual token reserve
        uint256 h;
        /// The curve parameter 'k' - square of virtual liquidity
        uint256 k;
        /// The circulating supply threshold for adding the token to the DEX
        uint256 dexSupplyThresh;
        /// The address of the quote token (address(0) if native gas token)
        address quoteTokenAddress;
        /// Whether native-to-quote swap is enabled for this token
        bool nativeToQuoteSwapEnabled;
        /// The extension ID used by the token (bytes32(0) if no extension)
        bytes32 extensionID;
        /// The buy tax rate in basis points (0 if not a tax token)
        uint256 buyTaxRate;
        /// The sell tax rate in basis points (0 if not a tax token)
        uint256 sellTaxRate;
        /// The DEX pool address (address(0) if not listed on DEX)
        address pool;
        /// The progress towards DEX listing (0 to 1e18, where 1e18 = 100%)
        uint256 progress;
        /// The V3 LP fee profile for the token (see V3LPFeeProfile enum for interpretation)
        uint8 lpFeeProfile;
        /// The Dex Id (see DEXId enum for interpretation)
        uint8 dexId;
    }

    /// @notice Parameters for creating a new token (V2)
    struct NewTokenV2Params {
        /// The name of the token
        string name;
        /// The symbol of the token
        string symbol;
        /// The metadata URI of the token
        string meta;
        /// The DEX supply threshold type
        DexThreshType dexThresh;
        /// The salt for deterministic deployment
        bytes32 salt;
        /// The tax rate in basis points (if non-zero, this is a tax token)
        uint16 taxRate;
        /// The migrator type (see MigratorType enum)
        MigratorType migratorType;
        /// The quote token address (native gas token if zero address)
        address quoteToken;
        /// The initial quote token amount to spend for buying
        uint256 quoteAmt;
        /// The beneficiary address for the token
        /// For rev share tokens, this is the address that can claim the LP fees
        /// For tax tokens, this is the address that receives the tax fees
        address beneficiary;
        /// The optional permit data for the quote token
        bytes permitData;
    }

    /// @notice Parameters for creating a new token (V3) with extension support
    struct NewTokenV3Params {
        /// The name of the token
        string name;
        /// The symbol of the token
        string symbol;
        /// The metadata URI of the token
        string meta;
        /// The DEX supply threshold type
        DexThreshType dexThresh;
        /// The salt for deterministic deployment
        bytes32 salt;
        /// The tax rate in basis points (if non-zero, this is a tax token)
        uint16 taxRate;
        /// The migrator type (see MigratorType enum)
        MigratorType migratorType;
        /// The quote token address (native gas token if zero address)
        address quoteToken;
        /// The initial quote token amount to spend for buying
        uint256 quoteAmt;
        /// The beneficiary address for the token
        /// For rev share tokens, this is the address that can claim the LP fees
        /// For tax tokens, this is the address that receives the tax fees
        address beneficiary;
        /// The optional permit data for the quote token
        bytes permitData;
        /// @notice The ID of the extension to be used for the new token if not zero
        bytes32 extensionID;
        /// @notice Additional extension specific data to be passed to the extension's `onTokenCreation` method, check the extension's documentation for details on the expected format and content.
        bytes extensionData;
    }

    /// @notice Parameters for creating a new token (V4) with DEX ID and LP fee profile support
    struct NewTokenV4Params {
        /// The name of the token
        string name;
        /// The symbol of the token
        string symbol;
        /// The metadata URI of the token
        string meta;
        /// The DEX supply threshold type
        DexThreshType dexThresh;
        /// The salt for deterministic deployment
        bytes32 salt;
        /// The tax rate in basis points (if non-zero, this is a tax token)
        uint16 taxRate;
        /// The migrator type (see MigratorType enum)
        MigratorType migratorType;
        /// The quote token address (native gas token if zero address)
        address quoteToken;
        /// The initial quote token amount to spend for buying
        uint256 quoteAmt;
        /// The beneficiary address for the token
        /// For rev share tokens, this is the address that can claim the LP fees
        /// For tax tokens, this is the address that receives the tax fees
        address beneficiary;
        /// The optional permit data for the quote token
        bytes permitData;
        /// @notice The ID of the extension to be used for the new token if not zero
        bytes32 extensionID;
        /// @notice Additional extension specific data to be passed to the extension's `onTokenCreation` method, check the extension's documentation for details on the expected format and content.
        bytes extensionData;
        /// @notice The preferred DEX ID for the token
        DEXId dexId;
        /// @notice The preferred V3 LP fee profile for the token
        V3LPFeeProfile lpFeeProfile;
    }

    /// @notice Parameters for creating a new token (V5) with tax V2 support
    struct NewTokenV5Params {
        /// The name of the token
        string name;
        /// The symbol of the token
        string symbol;
        /// The metadata URI of the token
        string meta;
        /// The DEX supply threshold type
        DexThreshType dexThresh;
        /// The salt for deterministic deployment
        bytes32 salt;
        /// The tax rate in basis points (if non-zero, this is a tax token)
        uint16 taxRate;
        /// The migrator type (see MigratorType enum)
        MigratorType migratorType;
        /// The quote token address (native gas token if zero address)
        address quoteToken;
        /// The initial quote token amount to spend for buying
        uint256 quoteAmt;
        /// The beneficiary address for the token
        /// For rev share tokens, this is the address that can claim the LP fees
        /// For tax tokens, this is the address that receives the tax fees
        address beneficiary;
        /// The optional permit data for the quote token
        bytes permitData;
        /// @notice The ID of the extension to be used for the new token if not zero
        bytes32 extensionID;
        /// @notice Additional extension specific data to be passed to the extension's `onTokenCreation` method, check the extension's documentation for details on the expected format and content.
        bytes extensionData;
        /// @notice The preferred DEX ID for the token
        DEXId dexId;
        /// @notice The preferred V3 LP fee profile for the token
        V3LPFeeProfile lpFeeProfile;
        // New V5 tax-specific fields (only used when taxRate > 0)
        /// Tax duration in seconds (max: 100 years)
        uint64 taxDuration;
        /// Anti-farmer duration in seconds (max: 1 year)
        uint64 antiFarmerDuration;
        /// Market allocation basis points (to beneficiary)
        uint16 mktBps;
        /// Deflation basis points (burned)
        uint16 deflationBps;
        /// Dividend basis points (to dividend contract)
        uint16 dividendBps;
        /// Liquidity provision basis points (LP to dead address)
        uint16 lpBps;
        /// Minimum balance for dividend eligibility (min: 10K ether, required when dividendBps > 0)
        uint256 minimumShareBalance;
    }

    /// @dev Magic address value for `dividendToken` in NewTokenV6Params.
    ///      When set to MAGIC_DIVIDEND_SELF, the dividend token is resolved to the tax token's own address
    ///      after it is created. See MAGIC_DIVIDEND_SELF file-level constant.

    /// @notice Parameters for creating a new token (V6) with asymmetric tax and custom dividend token
    struct NewTokenV6Params {
        // --- Same base fields as V5 ---
        /// The name of the token
        string name;
        /// The symbol of the token
        string symbol;
        /// The metadata URI of the token
        string meta;
        /// The DEX supply threshold type
        DexThreshType dexThresh;
        /// The salt for deterministic deployment
        bytes32 salt;
        /// The migrator type (see MigratorType enum)
        MigratorType migratorType;
        /// The quote token address (native gas token if zero address)
        address quoteToken;
        /// The initial quote token amount to spend for buying
        uint256 quoteAmt;
        /// The beneficiary address for the token
        address beneficiary;
        /// The optional permit data for the quote token
        bytes permitData;
        /// The ID of the extension to be used for the new token if not zero
        bytes32 extensionID;
        /// Additional extension specific data
        bytes extensionData;
        /// The preferred DEX ID for the token
        DEXId dexId;
        /// The preferred V3 LP fee profile for the token
        V3LPFeeProfile lpFeeProfile;
        // --- Tax fields (all zero = non-tax token, behaves like newTokenV5) ---
        /// Buy tax rate in basis points (0 = no buy tax)
        uint16 buyTaxRate;
        /// Sell tax rate in basis points (0 = no sell tax)
        uint16 sellTaxRate;
        /// Tax duration in seconds
        uint64 taxDuration;
        /// Anti-farmer duration in seconds
        uint64 antiFarmerDuration;
        /// Market allocation basis points (to beneficiary)
        uint16 mktBps;
        /// Deflation basis points (burned)
        uint16 deflationBps;
        /// Dividend basis points (to dividend contract)
        uint16 dividendBps;
        /// Liquidity provision basis points (LP to dead address)
        uint16 lpBps;
        /// Minimum balance for dividend eligibility (required when dividendBps > 0)
        uint256 minimumShareBalance;
        // --- New V3-only fields ---
        /// @notice Dividend distribution token:
        ///   address(0)         = native gas token dividend (only valid when quoteToken is also address(0))
        ///   MAGIC_DIVIDEND_SELF = distribute the tax token itself as dividend
        ///   MAGIC_DIVIDEND_COMPUTED = let VaultPortal ask a v2.3+ vault factory to compute the
        ///                             dividend token from the predicted tax-token address
        ///   quoteToken address  = explicitly use the quote token as dividend (must be set explicitly)
        ///   any other ERC-20   = use that specific ERC-20 as dividend token
        address dividendToken;
        /// @notice Commission receiver address (zero = disabled).
        ///         MUST be address(0) for non-tax tokens (buyTaxRate == 0 && sellTaxRate == 0).
        ///         commissionBps is NOT provided here — it is calculated internally by the launcher
        ///         based on the effective tax rate via _commissionForTax().
        address commissionReceiver;
        /// @notice The token version to create. Determines which launcher path is used.
        ///   TOKEN_V2_PERMIT  — non-tax token (standard ERC-20 with permit)
        ///   TOKEN_TAXED      — V1 tax token (symmetric rates, mktBps=10000, no commission)
        ///   TOKEN_TAXED_V2   — V2 tax token (asymmetric rates, flexible distribution, no commission, mktBps != 10000)
        ///   TOKEN_TAXED_V3   — V3 tax token (asymmetric rates, flexible distribution, commission supported)
        TokenVersion tokenVersion;
    }
    // NOTE: `converter` is NOT in this struct — it is provided as an immutable
    // in PortalBase and automatically passed to TaxProcessor at initialization.

    // ─── V7 Fee Configuration ────────────────────────────────────────────────

    enum FeeType {
        NONE,
        MARKETING_OR_VAULT,
        DIVIDEND,
        DEFLATION,
        LP_BPS
    }

    struct FeeConfig {
        FeeType feeType;
        uint16 bps;
        address marketingAddress;
        address dividendToken;
        uint256 minimumShareBalance;
    }

    struct NewTokenV7Params {
        string name;
        string symbol;
        string meta;
        DexThreshType dexThresh;
        bytes32 salt;
        MigratorType migratorType;
        address quoteToken;
        uint256 quoteAmt;
        bytes permitData;
        bytes32 extensionID;
        bytes extensionData;
        DEXId dexId;
        uint16 buyTaxRate;
        uint16 sellTaxRate;
        uint64 taxDuration;
        uint64 antiFarmerDuration;
        address commissionReceiver;
        TokenVersion tokenVersion;
        FeeConfig[4] feeConfigs;
    }

    /// @notice Parameters for staging a new token (V5) - immutable parameters only
    struct StageNewTokenV5Params {
        /// The DEX supply threshold type
        DexThreshType dexThresh;
        /// The salt for deterministic deployment
        bytes32 salt;
        /// Whether this is a tax token
        bool isTaxToken;
        /// The migrator type (see MigratorType enum)
        MigratorType migratorType;
        /// The quote token address (native gas token if zero address)
        address quoteToken;
        /// @notice The preferred DEX ID for the token
        DEXId dexId;
    }

    /// @notice Parameters for committing a staged token (V5) - mutable/deployment-time parameters
    struct CommitNewTokenV5Params {
        /// The salt for deterministic deployment (must match staged salt)
        bytes32 salt;
        /// The tax rate in basis points (0 for non-tax tokens)
        uint16 taxRate;
        /// The name of the token
        string name;
        /// The symbol of the token
        string symbol;
        /// The metadata URI of the token
        string meta;
        /// The initial quote token amount to spend for buying
        uint256 quoteAmt;
        /// The beneficiary address for the token
        /// For rev share tokens, this is the address that can claim the LP fees
        /// For tax tokens, this is the address that receives the tax fees
        address beneficiary;
        /// The optional permit data for the quote token
        bytes permitData;
        // New V5 tax-specific fields (only used when taxRate > 0)
        /// Tax duration in seconds (max: 100 years)
        uint64 taxDuration;
        /// Anti-farmer duration in seconds (max: 1 year)
        uint64 antiFarmerDuration;
        /// Market allocation basis points (to beneficiary)
        uint16 mktBps;
        /// Deflation basis points (burned)
        uint16 deflationBps;
        /// Dividend basis points (to dividend contract)
        uint16 dividendBps;
        /// Liquidity provision basis points (LP to dead address)
        uint16 lpBps;
        /// Minimum balance for dividend eligibility (required when dividendBps > 0)
        uint256 minimumShareBalance;
    }

    /// @dev The configuration of the "native to quote" swap
    /// i.e How to swap ETH for the quote token when the quote token is not ETH
    enum NativeToQuoteSwapType {
        SWAP_DISABLED, // 0: disabled
        SWAP_VIA_V2_POOL, // 1: swap through v2 pool
        SWAP_VIA_V3_2500_POOL, // 2: swap through v3 2500 pool
        SWAP_VIA_V3_500_POOL, // 3: swap through v3 500 pool
        SWAP_VIA_V3_3000_POOL, // 4: swap through v3 3000 pool
        SWAP_VIA_V3_10000_POOL, // 5: swap through v3 10000 pool
        SWAP_VIA_MIXED_ROUTER // 6: multi-hop via PancakeSwap Infinity MixedQuoter + UniversalRouter (BSC only)
        //    used for tokens like uUSD that route BNB ↔ USDT(V3) ↔ uUSD(BinPool).
        //    The actual routing logic is bypassed in _shouldUseMixedRouter() before
        //    the enum is checked, so this value serves as a meaningful marker when
        //    calling setQuoteTokenConfiguration — any non-SWAP_DISABLED value would
        //    work, but this makes intent explicit.
    }

    /// @dev  the quote token configurations
    struct QuoteTokenConfiguration {
        uint8 enabled; // 8bit: 1 if allowed, 0 if not allowed
        CurveType defaultCurve; // 8bit: the default token curve type of the quote token
        CurveType alternativeCurve; // 8bit: the alternative token curve type of the quote token
        NativeToQuoteSwapType nativeToQuoteSwapType; // 8bit: the native to quote swap feature configuration of the quote token
        uint8 dexId; // 8bit: DEX ID for multiple DEXes support
    }

    /// @dev Enum for DEX pool types
    enum PoolType {
        V2, // Uniswap V2 style pools
        V3 // Uniswap V3 style pools
    }

    /// @dev Packed DEX pool information
    struct PackedDexPool {
        address pool; // 160 bits: pool address
        uint24 fee; // 24 bits: fee tier (for V3), 0 for V2
        PoolType poolType; // 8 bits: enum for pool type
        uint64 unused; // 64 bits: reserved for future use
    }

    /// @notice Records who locked a CREATE2 salt and for which token version.
    ///         locker + tokenVersion pack into a single 32-byte storage slot.
    struct SaltLockEntry {
        address locker; // 20 bytes — address that paid to reserve this salt
        uint8 tokenVersion; // 1 byte  — TokenVersion enum value at lock time
    }

    //
    // Events
    //

    /// @notice emitted when a token is staged (but not yet created)
    ///
    /// @param ts The timestamp of the event
    /// @param creator The address of the creator
    /// @param token The predetermined address of the token
    event FlapTokenStaged(uint256 ts, address creator, address token);

    /// @notice emitted when a new token is created
    ///
    /// @param ts The timestamp of the event
    /// @param creator The address of the creator
    /// @param nonce The nonce of the token
    /// @param token  The address of the token
    /// @param name  The name of the token
    /// @param symbol  The symbol of the token
    /// @param meta The meta URI of the token
    event TokenCreated(
        uint256 ts, address creator, uint256 nonce, address token, string name, string symbol, string meta
    );

    /// @notice emitted when a token is bought
    ///
    /// @param ts The timestamp of the event
    /// @param token  The address of the token
    /// @param buyer  The address of the buyer
    /// @param amount  The amount of tokens bought
    /// @param eth  The amount of ETH spent
    /// @param fee The amount of ETH spent on fee
    /// @param postPrice The price of the token after this trade
    event TokenBought(
        uint256 ts, address token, address buyer, uint256 amount, uint256 eth, uint256 fee, uint256 postPrice
    );

    /// @notice emitted when a token is sold
    ///
    /// @param ts The timestamp of the event
    /// @param token  The address of the token
    /// @param seller  The address of the seller
    /// @param amount  The amount of tokens sold
    /// @param eth  The amount of ETH received
    /// @param fee  The amount of ETH deducted as a fee
    /// @param postPrice The price of the token after this trade
    event TokenSold(
        uint256 ts, address token, address seller, uint256 amount, uint256 eth, uint256 fee, uint256 postPrice
    );

    /// emitted when a token's curve is set
    /// @param token The address of the token
    /// @param curve The address of the curve
    /// @param curveParameter The parameter of the curve
    event TokenCurveSet(address token, address curve, uint256 curveParameter);

    /// @notice emitted when a token's curve parameters are set (V2)
    /// @param token The address of the token
    /// @param r The virtual ETH reserve parameter
    /// @param h The virtual token reserve parameter
    /// @param k The square of the virtual Liquidity parameter
    event TokenCurveSetV2(address token, uint256 r, uint256 h, uint256 k);

    /// emitted when a token's dexSupplyThresh is set
    /// @param token The address of the token
    /// @param dexSupplyThresh The new dexSupplyThresh of the token
    event TokenDexSupplyThreshSet(address token, uint256 dexSupplyThresh);

    /// emitted when a token's implementation is set
    /// @param token The address of the token
    /// @param version The version of the token
    event TokenVersionSet(address token, TokenVersion version);

    /// @notice emitted when a new vanity token is created
    /// @param token The address of the created token
    /// @param creator The address of the creator
    /// @param beneficiary The address of the beneficiary
    event VanityTokenCreated(address token, address creator, address beneficiary);

    /// @notice emitted when a token's quote token is set
    /// @param token The address of the token
    /// @param quoteToken The address of the quote token
    event TokenQuoteSet(address token, address quoteToken);

    /// @notice emitted when a token's migrator is set
    /// @param token The address of the token
    /// @param migratorType The migrator type
    event TokenMigratorSet(address token, MigratorType migratorType);

    /// @notice emitted when a token's extension is enabled
    /// @param token The address of the token
    /// @param extensionID The extension ID
    /// @param extensionAddress The address of the extension contract
    /// @param version The version of the extension
    event TokenExtensionEnabled(address token, bytes32 extensionID, address extensionAddress, uint8 version);

    /// @notice emitted when a token's pool info is updated
    /// @param token The address of the token
    /// @param poolInfo The new pool information
    event TokenPoolInfoUpdated(address token, PackedDexPool poolInfo);

    /// @notice emitted when a trader's fee exemption status is updated
    /// @param trader The address of the trader
    /// @param isExempted Whether the trader is exempted from fees
    event FeeExemptionUpdated(address indexed trader, bool isExempted);

    //
    // events
    //

    /// @notice emitted when token is redeemed
    /// @param ts The timestamp of the event
    /// @param srcToken The address of the token to redeem
    /// @param dstToken The address of the token to receive
    /// @param srcAmount The amount of srcToken to redeem
    /// @param dstAmount The amount of dstToken to receive
    /// @param who The address of the redeemer
    event TokenRedeemed(
        uint256 ts, address srcToken, address dstToken, uint256 srcAmount, uint256 dstAmount, address who
    );

    /// @notice emitted when the bit flags are changed
    /// @param oldFlags The old flags
    /// @param newFlags The new flags
    event BitFlagsChanged(uint256 oldFlags, uint256 newFlags);

    /// @notice emitted when adding liquidity to DEX
    /// @param token The address of the token
    /// @param pool The address of the pool
    /// @param amount The amount of token added
    /// @param eth The amount of quote Token added
    event LaunchedToDEX(address token, address pool, uint256 amount, uint256 eth);

    /// @notice emitted when the progress of a token changes
    /// @param token The address of the token
    /// @param newProgress The new progress value in Wad
    event FlapTokenProgressChanged(address token, uint256 newProgress);

    //
    // Token V2 supply change
    //

    /// @notice emitted when the circulating supply of a token changes
    /// @param token The address of the token
    /// @param newSupply The new circulating supply
    event FlapTokenCirculatingSupplyChanged(address token, uint256 newSupply);

    /// @notice emitted when a new tax is set for a token
    /// @dev For V3 tokens with asymmetric rates, this carries max(buyTax, sellTax) for backward compatibility.
    ///      Listen for FlapTokenAsymmetricTaxSet to get the full buy/sell split.
    /// @param token The address of the token
    /// @param tax The tax value set for the token (max of buy and sell rates for V3 tokens)
    event FlapTokenTaxSet(address token, uint256 tax);

    /// @notice Emitted when a token is launched with asymmetric buy/sell tax rates (V3 tokens only).
    /// @dev Emitted in addition to FlapTokenTaxSet (which carries max(buyTax, sellTax) for backward
    ///      compatibility). New systems that support asymmetric rates should listen to this event.
    ///      Old systems that only read FlapTokenTaxSet will continue to work correctly.
    /// @param token The address of the token
    /// @param buyTax The buy tax rate in basis points
    /// @param sellTax The sell tax rate in basis points
    event FlapTokenAsymmetricTaxSet(address token, uint256 buyTax, uint256 sellTax);

    // operation related
    // should remove later

    /// @notice emitted when a users successfully checked in
    /// @param user The address of the user
    event CheckedIn(address user);

    /// @notice emitted when a beneficiary claims fees
    /// @param token The address of the token
    /// @param beneficiary The address of the beneficiary
    /// @param tokenAmount The amount of the token claimed
    /// @param ethAmount The amount of ETH claimed
    event BeneficiaryClaimed(address token, address beneficiary, uint256 tokenAmount, uint256 ethAmount);

    /// @notice emitted when a token beneficiary is changed
    /// @param token The address of the token
    /// @param oldBeneficiary The previous beneficiary address
    /// @param newBeneficiary The new beneficiary address
    event BeneficiaryChanged(address token, address oldBeneficiary, address newBeneficiary);

    /// @notice emitted when an extension is registered
    /// @param extensionId The unique identifier for the extension
    /// @param extensionAddress The address of the extension contract
    /// @param version The version of the extension
    event ExtensionRegistered(bytes32 extensionId, address extensionAddress, uint8 version);

    /// @notice emitted when a spammer's blocked status is changed
    /// @param spammer The address of the spammer
    /// @param blocked True if blocked, false if unblocked
    event SpammerBlockedStatusChanged(address spammer, bool blocked);

    /// @notice emitted when a user is rate limited from creating tokens
    /// @param user The address of the rate-limited user
    /// @param lastCreationTime The timestamp of their last successful token creation
    event RateLimited(address user, uint256 lastCreationTime);

    /// @notice emitted when a quote token configuration is set
    /// @param quoteToken The address of the quote token
    /// @param config The configuration set for the quote token
    event QuoteTokenConfigurationSet(address quoteToken, QuoteTokenConfiguration config);

    /// @notice emitted when a V3 favored fee is set for a quote token
    /// @param quoteToken The address of the quote token
    /// @param favoredFee The favored fee set for the quote token
    event V3FavoredFeeSet(address quoteToken, uint24 favoredFee);

    /// @notice emitted when a token's DEX preference is set
    /// @param token The address of the token
    /// @param dexId The preferred DEX ID for the token
    /// @param lpFeeProfile The preferred V3 LP fee profile for the token
    event TokenDexPreferenceSet(address token, DEXId dexId, V3LPFeeProfile lpFeeProfile);

    /// @notice emitted when a message is sent
    /// @param sender The address of the sender
    /// @param token The address of the token
    /// @param message The message sent
    event MsgSent(address sender, address token, string message);

    //
    // Custom Errors
    //

    /// @notice error if the dex is both pancake and algebra1.9
    ///         which is impossible
    error DEXCannotBeBothPancakeAndAlgebra1_9();

    /// @notice error if the portal lens address is zero
    error PortalLensCannotBeZero();

    /// @notice error if the multi dex router address is zero
    error MultiDexRouterCannotBeZero();

    /// @notice error if the token does not exist
    error TokenNotFound(address token);

    /// @notice error if the amount is too small
    error AmountTooSmall(uint256 amount);

    /// @notice error if slippage is too high
    /// i.e: actualAmount < minAmount
    error SlippageTooHigh(uint256 actualAmount, uint256 minAmount);

    /// @notice error if the input token & output token of a swap is the same
    error SameToken(address tokenA);

    /// @notice error if trying to trade a killed token
    error TokenKilled(address token);

    /// @notice error if token is not tradable
    error TokenNotTradable(address token);

    /// @notice error if trying to sell a token that is in a battle
    error TokenInDuel(address token);

    /// @notice error if trying to redeem a token that is not killed
    error TokenNotKilled(address token);

    /// @notice error if the token has already been added to the DEX
    error TokenAlreadyDEXed(address token);

    /// @notice error if the token has already been staged or created
    error TokenAlreadyStaged(address token);

    /// @notice error if the token is not in staged status
    error TokenNotStaged(address token);

    /// @notice error if the token is not listed on DEX yet
    error TokenNotDEXed(address token);

    /// @notice error if there is no conversion path from srcToken to dstToken
    error NoConversionPath(address srcToken, address dstToken);

    /// @notice error if the round is not found
    error RoundNotFound(uint256 id);

    /// @notice error if the round id is invalid
    error InvalidRoundID(uint256 id);

    /// @notice error if try to start a new round but the last round is not resolved
    error LastRoundNotResolved();

    /// @notice cannot use a token for the next round of the game
    error InvalidTokenForBattle(address token);

    /// @notice error if the signature is invalid
    error InvalidSigner(address signer);

    /// @notice error if the seq is not found in Game queue
    error SeqNotFound(uint256 seq);

    /// @notice error if not implemented yet
    error NotImplemented();

    /// @notice error a token is already in the game
    error TokenAlreadyInGame(address token);

    /// @notice error if a call reverted but without any data
    error CallReverted();

    /// @notice error if creating token is disabled
    error PermissionlessCreateDisabled();

    /// @notice error if trading is disabled
    error TradeDisabled();

    /// @notice error if the circuit breakers are off
    error ProtocolDisabled();

    /// @notice error if the game supply threshold is not valid
    error InvalidGameSupplyThreshold();

    /// @notice error if the dex supply threshold is not valid
    error InvalidDEXSupplyThreshold();

    /// @notice error if the proof does not match the msg.sender
    error MismatchedAddressInProof(address expected, address actual);

    /// @notice error if the whitlist creator cannot create more tokens
    error NoQuotaForCreator(uint256 created, uint256 max);

    /// @notice error if the piggyback lenght is not valid
    error InvalidPiggybackLength(uint256 expected, uint256 actual);

    /// @notice error if the feature is disabled
    error FeatureDisabled();

    /// @notice error if caller is not authorized (e.g., only SaleForge can call)
    error OnlySaleForge();

    /// @notice error if the quote token is not allowed
    error QuoteTokenNotAllowed(address quoteToken);

    /// @notice error if a native to quote swap is required but not supported
    /// native to quote swap: i.e, swap the input token to the desired quote token
    error NativeToQuoteSwapNotSupported();

    /// @notice error if the native to quote swap v3 fee type is not supported
    /// @param NativeToQuoteSwapType The unsupported native to quote swap type
    error NativeToQuoteSwapFeeTierNotSupported(uint8 NativeToQuoteSwapType);

    /// @notice error if met any dirty bits
    error DirtyBits();

    //
    // Dex Related
    //

    /// @notice error if sqrPriceA is gte than sqrtPriceB
    error PriceAMustLTPriceB(uint160 sqrtPriceA, uint160 sqrtPriceB);

    /// @notice error if the actual amount is more than the expected amount
    error ActualAmountMustLTEAmount(uint256 actualAmount, uint256 amount1);

    /// @notice error if the msg.sender is not a Uniswap V3 pool
    error NotUniswapV3Pool(address sender);

    /// @notice error if the uniswap v2 pool's liquidity is not zero
    error UniswapV2PoolNotZero(address pool, uint256 liquidity);

    /// @notice error if the required token amount for adding Uniswap v2 liquidity is more than the remaining token
    error RequiredTokenMustLTE(uint256 requiredToken, uint256 reserveToken);

    /// @notice revert when calling slot0 of a Uniswap V3 pool failed
    error UniswapV3Slot0Failed();

    /// @notice error if a non-position NFT is received
    error NonPositionNFTReceived(address collection);

    /// @notice error if the provided dex threshold is invalid
    error InvalidDexThreshold(uint256 threshold);

    /// @notice error if the provided address is not a valid pool
    error InvalidPoolAddress(address pool, address expected);

    //
    // staking related
    //

    /// @notice error if the locks are invalid
    error InvalidLocks();

    /// @notice error if staking feature is not enabled
    error StakingDisabled();

    /// @notice error if the operator does not have the roller role
    error NotRoller();

    // operation related

    /// @notice error if the user cannot check in yet
    /// @param next The timestamp when the user can check in again
    error cannotCheckInUntil(uint256 next);

    // misc

    /// @notice error if another token has the same meta
    error MetaAlreadyUsedByOtherToken(string meta);

    /// @notice error if the creation fee is insufficient
    error InsufficientCreationFee(uint256 required, uint256 provided);

    /// @notice error if the provided ETH is insufficient to cover the required fee
    /// @param required The required fee amount
    /// @param provided The provided ETH amount
    error InsufficientFee(uint256 required, uint256 provided);

    /// @notice error if the vanity address requirement is not met
    /// @param token The generated token address
    error VanityAddressRequirementNotMet(address token);

    /// @notice error if the token is not in DEX status
    error TokenNotInDEXStatus(address token);

    /// @notice error if the caller is not the token's beneficiary
    error CallerNotBeneficiary(address caller, address expected);

    /// @notice error if no locks are available for the token
    error NoLocksAvailable(address token);

    /// @notice error if the provided ETH is insufficient to cover the required input amount
    /// @param provided The provided ETH amount
    /// @param required The required ETH amount
    error InsufficientEth(uint256 provided, uint256 required);

    /// @notice error if the provided tax bps is invalid
    /// @param tax The provided tax bps
    error InvalidTaxBps(uint256 tax);

    /// @notice error if the transferFrom call failed
    /// @param token The address of the token
    /// @param from The address from which the tokens were to be transferred
    /// @param amount The amount of tokens that were to be transferred
    error TransferFromFailed(address token, address from, uint256 amount);

    /// @notice error if the migrator type is invalid
    error InvalidMigratorType();

    /// @notice error if the quote token is not native but not using PortalTradeV2
    error QuoteTokenNotNativeButNotUsingTradeV2();

    /// @notice error if the msg.value is less than expected value when creating
    /// a tax token using an ERC20 (e.g: USDC) token as the quote token.
    /// @dev For the tax token's tax splitter to work properly, we need approximately 1gwei due to our
    /// implemenation of the tax splitter.
    error InsufficientValueForTaxTokenCreation(uint256 expected, uint256 provided);

    /// @notice error if the caller is not a guardian or admin
    /// @param caller The address of the caller
    error NotGuardian(address caller);

    /// @notice error if the extension version is not supported
    /// @param version The unsupported extension version
    error UnsupportedExtensionVersion(uint8 version);

    /// @notice error if the token uses an extension but is traded through the legacy PortalTrade contract
    /// @param token The address of the token with an extension
    error TokenWithExtensionNotSupported(address token);

    /// @notice error if the parameters for ToshiMart are invalid
    error InvalidParamsForToshiMart();

    /// @notice error if the parameters for X_LAYER are invalid
    error InvalidParamsForXLayer();

    /// @notice error if the quote token configuration is invalid
    error InvalidQuoteTokenConfiguration();

    /// @notice error when trying to use PortalTrade with tokens that have non-zero h parameter
    error ErrShouldUsePortalTradeV2();

    /// @notice error when no supported DEX is found for the token
    error NoSupportedDEX();

    /// @notice invalid fee tier for DEX
    error InvalidFeeTierForDEX();

    /// @notice error if the tax distribution percentages don't add up to 100%
    error InvalidTaxDistribution();

    /// @notice error if tax duration exceeds maximum allowed
    error TaxDurationTooLong();

    /// @notice error if tax duration is less than minimum allowed
    error TaxDurationTooShort();

    /// @notice error if anti-farmer duration exceeds maximum allowed
    error AntiFarmerDurationTooLong();

    /// @notice error if anti-farmer duration is less than minimum allowed
    error AntiFarmerDurationTooShort();

    /// @notice error if minimum share balance is too low for dividend eligibility
    error MinimumShareBalanceTooLow();

    /// @notice error when dividend parameters are missing but required
    error DividendParametersRequired();

    /// @notice error when user is rate limited from creating tokens
    /// @param user The address that is rate limited
    /// @param lastCreationTime The timestamp of the user's last successful token creation
    error RateLimitExceeded(address user, uint256 lastCreationTime);

    /// @notice error when user is permanently blocked from creating tokens
    /// @param user The address that is blocked
    error SpammerBlocked(address user);

    // --- Salt Locking ---

    /// @notice Emitted when a salt is locked by a user.
    /// @param locker       The address that paid to lock the salt.
    /// @param salt         The CREATE2 salt that was locked.
    /// @param tokenAddress The predicted token address derived from salt + tokenVersion.
    /// @param tokenVersion The TokenVersion enum value the lock applies to.
    /// @param ts           Block timestamp of the lock.
    event FlapSaltLocked(address locker, bytes32 salt, address tokenAddress, uint8 tokenVersion, uint256 ts);

    /// @notice Emitted when a locked salt is consumed by a successful launch.
    /// @param locker       The address that originally locked the salt.
    /// @param salt         The CREATE2 salt that was used.
    /// @param tokenAddress The token address that was launched.
    /// @param tokenVersion The TokenVersion enum value that was locked.
    /// @param ts           Block timestamp of the launch.
    event FlapSaltUsed(address locker, bytes32 salt, address tokenAddress, uint8 tokenVersion, uint256 ts);

    /// @notice msg.value does not equal the required SALT_LOCK_FEE.
    error SaltLockFeeMismatch(uint256 required, uint256 provided);

    /// @notice The salt is already locked by a different address.
    error SaltAlreadyLockedByAnotherUser(bytes32 salt, address existingLocker);

    /// @notice The caller tried to lock a salt they already hold the lock for.
    error SaltAlreadyLockedBySelf(bytes32 salt);

    /// @notice Launch was rejected because the salt is locked by someone other than the caller.
    error FlapSaltLockedByAnotherUser(bytes32 salt, address locker);

    /// @notice Launch was rejected because the locked tokenVersion does not match the one being launched.
    error SaltLockTokenVersionMismatch(bytes32 salt, TokenVersion locked, TokenVersion provided);

    /// @notice The tokenVersion passed to lockSalt() is not currently supported.
    error UnsupportedTokenVersion(TokenVersion provided);
}

/// @notice Callback interface implemented by VaultPortal (or any trusted caller).
///         Portal calls getSaltOwner() when msg.sender == VAULT_PORTAL to resolve the
///         effective user for salt-lock enforcement without changing any parameter structs.
interface ISaltOwnerProvider {
    /// @notice Return the address that should be treated as the salt owner for the current launch.
    /// @dev VaultPortal must set _pendingSaltOwner before delegating into Portal.
    ///      The call is a staticcall so it cannot modify state.
    function getSaltOwner() external view returns (address);
}

/// @title IPortalLauncherTwoStep
/// @notice Interface for the two-step token launch process
interface IPortalLauncherTwoStep is IPortalTypes {
    /// @notice Stage a new token (V5) without creating it yet
    /// @param params The immutable parameters for the new token
    /// @return token The predetermined address of the token
    /// @dev This stages a token by validating parameters and reserving the token address.
    ///      The token contract is not deployed yet. Call commitNewTokenV5 to actually deploy it.
    ///      Extensions are not supported in two-step launch. LP fee profile is always STANDARD.
    /// FIXME: this is not enabled in this version. Will be available once the audit for this part is ready.
    function stageNewTokenV5(StageNewTokenV5Params calldata params) external returns (address token);

    /// @notice Commit a staged token (V5) and create it
    /// @param params The parameters for token deployment (includes salt to identify staged token)
    /// @dev This deploys the token contract and initializes it. The token must have been staged first via stageNewTokenV5.
    ///      The salt and isTaxToken in params must match what was used during staging.
    ///      If taxRate > 0, creates FlapTaxTokenV2, otherwise creates regular token.
    /// FIXME: this is not enabled in this version. Will be available once the audit for this part is ready.
    function commitNewTokenV5(CommitNewTokenV5Params calldata params) external payable;
}

/// @notice Handles token creation and related operations
interface IPortalLauncher is IPortalTypes {
    /// @notice Create a new token (V2) with flexible parameters
    /// @param params The parameters for the new token
    /// @return token The address of the created
    /// @dev due to the implementation limit, when creating a tax token and using an ERC20 token as the quote token,
    /// You need to pay an extra 1gwei native gas token (i.e msg.value = 1 gwei), or you will encounter an InsufficientValueForTaxTokenCreation error
    function newTokenV2(NewTokenV2Params calldata params) external payable returns (address token);

    /// @notice Create a new token (V3) with extension support
    /// @param params The parameters for the new token including extension configuration
    /// @return token The address of the created token
    /// @dev Similar to newTokenV2 but with extension support. Extension hooks will be called if extensionID is non-zero
    function newTokenV3(NewTokenV3Params calldata params) external payable returns (address token);

    /// @notice Create a new token (V4) with DEX ID and LP fee profile support
    /// @param params The parameters for the new token including DEX ID and LP fee profile
    /// @return token The address of the created token
    /// @dev Similar to newTokenV3 but with DEX ID and LP fee profile support. Allows specifying preferred DEX and fee tier
    function newTokenV4(NewTokenV4Params calldata params) external payable returns (address token);

    /// @notice Create a new token (V5) with tax V2 support
    /// @param params The parameters for the new token including advanced tax features
    /// @return token The address of the created token
    /// @dev Similar to newTokenV4 but with support for FlapTaxTokenV2 when taxRate > 0.
    ///      When taxRate is 0, behaves like newTokenV4 (uses regular token or FlapTaxToken).
    ///      When taxRate > 0, creates a FlapTaxTokenV2 with advanced tax distribution features.
    /// FIXME: this is not enabled in this version. Will be available once the audit for this part is ready.
    function newTokenV5(NewTokenV5Params calldata params) external payable returns (address token);

    /// @notice Create a new token (V6) — unified entry point for all token versions.
    /// @param params The parameters for the new token (see NewTokenV6Params).
    /// @return token The address of the created token.
    ///
    /// @dev Dispatch logic based on `params.tokenVersion`:
    ///
    ///   TOKEN_V2_PERMIT (non-tax token):
    ///     - buyTaxRate and sellTaxRate MUST both be 0.
    ///     - commissionReceiver MUST be address(0).
    ///     - Dispatched to PortalLauncherV5 → creates a standard ERC-20 (TOKEN_V2_PERMIT).
    ///
    ///   TOKEN_TAXED (V1 tax token):
    ///     - At least one tax rate must be > 0.
    ///     - buyTaxRate MUST equal sellTaxRate (symmetric rates only).
    ///     - mktBps MUST be 10000 (all tax goes to beneficiary after protocol fee).
    ///     - dividendBps MUST be 0; deflationBps and lpBps MUST be 0.
    ///     - commissionReceiver MUST be address(0) (commission not supported).
    ///     - Dispatched to PortalLauncherV5Tax → creates a FlapTaxToken (TOKEN_TAXED).
    ///
    ///   TOKEN_TAXED_V2 (V2 tax token):
    ///     - At least one tax rate must be > 0.
    ///     - buyTaxRate MUST equal sellTaxRate (symmetric rates only via V5 path).
    ///     - mktBps MUST NOT be 10000 (use TOKEN_TAXED for that case).
    ///     - mktBps + deflationBps + dividendBps + lpBps MUST equal 10000.
    ///     - commissionReceiver MUST be address(0) (commission not supported).
    ///     - Dispatched to PortalLauncherV5Tax → creates a FlapTaxTokenV2 (TOKEN_TAXED_V2).
    ///
    ///   TOKEN_TAXED_V3 (V3 tax token):
    ///     - At least one tax rate must be > 0.
    ///     - Asymmetric rates allowed (buyTaxRate != sellTaxRate is OK).
    ///     - mktBps + deflationBps + dividendBps + lpBps MUST equal 10000.
    ///     - mktBps == 10000 IS allowed (all tax → protocol fee + commission, no marketing).
    ///     - commissionReceiver CAN be non-zero (commission supported).
    ///     - Dispatched to PortalLauncherTaxV3.launchTaxTokenV3 → creates a FlapTaxTokenV3 (TOKEN_TAXED_V3).
    ///
    /// Emits FlapTokenTaxSet (with max rate) AND FlapTokenAsymmetricTaxSet for tax tokens.
    function newTokenV6(NewTokenV6Params calldata params) external payable returns (address token);

    /// @notice Reserve the token address derived from `salt` by paying SALT_LOCK_FEE.
    /// @dev    The caller must pass the `tokenVersion` they intend to lock for.
    ///         Accepted values include the non-tax V3-permit path (typically 0x8888 vanity)
    ///         and the tax V3 path (typically 0x7777 vanity).
    /// @param salt         CREATE2 salt to reserve.
    /// @param tokenVersion Token version to lock for.
    function lockSalt(bytes32 salt, TokenVersion tokenVersion) external payable;

    /// @notice Launch a new token with V4 / PCS Infinity migration support.
    /// @param params The V7 token parameters
    /// @return token The created token address
    function newTokenV7(NewTokenV7Params calldata params) external payable returns (address token);
}

/// @title Portal Lens Interface
/// @notice Handles read-only token state queries
interface IPortalLens is IPortalTypes {
    /// @notice Get token state
    /// @param token  The address of the token
    /// @return state  The state of the token
    function getTokenV2(address token) external view returns (TokenStateV2 memory state);
    /// @notice Get token state (V3)
    /// @param token  The address of the token
    /// @return state  The state of the token (V3)
    function getTokenV3(address token) external view returns (TokenStateV3 memory state);
    /// @notice Get token state (V4)
    /// @param token  The address of the token
    /// @return state  The state of the token (V4) with only 'r' curve parameter
    function getTokenV4(address token) external view returns (TokenStateV4 memory state);
    /// @notice Get token state (V5)
    /// @param token  The address of the token
    /// @return state  The state of the token (V5) with all curve parameters (r, h, k)
    function getTokenV5(address token) external view returns (TokenStateV5 memory state);
    /// @notice Get token state (V6)
    /// @param token  The address of the token
    /// @return state  The state of the token (V6) with all V5 fields plus taxRate, pool, and progress
    function getTokenV6(address token) external view returns (TokenStateV6 memory state);
    /// @notice Get token state (V7)
    /// @param token  The address of the token
    /// @return state  The state of the token (V7) with all V6 fields plus lpFeeProfile
    function getTokenV7(address token) external view returns (TokenStateV7 memory state);
    /// @notice Get token state (V8)
    /// @param token  The address of the token
    /// @return state  The state of the token (V8) with asymmetric buyTaxRate and sellTaxRate
    function getTokenV8(address token) external view returns (TokenStateV8 memory state);
    /// @notice Get token state (V8Safe)
    /// @dev Returns enum-typed fields (TokenStatus, TokenVersion, V3LPFeeProfile, DEXId) as uint8
    ///      instead of their Solidity enum types, preventing ABI-decoding reverts when new enum
    ///      variants are introduced. Use this method when you need forward/backward compatibility
    ///      with future contract upgrades that may add new enum values.
    /// @param token  The address of the token
    /// @return state  The state of the token with enum fields encoded as uint8
    function getTokenV8Safe(address token) external view returns (TokenStateV8Safe memory state);
    /// @notice Get the quote token configuration for a given quote token address
    /// @param quoteToken The address of the quote token
    /// @return config The configuration of the quote token
    function getQuoteTokenConfiguration(address quoteToken)
        external
        view
        returns (QuoteTokenConfiguration memory config);

    /// @notice Get the salt lock entry for a given CREATE2 salt.
    /// @param salt The CREATE2 salt to query.
    /// @return entry The SaltLockEntry (locker == address(0) means unlocked).
    function getSaltLock(bytes32 salt) external view returns (SaltLockEntry memory entry);
}

/// @title IPortalTrade Interface
/// @notice Handles token trading and redemption
interface IPortalTrade is IPortalTypes {
    /// @notice Buy token with ETH on creation
    /// @param token  The address of the token to buy
    /// @param recipient  The address to send the token to
    /// @param inputAmount The amount of ETH to spend
    ///
    /// @dev  This function is mainly for internal use (be delegated called from the portal contract)
    ///       The msg.value can be greater than inputAmount, the excess ETH will not be
    ///       refunded to the caller. They will be charged as a fee.
    ///
    ///       Note: the slippage is not checked in this function.
    ///
    function buyOnCreation(address token, address recipient, uint256 inputAmount)
        external
        payable
        returns (uint256 amount);

    /// @notice Buy token with ETH
    /// @param token  The address of the token to buy
    /// @param recipient  The address to send the token to
    /// @param minAmount  The minimum amount of tokens to buy
    function buy(address token, address recipient, uint256 minAmount) external payable returns (uint256 amount);

    /// @notice Sell token for ETH
    /// @param token  The address of the token to sell
    /// @param amount The amount of tokens to sell
    /// @param minEth The minimum amount of ETH to receive
    function sell(address token, uint256 amount, uint256 minEth) external returns (uint256 eth);

    /// @notice Redeem a killed token for another token
    /// @param srcToken The address of the token to redeem
    /// @param dstToken The address of the token to receive
    /// @param srcAmount The amount of srcToken to redeem
    /// @return dstAmount The amount of dstToken to receive
    function redeem(address srcToken, address dstToken, uint256 srcAmount) external returns (uint256 dstAmount);

    /// @notice Preview the amount of tokens to buy with ETH
    /// @param token  The address of the token to buy
    /// @param eth  The amount of ETH to spend
    /// @return amount  The amount of tokens to buy
    function previewBuy(address token, uint256 eth) external view returns (uint256 amount);

    /// @notice Preview the amount of ETH to receive for selling tokens
    /// @param token  The address of the token to sell
    /// @param amount  The amount of tokens to sell
    /// @return eth  The amount of ETH to receive
    function previewSell(address token, uint256 amount) external view returns (uint256 eth);

    /// @notice Preview redeem
    /// @param srcToken The address of the token to redeem
    /// @param dstToken The address of the token to receive
    /// @param srcAmount The amount of srcToken to redeem
    /// @return dstAmount The amount of dstToken to receive
    function previewRedeem(address srcToken, address dstToken, uint256 srcAmount)
        external
        view
        returns (uint256 dstAmount);
}

/// @title IPortalTradeV2 Interface
/// @notice Handles unified token swaps and quoting
interface IPortalTradeV2 is IPortalTypes {
    /// @notice Emitted when tax is paid on bonding curve for TAX_TOKEN
    /// @param token The address of the token
    /// @param amount The amount of tax paid
    event TaxOnBondingCurvePaid(address indexed token, uint256 amount);

    /// @notice Emitted when tax is paid on bonding curve for TAX_TOKEN_V2
    /// @param token The address of the token
    /// @param amount The amount of tax paid
    event TaxV2OnBondingCurvePaid(address indexed token, uint256 amount);

    /// @notice Parameters for swapping exact input amount for output token
    struct ExactInputParams {
        /// @notice The address of the input token (use address(0) for native asset)
        address inputToken;
        /// @notice The address of the output token (use address(0) for native asset)
        address outputToken;
        /// @notice The amount of input token to swap (in input token decimals)
        uint256 inputAmount;
        /// @notice The minimum amount of output token to receive
        uint256 minOutputAmount;
        /// @notice Optional permit data for the input token (can be empty)
        bytes permitData;
    }

    /// @notice Parameters for swapping exact input amount for output token (V3) with extension support
    struct ExactInputV3Params {
        /// @notice The address of the input token (use address(0) for native asset)
        address inputToken;
        /// @notice The address of the output token (use address(0) for native asset)
        address outputToken;
        /// @notice The amount of input token to swap (in input token decimals)
        uint256 inputAmount;
        /// @notice The minimum amount of output token to receive
        uint256 minOutputAmount;
        /// @notice Optional permit data for the input token (can be empty)
        bytes permitData;
        /// @notice Additional extension specific data to be passed to the extension's `onTrade` method, check the extension's documentation for details on the expected format and content
        bytes extensionData;
    }

    /// @notice Parameters for quoting the output amount for a given input
    struct QuoteExactInputParams {
        /// @notice The address of the input token (use address(0) for native asset)
        address inputToken;
        /// @notice The address of the output token (use address(0) for native asset)
        address outputToken;
        /// @notice The amount of input token to swap (in input token decimals)
        uint256 inputAmount;
    }
    /// @notice Swap exact input amount for output token
    /// @param params The swap parameters
    /// @return outputAmount The amount of output token received
    /// @dev Here are some possible scenarios:
    ///   If the token's reserve is BNB or ETH (i.e: the quote token is the native gas token):
    ///      - BUY: input token is address(0), output token is the token address
    ///      - SELL: input token is the token address, output token is address(0)
    ///   If the token's reserve is another ERC20 token (eg. USD*, i.e, the quote token is an ERC20 token):
    ///      - BUY with USD*: input token is the USD* address, output token is the token address
    ///      - SELL for USD*: input token is the token address, output token is the USD* address
    ///      - BUY with BNB or ETH: input token is address(0), output token is the token address.
    ///        (Note: this requires an internal swap to convert BNB/ETH to USD*, nativeToQuoteSwap must be anabled for this quote token)
    /// Note: Currently, this method supports trading tokens that is either still on the bonding curve or already listed on DEX.

    function swapExactInput(ExactInputParams calldata params) external payable returns (uint256 outputAmount);

    /// @notice Swap exact input amount for output token (V3) with extension support
    /// @param params The swap parameters including extension data
    /// @return outputAmount The amount of output token received
    /// @dev Similar to swapExactInput but with extension support. Extension hooks will be called if the token uses an extension
    function swapExactInputV3(ExactInputV3Params calldata params) external payable returns (uint256 outputAmount);

    /// @notice Quote the output amount for a given input
    /// @param params The quote parameters
    /// @return outputAmount The quoted output amount
    /// @dev refer to the swapExactInput method for the scenarios
    function quoteExactInput(QuoteExactInputParams calldata params) external returns (uint256 outputAmount);
}

/// @title IPortalCore Interface
/// @notice Combines IPortalLauncher and IPortalTrade
interface IPortalCore is IPortalLauncher, IPortalTrade, IPortalTradeV2 {}

/// @title IPortalMigrator Interface
/// @notice Add liquidity from the bonding curve to DEX
/// @dev this is not a public interface of the portal.
///      All the functions of this interface are either called from the portal
///      or from the UniswapV3Pool contract.
interface IPortalMigrator {
    /// @notice Add liquidity to DEX
    /// @param token The address of the token
    /// @dev This is an internal function
    ///      Any dispatch to this function should be checked in portal contract
    ///      This function may be dellegated called from a payable function.
    function luanchToDEX(address token) external payable;
}

/// @title IRoller Interface
/// @notice This acts as the glue between the portal and the flap staking contract
interface IRoller {
    /// @notice The lock the token is using
    enum LockType {
        INVALID_LOCK, // Invalid lock
        UNCX_LOCK, // The UNCX lock
        GOPLUS_UNIV3_LOCK, // The Goplus UNIv3 lock
        TOSHI_LP_LOCK, // The Toshi LP lock
        IZI_LP_LOCK // The IziSwap LP locker
    }

    /// @notice get the locks by token address
    /// @param token The address of the token
    /// @return locks The lock ids of the token
    function getLocks(address token) external view returns (uint256[] memory locks);

    /// @dev deprecated
    function rollv2(bytes calldata packedParams) external;

    /// @notice Revenue Share: Claim LP fees for a vanity token
    /// @param token The address of the token
    /// @return tokenAmount The amount of the token claimed
    /// @return ethAmount The amount of ETH claimed
    /// @dev Only the beneficiary of the token can call this function.
    function claim(address token) external returns (uint256 tokenAmount, uint256 ethAmount);

    /// @notice Allows the default admin to change the beneficiary of a token
    /// @param token The address of the token
    /// @param newBeneficiary The new beneficiary address
    function setTokenBeneficiary(address token, address newBeneficiary) external;

    /// @notice Allows a roller or default admin to claim LP fees on behalf of the beneficiary
    /// @param token The address of the token
    /// @return tokenAmount The amount of the token claimed
    /// @return quoteAmount The amount of quote token (or ETH) claimed
    /// @dev Only the roller or default admin can call this function.
    /// The claimed fee will be sent to the beneficiary of the token.
    function delegateClaim(address token) external returns (uint256 tokenAmount, uint256 quoteAmount);
}

interface IPortalDexRouter {
    // @notice Update the DEX pool information for a token
    // @dev can only be called by DEX_ROUTER_MANAGER_ROLE roles
    function updateTokenPoolInfo(address token, IPortalTypes.PackedDexPool calldata poolInfo) external;
}

/// @title IPortalTweak Interface
/// @notice Handles admin-only configuration operations for the Portal
interface IPortalTweak is IPortalTypes {
    /// @notice Parameters for updating tax token addresses
    struct TaxTokenAddressUpdate {
        /// @notice The address of the tax token to update
        address token;
        /// @notice The new beneficiary address for the tax splitter
        address beneficiary;
        /// @notice The new fee receiver address for the tax splitter
        address feeReceiver;
    }

    /// @notice Emitted when tax token addresses are updated
    /// @param token The address of the tax token
    /// @param beneficiary The new beneficiary address
    /// @param feeReceiver The new fee receiver address
    /// @dev Only Default ADMIN can change this
    event TaxTokenAddressesUpdated(address indexed token, address beneficiary, address feeReceiver);

    /// @notice Set the configuration for a quote token
    /// @dev Only callable by the default admin
    /// @param quoteToken The address of the quote token
    /// @param config The configuration struct for the quote token
    function setQuoteTokenConfiguration(address quoteToken, QuoteTokenConfiguration calldata config) external;

    /// @notice Set the fee exemption status for a list of traders
    /// @dev Only callable by the default admin
    /// @param traders The addresses of the traders to set exemption for
    /// @param isExempted Whether the traders should be exempted from fees
    function setFeeExemption(address[] memory traders, bool isExempted) external;

    /// @notice Get the current buy and sell fee rates
    /// @return buyFeeRate The current buy fee rate in basis points (e.g. 200 = 2%)
    /// @return sellFeeRate The current sell fee rate in basis points (e.g. 200 = 2%)
    function getFeeRate() external view returns (uint256 buyFeeRate, uint256 sellFeeRate);

    /// @notice Set the fee profile for a token
    /// @dev Only callable by DEFAULT_ADMIN_ROLE or TOKEN_FLAP_FEE_SETTER_ROLE
    /// @param token The address of the token
    /// @param feeProfile The fee profile to set
    function setFlapFeeProfile(address token, FlapFeeProfile feeProfile) external;

    /// @notice Update beneficiary and feeReceiver addresses for one or more tax tokens
    /// @dev Only callable by the default admin or TAX_MANAGER_ROLE
    /// @param updates Array of TaxTokenAddressUpdate structs containing token addresses and new addresses
    function updateTaxTokenAddresses(TaxTokenAddressUpdate[] calldata updates) external;

    /// @notice Register an extension for use with the portal
    /// @param extensionId The unique identifier for this extension
    /// @param extensionAddress The address of the extension contract
    /// @param version The version of the extension interface it implements (starting from 1)
    /// @dev Only callable by the default admin
    function registerExtension(bytes32 extensionId, address extensionAddress, uint8 version) external;

    /// @notice Block or unblock multiple addresses from creating tokens
    /// @param spammers The addresses to block or unblock
    /// @param blocked True to block, false to unblock
    /// @dev Only callable by the default admin or MODERATOR_ROLE
    function setSpammerBlockedBatch(address[] calldata spammers, bool blocked) external;

    /// @notice Emitted when stuck tax tokens are recovered from the tax splitter
    /// @param taxToken The address of the tax token
    /// @param amountSentToToken The amount of tokens sent back to the tax token contract
    /// @param amountReturnedToSplitter The amount of tokens returned to the tax splitter
    event StuckTaxTokenRecovered(address indexed taxToken, uint256 amountSentToToken, uint256 amountReturnedToSplitter);

    /// @notice Recover stuck tax tokens from the tax splitter and re-inject up to liquidationThreshold into the token
    /// @dev Only callable by AUDITOR_ROLE. Currently supports V1 (TOKEN_TAXED) tax tokens.
    ///      The name is intentionally generic to allow extension to V2/V3 tax tokens in the future.
    /// @param taxToken The address of the V1 tax token to recover stuck tokens for
    function recoverStuckTaxToken(address taxToken) external;
}

/// @title Portal Interface
/// @notice This interface combines the core and game interfaces
interface IPortal is
    IPortalCore,
    IAccessControl,
    IRoller,
    IPortalDexRouter,
    IPortalTweak,
    IPortalLens,
    IPortalLauncherTwoStep
{
    /// @notice Get the version of the portal
    /// @return The version string
    function version() external view returns (string memory);

    /// @notice Check if tax on bonding curve is enabled
    /// @return enabled True if tax on bonding curve is enabled
    function enableTaxOnBondingCurve() external view returns (bool enabled);

    /// @notice Change the protocol bit flags
    /// @dev Can only be called with DEFAULT_ADMIN_ROLE
    /// @param flags The new flags
    function setBitFlags(uint256 flags) external;

    /// @notice Can only be called by the guardian role or the default admin role
    /// @dev This function is used to pause the protocol
    function halt() external;

    /// @notice Check if an address is blocked from creating tokens
    /// @param spammer The address to check
    /// @return True if the address is blocked
    function isSpammerBlocked(address spammer) external view returns (bool);

    /// @notice Send a message for a token
    /// @param token The address of the token
    /// @param message The message to send
    function sendMsg(address token, string memory message) external;

    /// @notice Get the current nonce of the portal
    function nonce() external view returns (uint256);
}

// lib/openzeppelin-contracts/contracts/access/Ownable.sol

// OpenZeppelin Contracts (last updated v5.0.0) (access/Ownable.sol)

pragma solidity ^0.8.20;


/**
 * @dev Contract module which provides a basic access control mechanism, where
 * there is an account (an owner) that can be granted exclusive access to
 * specific functions.
 *
 * The initial owner is set to the address provided by the deployer. This can
 * later be changed with {transferOwnership}.
 *
 * This module is used through inheritance. It will make available the modifier
 * `onlyOwner`, which can be applied to your functions to restrict their use to
 * the owner.
 */
abstract contract Ownable is Context {
    address private _owner;

    /**
     * @dev The caller account is not authorized to perform an operation.
     */
    error OwnableUnauthorizedAccount(address account);

    /**
     * @dev The owner is not a valid owner account. (eg. `address(0)`)
     */
    error OwnableInvalidOwner(address owner);

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    /**
     * @dev Initializes the contract setting the address provided by the deployer as the initial owner.
     */
    constructor(address initialOwner) {
        if (initialOwner == address(0)) {
            revert OwnableInvalidOwner(address(0));
        }
        _transferOwnership(initialOwner);
    }

    /**
     * @dev Throws if called by any account other than the owner.
     */
    modifier onlyOwner() {
        _checkOwner();
        _;
    }

    /**
     * @dev Returns the address of the current owner.
     */
    function owner() public view virtual returns (address) {
        return _owner;
    }

    /**
     * @dev Throws if the sender is not the owner.
     */
    function _checkOwner() internal view virtual {
        if (owner() != _msgSender()) {
            revert OwnableUnauthorizedAccount(_msgSender());
        }
    }

    /**
     * @dev Leaves the contract without owner. It will not be possible to call
     * `onlyOwner` functions. Can only be called by the current owner.
     *
     * NOTE: Renouncing ownership will leave the contract without an owner,
     * thereby disabling any functionality that is only available to the owner.
     */
    function renounceOwnership() public virtual onlyOwner {
        _transferOwnership(address(0));
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Can only be called by the current owner.
     */
    function transferOwnership(address newOwner) public virtual onlyOwner {
        if (newOwner == address(0)) {
            revert OwnableInvalidOwner(address(0));
        }
        _transferOwnership(newOwner);
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Internal function without access restriction.
     */
    function _transferOwnership(address newOwner) internal virtual {
        address oldOwner = _owner;
        _owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
}

// lib/openzeppelin-contracts-upgradeable/contracts/utils/ReentrancyGuardUpgradeable.sol

// OpenZeppelin Contracts (last updated v5.0.0) (utils/ReentrancyGuard.sol)

pragma solidity ^0.8.20;

/**
 * @dev Contract module that helps prevent reentrant calls to a function.
 *
 * Inheriting from `ReentrancyGuard` will make the {nonReentrant} modifier
 * available, which can be applied to functions to make sure there are no nested
 * (reentrant) calls to them.
 *
 * Note that because there is a single `nonReentrant` guard, functions marked as
 * `nonReentrant` may not call one another. This can be worked around by making
 * those functions `private`, and then adding `external` `nonReentrant` entry
 * points to them.
 *
 * TIP: If you would like to learn more about reentrancy and alternative ways
 * to protect against it, check out our blog post
 * https://blog.openzeppelin.com/reentrancy-after-istanbul/[Reentrancy After Istanbul].
 */
abstract contract ReentrancyGuardUpgradeable is Initializable {
    // Booleans are more expensive than uint256 or any type that takes up a full
    // word because each write operation emits an extra SLOAD to first read the
    // slot's contents, replace the bits taken up by the boolean, and then write
    // back. This is the compiler's defense against contract upgrades and
    // pointer aliasing, and it cannot be disabled.

    // The values being non-zero value makes deployment a bit more expensive,
    // but in exchange the refund on every call to nonReentrant will be lower in
    // amount. Since refunds are capped to a percentage of the total
    // transaction's gas, it is best to keep them low in cases like this one, to
    // increase the likelihood of the full refund coming into effect.
    uint256 private constant NOT_ENTERED = 1;
    uint256 private constant ENTERED = 2;

    /// @custom:storage-location erc7201:openzeppelin.storage.ReentrancyGuard
    struct ReentrancyGuardStorage {
        uint256 _status;
    }

    // keccak256(abi.encode(uint256(keccak256("openzeppelin.storage.ReentrancyGuard")) - 1)) & ~bytes32(uint256(0xff))
    bytes32 private constant ReentrancyGuardStorageLocation = 0x9b779b17422d0df92223018b32b4d1fa46e071723d6817e2486d003becc55f00;

    function _getReentrancyGuardStorage() private pure returns (ReentrancyGuardStorage storage $) {
        assembly {
            $.slot := ReentrancyGuardStorageLocation
        }
    }

    /**
     * @dev Unauthorized reentrant call.
     */
    error ReentrancyGuardReentrantCall();

    function __ReentrancyGuard_init() internal onlyInitializing {
        __ReentrancyGuard_init_unchained();
    }

    function __ReentrancyGuard_init_unchained() internal onlyInitializing {
        ReentrancyGuardStorage storage $ = _getReentrancyGuardStorage();
        $._status = NOT_ENTERED;
    }

    /**
     * @dev Prevents a contract from calling itself, directly or indirectly.
     * Calling a `nonReentrant` function from another `nonReentrant`
     * function is not supported. It is possible to prevent this from happening
     * by making the `nonReentrant` function external, and making it call a
     * `private` function that does the actual work.
     */
    modifier nonReentrant() {
        _nonReentrantBefore();
        _;
        _nonReentrantAfter();
    }

    function _nonReentrantBefore() private {
        ReentrancyGuardStorage storage $ = _getReentrancyGuardStorage();
        // On the first call to nonReentrant, _status will be NOT_ENTERED
        if ($._status == ENTERED) {
            revert ReentrancyGuardReentrantCall();
        }

        // Any calls to nonReentrant after this point will fail
        $._status = ENTERED;
    }

    function _nonReentrantAfter() private {
        ReentrancyGuardStorage storage $ = _getReentrancyGuardStorage();
        // By storing the original value once again, a refund is triggered (see
        // https://eips.ethereum.org/EIPS/eip-2200)
        $._status = NOT_ENTERED;
    }

    /**
     * @dev Returns true if the reentrancy guard is currently set to "entered", which indicates there is a
     * `nonReentrant` function in the call stack.
     */
    function _reentrancyGuardEntered() internal view returns (bool) {
        ReentrancyGuardStorage storage $ = _getReentrancyGuardStorage();
        return $._status == ENTERED;
    }
}

// lib/openzeppelin-contracts-upgradeable/contracts/utils/introspection/ERC165Upgradeable.sol

// OpenZeppelin Contracts (last updated v5.0.0) (utils/introspection/ERC165.sol)

pragma solidity ^0.8.20;


/**
 * @dev Implementation of the {IERC165} interface.
 *
 * Contracts that want to implement ERC165 should inherit from this contract and override {supportsInterface} to check
 * for the additional interface id that will be supported. For example:
 *
 * ```solidity
 * function supportsInterface(bytes4 interfaceId) public view virtual override returns (bool) {
 *     return interfaceId == type(MyInterface).interfaceId || super.supportsInterface(interfaceId);
 * }
 * ```
 */
abstract contract ERC165Upgradeable is Initializable, IERC165 {
    function __ERC165_init() internal onlyInitializing {
    }

    function __ERC165_init_unchained() internal onlyInitializing {
    }
    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId) public view virtual returns (bool) {
        return interfaceId == type(IERC165).interfaceId;
    }
}

// lib/openzeppelin-contracts/contracts/token/ERC721/extensions/IERC721Metadata.sol

// OpenZeppelin Contracts (last updated v5.0.0) (token/ERC721/extensions/IERC721Metadata.sol)

pragma solidity ^0.8.20;


/**
 * @title ERC-721 Non-Fungible Token Standard, optional metadata extension
 * @dev See https://eips.ethereum.org/EIPS/eip-721
 */
interface IERC721Metadata is IERC721 {
    /**
     * @dev Returns the token collection name.
     */
    function name() external view returns (string memory);

    /**
     * @dev Returns the token collection symbol.
     */
    function symbol() external view returns (string memory);

    /**
     * @dev Returns the Uniform Resource Identifier (URI) for `tokenId` token.
     */
    function tokenURI(uint256 tokenId) external view returns (string memory);
}

// src/flap/IVaultFactory.sol

// Version marker passed to `resolveDividendToken(...)` when launch params are encoded as
// `IVaultPortalTypes.NewTokenV6WithVaultParams`.
uint8 constant DIVIDEND_TOKEN_LAUNCH_VERSION_V6 = 6;

// Version marker passed to `resolveDividendToken(...)` when launch params are encoded as
// `IVaultPortalTypes.NewTokenV7WithVaultParams`.
uint8 constant DIVIDEND_TOKEN_LAUNCH_VERSION_V7 = 7;

/// @title IVaultFactory
/// @notice Interface that all vault factory contracts must implement
/// @dev Each vault type must have a corresponding factory contract that implements this interface
interface IVaultFactory {
    /* ========== ERRORS ========== */

    /// @notice Thrown when caller is not the vault portal
    error OnlyVaultPortal();

    /// @notice Thrown when zero address is provided
    error ZeroAddress();

    /* ========== FUNCTIONS ========== */
    /// @notice Creates a new vault instance for a tax token
    /// @dev IMPORTANT: The taxToken does not exist yet when this method is called.
    ///      The VaultPortal predicts the token address and passes it here.
    ///      The actual token will be created AFTER the vault is created.
    /// @param taxToken The predicted address of the tax token (not yet deployed)
    /// @param quoteToken The quote token address (e.g., address(0) for native BNB)
    /// @param creator The original msg.sender to VaultPortal who initiated token creation
    /// @param vaultData Custom encoded data specific to this vault type
    /// @return vault The address of the newly created vault
    function newVault(address taxToken, address quoteToken, address creator, bytes calldata vaultData)
        external
        returns (address vault);

    /// @notice Checks if a quote token is supported by this vault factory
    /// @param quoteToken The quote token address to check
    /// @return supported True if the quote token is supported, false otherwise
    function isQuoteTokenSupported(address quoteToken) external view returns (bool supported);
}

/// @title IVaultFactoryDividendV23
/// @notice Optional factory-spec v2.3 extension for computed dividend-token resolution.
/// @dev    Only factories that explicitly opt into v2.3 need to implement this interface.
interface IVaultFactoryDividendV23 {
    /// @notice Resolve the dividend token for a predicted (not yet deployed) tax token.
    /// @dev    VaultPortal calls this only when the launcher supplied MAGIC_DIVIDEND_COMPUTED.
    /// @param predictedToken The CREATE2-predicted tax-token address.
    /// @param launchVersion The wrapper parameter version. Current callers use
    ///        `DIVIDEND_TOKEN_LAUNCH_VERSION_V6` for `NewTokenV6WithVaultParams`
    ///        and `DIVIDEND_TOKEN_LAUNCH_VERSION_V7` for `NewTokenV7WithVaultParams`.
    /// @param launchParams ABI-encoded wrapper launch params. Current callers pass
    ///        `abi.encode(NewTokenV6WithVaultParams)` or `abi.encode(NewTokenV7WithVaultParams)`.
    /// @return dividendToken The actual dividend token to forward into Portal.
    function resolveDividendToken(address predictedToken, uint8 launchVersion, bytes calldata launchParams)
        external
        view
        returns (address dividendToken);
}

/// @title IVaultFactoryValidationV2
/// @notice Optional validation extension introduced by factory spec v2.2.
/// @dev    Kept in the same file as `IVaultFactory` for discoverability, but intentionally
///         separated as its own interface because `onBeforeLaunch(...)` is not a mandatory
///         requirement for legacy vault factories.
interface IVaultFactoryValidationV2 {
    /// @notice Stable validation payload used by VaultPortal when talking to v2.2+ factories.
    /// @dev    This payload intentionally contains normalized launch semantics instead of
    ///         wrapper-specific structs such as `NewTokenV6WithVaultParams` or `NewTokenV7WithVaultParams`.
    struct LaunchValidationDataV1 {
        IPortalTypes.TokenVersion tokenVersion;
        address quoteToken;
        uint16 buyTaxRate;
        uint16 sellTaxRate;
        uint16 vaultBps;
        uint16 deflationBps;
        uint16 dividendBps;
        uint16 lpBps;
        address dividendToken;
        uint256 minimumShareBalance;
    }

    /// @notice Generic pre-launch validation hook.
    /// @param validationData ABI-encoded normalized launch payload.
    /// @return success True when the launch satisfies this factory's product constraints.
    /// @return reason Human-readable explanation when `success` is false.
    function onBeforeLaunch(bytes calldata validationData) external view returns (bool success, string memory reason);
}

// src/flap/IVaultPortal.sol

/// @title IVaultPortalTypes
/// @notice Type definitions for the VaultPortal contract
/// @dev Contains all structs and custom types used by VaultPortal
interface IVaultPortalTypes {
    /// @notice Risk level classification for vault audits (8 bits)
    /// @dev Used to represent the security assessment of a vault or factory
    enum RiskLevel {
        UNVERIFIED, // 0 - Not yet verified/audited
        LOW_RISK, // 1 - Low risk
        LOW_MEDIUM_RISK, // 2 - Low to medium risk
        MEDIUM_RISK, // 3 - Medium risk
        HIGH_RISK // 4 - High risk
    }

    /// @notice Category classification for vaults (8 bits)
    /// @dev Used to categorize vaults by their type or functionality
    enum VaultCategory {
        NONE, // 0 - Not in any category (default)
        TYPE_AI_ORACLE_POWERED // 1 - AI Oracle powered vaults
    }

    /// @notice Permission policy for a vault factory (8 bits)
    /// @dev Controls who is allowed to use this factory to launch tokens
    enum FactoryPermissionPolicy {
        OPEN, // 0 - Anyone can use this factory to launch tokens (default)
        TIME_DEPENDENT, // 1 - Only the designated developer may launch during an exclusive window; open to all afterwards
        DISABLED // 2 - No one can use this factory to launch tokens
    }

    /// @notice Information about a registered vault factory
    /// @dev Packed into a single storage slot for gas efficiency
    /// @param enabled Whether this factory can be used to create new vaults
    /// @param official Whether vaults created by this factory are marked as official/endorsed
    /// @param riskLevel The risk level classification from audit
    /// @param category The category classification for vaults from this factory (1 byte)
    /// @param permissionPolicy The permission policy controlling who may launch tokens via this factory (1 byte)
    /// @param reserved Reserved space for future upgrades (27 bytes)
    struct VaultFactoryInfo {
        bool enabled;
        bool official;
        RiskLevel riskLevel;
        VaultCategory category;
        FactoryPermissionPolicy permissionPolicy;
        bytes27 reserved;
    }

    /// @notice Packed vault information stored in contract storage
    /// @dev Uses three storage slots (64 bytes total)
    /// @param vault The address of the vault contract (20 bytes)
    /// @param vaultFactory The address of the vault factory that created this vault (20 bytes)
    /// @param adapter The address of the adapter contract for legacy vaults (20 bytes)
    /// @param isOfficial Whether this vault is marked as official/endorsed (1 byte)
    /// @param riskLevel The risk level classification from audit (1 byte)
    /// @param category The category classification for this vault (1 byte)
    struct VaultedTaxTokenInfo {
        // slot 0
        address vault;
        bool isOfficial;
        RiskLevel riskLevel;
        VaultCategory category;
        bytes9 reserved0;
        // slot 1
        address vaultFactory;
        bytes12 reserved1;
        // slot 2
        address adapter;
        bytes12 reserved2;
    }

    /// @notice Audit report for a tax token
    /// @param auditor The address of the auditor who submitted this report
    /// @param riskLevel The risk level classification from this audit
    /// @param ipfsCid The IPFS CID of the audit report document
    struct AuditReport {
        address auditor;
        RiskLevel riskLevel;
        string ipfsCid;
    }

    /// @notice Complete vault information returned to external callers
    /// @dev This struct is used for view functions and includes human-readable description
    /// @param vault The address of the vault contract
    /// @param vaultFactory The address of the vault factory that created this vault (zero address if unknown)
    /// @param description Human-readable description of the vault's purpose and functionality
    /// @param isOfficial Whether this vault is marked as official/endorsed by the protocol
    /// @param riskLevel The risk level classification from audit
    struct VaultInfo {
        address vault;
        address vaultFactory;
        string description;
        bool isOfficial;
        RiskLevel riskLevel;
    }

    /// @notice Parameters required to create a new tax token with an associated vault
    /// @dev All parameters are passed as a single struct to avoid stack-too-deep errors
    /// @param name The name of the tax token (e.g., "MyToken")
    /// @param symbol The symbol of the tax token (e.g., "MTK")
    /// @param meta Metadata URI or string for additional token information
    /// @param dexThresh The DEX supply threshold type
    /// @param salt A unique salt for deterministic address generation (must produce vanity suffix)
    /// @param taxRate The tax rate in basis points (e.g., 100 = 1%, max 1000 = 10%)
    /// @param migratorType The migrator type (see MigratorType enum)
    /// @param quoteToken The token used for initial liquidity (address(0) for native token)
    /// @param quoteAmt The amount of quote token to provide as initial liquidity
    /// @param permitData The optional permit data for the quote token
    /// @param extensionID The ID of the extension to be used for the new token if not zero
    /// @param extensionData Additional extension specific data
    /// @param dexId The preferred DEX ID for the token
    /// @param lpFeeProfile The preferred V3 LP fee profile for the token
    /// @param taxDuration Tax duration in seconds (max: 100 years)
    /// @param antiFarmerDuration Anti-farmer duration in seconds (max: 1 year)
    /// @param mktBps Market allocation basis points (to beneficiary)
    /// @param deflationBps Deflation basis points (burned)
    /// @param dividendBps Dividend basis points (to dividend contract)
    /// @param lpBps Liquidity provision basis points (LP to dead address)
    /// @param minimumShareBalance Minimum balance for dividend eligibility
    /// @param vaultFactory The address of the vault factory to use for creating the vault (any factory is allowed; unregistered/disabled factories result in unverified vaults)
    /// @param vaultData Encoded data specific to the vault type being created
    struct NewTaxTokenWithVaultParams {
        string name;
        string symbol;
        string meta;
        IPortalCommonTypes.DexThreshType dexThresh;
        bytes32 salt;
        uint16 taxRate;
        IPortalTypes.MigratorType migratorType;
        address quoteToken;
        uint256 quoteAmt;
        bytes permitData;
        bytes32 extensionID;
        bytes extensionData;
        IPortalTypes.DEXId dexId;
        IPortalTypes.V3LPFeeProfile lpFeeProfile;
        uint64 taxDuration;
        uint64 antiFarmerDuration;
        uint16 mktBps;
        uint16 deflationBps;
        uint16 dividendBps;
        uint16 lpBps;
        uint256 minimumShareBalance;
        address vaultFactory;
        bytes vaultData;
    }

    /// @notice Parameters required to create a new V3 tax token with an associated vault
    /// @dev tokenVersion must be TOKEN_TAXED_V3; if it is not, the implementation reverts with FeatureDisabled
    struct NewTokenV6WithVaultParams {
        string name;
        string symbol;
        string meta;
        IPortalCommonTypes.DexThreshType dexThresh;
        bytes32 salt;
        IPortalTypes.MigratorType migratorType;
        address quoteToken;
        uint256 quoteAmt;
        bytes permitData;
        bytes32 extensionID;
        bytes extensionData;
        IPortalTypes.DEXId dexId;
        IPortalTypes.V3LPFeeProfile lpFeeProfile;
        // V3 tax fields
        uint16 buyTaxRate;
        uint16 sellTaxRate;
        uint64 taxDuration;
        uint64 antiFarmerDuration;
        uint16 mktBps;
        uint16 deflationBps;
        uint16 dividendBps;
        uint16 lpBps;
        uint256 minimumShareBalance;
        address dividendToken;
        address commissionReceiver;
        /// The token version to use (must be TOKEN_TAXED_V3, otherwise reverts with FeatureDisabled)
        IPortalTypes.TokenVersion tokenVersion;
        // vault fields
        address vaultFactory;
        bytes vaultData;
    }

    /* ========== EVENTS ========== */

    /// @notice Emitted when a new tax token with an associated vault is successfully created
    /// @param token The address of the newly deployed tax token
    /// @param vault The address of the newly created vault that will receive tax revenue
    /// @param vaultFactory The vault factory address that was used to create the vault
    event FlapTaxVaultTokenCreated(address indexed token, address indexed vault, address indexed vaultFactory);

    /// @notice Emitted when a vault factory is registered or its configuration is updated
    /// @param factory The address of the vault factory being registered/updated
    /// @param enabled Whether the factory is enabled for creating new vaults
    /// @param official Whether vaults from this factory should be marked as official
    /// @param riskLevel The risk level classification for vaults from this factory
    event FlapTaxVaultFactoryRegistered(address factory, bool enabled, bool official, RiskLevel riskLevel);

    /// @notice Emitted when a vault factory's category is set during registration or update
    /// @param factory The address of the vault factory
    /// @param category The category classification for vaults from this factory
    event FlapTaxVaultFactoryCategorySet(address factory, VaultCategory category);

    /// @notice Emitted when a vault factory's permission policy is updated
    /// @param factory The address of the vault factory
    /// @param policy The new permission policy
    event FactoryPermissionPolicySet(address indexed factory, FactoryPermissionPolicy policy);

    /// @notice Emitted when an adapter is registered for a legacy tax token
    /// @param taxToken The address of the tax token
    /// @param adapter The address of the adapter contract
    event AdapterRegistered(address indexed taxToken, address indexed adapter);

    /// @notice Emitted when a new audit report is submitted
    /// @param taxToken The address of the tax token being audited
    /// @param auditor The address of the auditor
    /// @param riskLevel The risk level classification from this audit
    /// @param ipfsCid The IPFS CID of the audit report
    event AuditReportSubmitted(address indexed taxToken, address indexed auditor, RiskLevel riskLevel, string ipfsCid);

    /// @notice Emitted when a new audit report is submitted for a vault factory
    /// @param factory The address of the vault factory being audited
    /// @param auditor The address of the auditor
    /// @param riskLevel The risk level classification from this audit
    /// @param ipfsCid The IPFS CID of the audit report
    event FactoryAuditReportSubmitted(
        address indexed factory, address indexed auditor, RiskLevel riskLevel, string ipfsCid
    );

    /// @notice Emitted when a vault's category is updated
    /// @param taxToken The address of the tax token
    /// @param category The new category
    event VaultCategoryUpdated(address indexed taxToken, VaultCategory category);

    /// @notice Emitted when a factory's category is updated
    /// @param factory The address of the vault factory
    /// @param category The new category
    event FactoryCategoryUpdated(address indexed factory, VaultCategory category);

    /// @notice Emitted when a token's stored vault address is refreshed to match the on-chain market wallet.
    /// @param token The address of the tax token
    /// @param oldVault The previously stored vault address
    /// @param newVault The updated vault address (current on-chain market wallet)
    event TokenVaultRefreshed(address indexed token, address indexed oldVault, address indexed newVault);

    /* ========== ERRORS ========== */

    /// @notice Thrown when the provided tax rate is invalid (0 or > 1000 basis points)
    /// @param taxRate The invalid tax rate that was provided
    error InvalidTaxRate(uint256 taxRate);

    /// @notice Thrown when mktBps is invalid (must be > 0)
    error InvalidMktBps();

    /// @notice Thrown when an unsupported quote token is specified
    /// @param quoteToken The address of the unsupported quote token
    error UnsupportedQuoteToken(address quoteToken);

    /// @notice Thrown when attempting to use a vault factory that is not registered
    /// @param factory The address of the unregistered vault factory
    error VaultFactoryNotRegistered(address factory);

    /// @notice Thrown when the predicted token address does not match the required vanity suffix
    /// @param predictedAddress The predicted address that failed the vanity check
    error InvalidVanity(address predictedAddress);

    /// @notice Thrown when trying to get vault info for a token that has no associated vault
    /// @param taxToken The address of the tax token with no vault
    error VaultNotFound(address taxToken);

    /// @notice Thrown when token address does not match predicted address
    error TokenAddressMismatch();

    /// @notice Thrown when BNB transfer fails
    error BnbTransferFailed();

    /// @notice Thrown when a non-V3 tax token version is specified (only TOKEN_TAXED_V3 is allowed)
    error OnlyV3TaxTokenAllowed();

    /// @notice Thrown when a requested feature is not yet enabled
    error FeatureDisabled();

    /// @notice Thrown when portal address is zero
    error ZeroPortalAddress();

    /// @notice Thrown when token implementation address is zero
    error ZeroTokenImplAddress();

    /// @notice Thrown when trying to perform an operation on a non-existent token
    /// @param taxToken The address of the non-existent tax token
    error TokenNotFound(address taxToken);

    /// @notice error when user is rate limited from creating tokens
    /// @param user The address that is rate limited
    /// @param lastCreationTime The timestamp of the user's last successful token creation
    error RateLimitExceeded(address user, uint256 lastCreationTime);
}

/// @title IVaultPortal
/// @notice Interface for the VaultPortal contract that manages vault creation for tax tokens
/// @dev VaultPortal acts as a registry and factory orchestrator for different vault types
/// @dev It coordinates the creation of tax tokens with their associated revenue vaults
interface IVaultPortal is IVaultPortalTypes {
    /* ========== FUNCTIONS ========== */

    /// @notice Get information about a registered vault factory
    /// @param factory The address of the vault factory
    /// @return enabled Whether this factory can be used to create new vaults
    /// @return official Whether vaults created by this factory are marked as official/endorsed
    /// @return riskLevel The risk level classification for vaults from this factory
    /// @return reserved Reserved space for future upgrades (29 bytes)
    function vaultFactories(address factory)
        external
        view
        returns (bool enabled, bool official, RiskLevel riskLevel, bytes29 reserved);
    /* ========== FUNCTIONS ========== */

    /// @notice Create a new tax token with an associated vault in a single transaction
    /// @dev This function orchestrates the creation of both the vault and the tax token
    /// @dev The vault is created first using the predicted token address, then the token is created
    /// @dev Requires msg.value to match or exceed the quoteAmt for initial liquidity
    /// @dev Any vault factory can be used. If the factory is not registered or is disabled,
    ///      the vault will be treated as unofficial with UNVERIFIED risk level
    /// @param params The parameters for creating the tax token and vault
    /// @return token The address of the newly created tax token
    function newTaxTokenWithVault(NewTaxTokenWithVaultParams calldata params) external payable returns (address token);

    /// @notice Create a new tax token via Portal's newTokenV6 with an associated vault in a single transaction
    /// @dev Only TOKEN_TAXED_V3 is currently supported as tokenVersion; any other version reverts with FeatureDisabled.
    /// @param params The parameters for creating the tax token and vault (mirrors NewTokenV6Params, minus beneficiary)
    /// @return token The address of the newly created tax token
    function newTokenV6WithVault(NewTokenV6WithVaultParams calldata params) external payable returns (address token);

    /// @notice Predict the address of a tax token V1 given a salt
    /// @dev Uses CREATE2 deterministic address prediction
    /// @dev Useful for generating valid salts that produce the required vanity suffix
    /// @param salt The salt for deterministic deployment
    /// @return predictedAddress The predicted address of the tax token
    function predictTaxTokenV1Address(bytes32 salt) external view returns (address predictedAddress);

    /// @notice Get the complete vault information for a tax token
    /// @dev Reverts if no vault is found for the given tax token
    /// @dev Attempts to fetch the vault's description by calling its description() function
    /// @param taxToken The address of the tax token
    /// @return info The VaultInfo struct containing complete vault details
    function getVault(address taxToken) external view returns (VaultInfo memory info);

    /// @notice Attempt to get vault information for a tax token without reverting
    /// @dev First checks the internal mapping, then falls back to searching the Portal
    /// @dev For fallback results, isOfficial and isVerified will always be false
    /// @param taxToken The address of the tax token
    /// @return found Whether a vault was found for this tax token
    /// @return info The VaultInfo struct (empty if not found)
    function tryGetVault(address taxToken) external view returns (bool found, VaultInfo memory info);

    /// @notice Register a new vault factory or update an existing one (backward-compatible overload)
    /// @dev Only accounts with VAULT_ADMIN_ROLE can call this function
    /// @dev Allows enabling/disabling factories and updating their official/riskLevel status
    /// @dev Category defaults to VaultCategory.NONE
    /// @param factory The address of the vault factory to register/update
    /// @param enabled Whether the factory should be enabled for creating new vaults
    /// @param official Whether vaults from this factory should be marked as official
    /// @param riskLevel The risk level classification for vaults from this factory
    function registerVaultFactory(address factory, bool enabled, bool official, RiskLevel riskLevel) external;

    /// @notice Register a new vault factory or update an existing one with a specific category
    /// @dev Only accounts with VAULT_ADMIN_ROLE can call this function
    /// @dev Allows enabling/disabling factories and updating their official/riskLevel/category status
    /// @param factory The address of the vault factory to register/update
    /// @param enabled Whether the factory should be enabled for creating new vaults
    /// @param official Whether vaults from this factory should be marked as official
    /// @param riskLevel The risk level classification for vaults from this factory
    /// @param category The category classification for vaults from this factory
    function registerVaultFactory(
        address factory,
        bool enabled,
        bool official,
        RiskLevel riskLevel,
        VaultCategory category
    ) external;

    /// @notice Register an adapter for a legacy tax token vault
    /// @dev Only accounts with AUDITOR_ROLE can call this function
    /// @dev The adapter must implement the VaultBase interface for compatibility
    /// @param taxToken The address of the tax token
    /// @param adapter The address of the adapter contract
    function registerAdapter(address taxToken, address adapter) external;

    /// @notice Submit a new audit report for a tax token
    /// @dev Only accounts with AUDITOR_ROLE can call this function
    /// @dev The tax token must exist (have a vault or adapter registered)
    /// @dev This may change the risk level of the token
    /// @param taxToken The address of the tax token being audited
    /// @param riskLevel The risk level classification from this audit
    /// @param ipfsCid The IPFS CID of the audit report document
    function submitAuditReport(address taxToken, RiskLevel riskLevel, string calldata ipfsCid) external;

    /// @notice Submit a new audit report for a vault factory
    /// @dev Only accounts with VAULT_ADMIN_ROLE can call this function
    /// @dev The factory should be registered or have existing audit reports
    /// @param factory The address of the vault factory being audited
    /// @param riskLevel The risk level classification from this audit
    /// @param ipfsCid The IPFS CID of the audit report document
    function submitFactoryAuditReport(address factory, RiskLevel riskLevel, string calldata ipfsCid) external;

    /// @notice Get recent audit reports for a tax token with pagination
    /// @dev Returns reports starting from the most recent (end of array)
    /// @dev If the token has no audit reports, falls back to its factory's audit reports
    /// @param taxToken The address of the tax token
    /// @param offset The number of reports to skip from the end (0 = most recent)
    /// @param limit The maximum number of reports to return
    /// @return reports The array of audit reports
    /// @return total The total number of audit reports for this token
    function getAuditReports(address taxToken, uint256 offset, uint256 limit)
        external
        view
        returns (AuditReport[] memory reports, uint256 total);

    /// @notice Get the category of a vault
    /// @param taxToken The tax token address
    /// @return category The category of the vault
    function getVaultCategory(address taxToken) external view returns (VaultCategory category);

    /// @notice Get the category of a vault factory
    /// @param factory The vault factory address
    /// @return category The category of the factory
    function getFactoryCategory(address factory) external view returns (VaultCategory category);

    /// @notice Get the permission policy for a vault factory
    /// @param factory The vault factory address
    /// @return policy  The active FactoryPermissionPolicy enum value
    /// @return policyData  Raw 32-byte slot holding policy-specific data.
    ///         For TIME_DEPENDENT: top 64 bits = expirationTime (unix timestamp),
    ///         next 160 bits = developer address, remaining 32 bits = zero.
    /// @return description  Human-readable explanation of the current policy
    function getFactoryPolicy(address factory)
        external
        view
        returns (FactoryPermissionPolicy policy, bytes32 policyData, string memory description);

    /// @notice Set the category of a vault
    /// @dev Only accounts with VAULT_ADMIN_ROLE can call this function
    /// @param taxToken The tax token address
    /// @param category The new category
    function setVaultCategory(address taxToken, VaultCategory category) external;

    /// @notice Set the category of a vault factory
    /// @dev Only accounts with VAULT_ADMIN_ROLE can call this function
    /// @param factory The vault factory address
    /// @param category The new category
    function setFactoryCategory(address factory, VaultCategory category) external;

    /// @notice Syncs the stored vault address for `token` with the current on-chain market wallet.
    /// @dev Only callable by AUDITOR_ROLE.
    ///      If the token has no entry in taxVaults, the call is silently ignored.
    ///      If the on-chain market wallet differs from the stored vault, the stored vault is updated
    ///      and a TokenVaultRefreshed event is emitted.
    /// @param token The tax token address to refresh.
    function refreshTokenVault(address token) external;

    /// @notice Reset a factory's permission policy back to OPEN (unrestricted access).
    /// @dev Only callable by AUDITOR_ROLE.  Clears any stored policy data (expiration / developer).
    /// @param factory The vault factory address.
    function resetFactoryPolicy(address factory) external;
}

// lib/openzeppelin-contracts/contracts/utils/Strings.sol

// OpenZeppelin Contracts (last updated v5.0.0) (utils/Strings.sol)

/**
 * @dev String operations.
 */
library Strings {
    bytes16 private constant HEX_DIGITS = "0123456789abcdef";
    uint8 private constant ADDRESS_LENGTH = 20;

    /**
     * @dev The `value` string doesn't fit in the specified `length`.
     */
    error StringsInsufficientHexLength(uint256 value, uint256 length);

    /**
     * @dev Converts a `uint256` to its ASCII `string` decimal representation.
     */
    function toString(uint256 value) internal pure returns (string memory) {
        unchecked {
            uint256 length = Math.log10(value) + 1;
            string memory buffer = new string(length);
            uint256 ptr;
            assembly ("memory-safe") {
                ptr := add(buffer, add(32, length))
            }
            while (true) {
                ptr--;
                assembly ("memory-safe") {
                    mstore8(ptr, byte(mod(value, 10), HEX_DIGITS))
                }
                value /= 10;
                if (value == 0) break;
            }
            return buffer;
        }
    }

    /**
     * @dev Converts a `int256` to its ASCII `string` decimal representation.
     */
    function toStringSigned(int256 value) internal pure returns (string memory) {
        return string.concat(value < 0 ? "-" : "", toString(SignedMath.abs(value)));
    }

    /**
     * @dev Converts a `uint256` to its ASCII `string` hexadecimal representation.
     */
    function toHexString(uint256 value) internal pure returns (string memory) {
        unchecked {
            return toHexString(value, Math.log256(value) + 1);
        }
    }

    /**
     * @dev Converts a `uint256` to its ASCII `string` hexadecimal representation with fixed length.
     */
    function toHexString(uint256 value, uint256 length) internal pure returns (string memory) {
        uint256 localValue = value;
        bytes memory buffer = new bytes(2 * length + 2);
        buffer[0] = "0";
        buffer[1] = "x";
        for (uint256 i = 2 * length + 1; i > 1; --i) {
            buffer[i] = HEX_DIGITS[localValue & 0xf];
            localValue >>= 4;
        }
        if (localValue != 0) {
            revert StringsInsufficientHexLength(value, length);
        }
        return string(buffer);
    }

    /**
     * @dev Converts an `address` with fixed length of 20 bytes to its not checksummed ASCII `string` hexadecimal
     * representation.
     */
    function toHexString(address addr) internal pure returns (string memory) {
        return toHexString(uint256(uint160(addr)), ADDRESS_LENGTH);
    }

    /**
     * @dev Returns true if the two strings are equal.
     */
    function equal(string memory a, string memory b) internal pure returns (bool) {
        return bytes(a).length == bytes(b).length && keccak256(bytes(a)) == keccak256(bytes(b));
    }
}

// src/flap/VaultBaseV2.sol

/// @title VaultBaseV2
/// @author The Flap Team
/// @notice Extended abstract base contract for vault implementations that adds
///         on-chain UI schema discovery via `vaultUISchema()`.
///
/// @dev  ── MOTIVATION ───────────────────────────────────────────────────────
///
/// The protocol is designed so that anyone can introduce new vault types.
/// Each vault implementation exposes a different set of user-facing view
/// and write methods — a generic UI rendering a vault page has no way to
/// know which methods to display, what each parameter means, or how to
/// format the results without inspecting each vault's source code.
///
/// Existing vault types (FlapXVault, SplitVault, SnowBallVault,
/// BlackHoleVault) already have purpose-built UIs.  `VaultBaseV2` exists
/// to support **future** vault implementations: by requiring every new
/// vault to override `vaultUISchema()`, the UI can automatically generate
/// a full interaction page for any vault type — even ones that did not
/// exist when the UI was built.
///
/// `vaultUISchema()` returns a `VaultUISchema` struct (defined in
/// `IVaultSchemasV1.sol`) that fully describes the methods the UI should
/// render.
///
///
/// ── BACKWARDS COMPATIBILITY ────────────────────────────────────────────────
///
/// `VaultBaseV2` inherits from the original `VaultBase` contract and adds only
/// the new `vaultUISchema()` abstract method.  Existing vaults that extend
/// `VaultBase` are unaffected.  New or upgraded vault implementations should
/// extend `VaultBaseV2` instead of `VaultBase` to gain UI schema support.
///
///
/// ── HOW TO IMPLEMENT ───────────────────────────────────────────────────────
///
/// 1. **Inherit from VaultBaseV2** instead of VaultBase.
///    All obligations from VaultBase still apply (implement `description()`,
///    use `_getPortal()`, `_getGuardian()`, handle `receive()`, etc.).
///
/// 2. **Override `vaultUISchema()`** to return a `VaultUISchema` describing
///    every user-facing method your vault exposes.
///
///    For each method include:
///      - `name`          – the Solidity function name (e.g. "claim")
///      - `description`   – human-readable explanation
///      - `inputs`        – ordered FieldDescriptor[] for parameters
///      - `outputs`       – ordered FieldDescriptor[] for return values
///      - `approvals`     – ApproveAction[] for any ERC-20 approvals required
///                          before calling a write method
///      - `isInputArray`  – true if input is tuple[]
///      - `isOutputArray` – true if output is tuple[]
///      - `isWriteMethod` – true for state-changing, false for view
///
/// 3. **MANDATE: Guardian access to privileged functions**
///    If your vault exposes any privileged / role-gated functions (e.g.
///    functions that should only be called by an operator or admin), the
///    Guardian address returned by `_getGuardian()` **must** also be
///    granted the required role(s).  Furthermore, the Guardian's role
///    **must not** be revocable by any other account — only the Guardian
///    itself may renounce its own access.
///
///    When using OpenZeppelin's `AccessControl`, override `revokeRole()` to
///    enforce this invariant:
///
///      ```
///      function revokeRole(bytes32 role, address account)
///          public
///          override
///          onlyRole(getRoleAdmin(role))
///      {
///          address guardian = _getGuardian();
///          if (account == guardian) {
///              revert CannotRevokeGuardianRole();
///          }
///          super.revokeRole(role, account);
///      }
///      ```
///
///    This ensures that the Guardian always retains a backup path to call
///    permissioned functions, regardless of any admin action.
///
///    (This mandate is inherited from VaultBase — see its documentation
///    for the canonical requirement.)
///
///
/// ── EXAMPLE: Hypothetical DonationVault (view + write, no approvals) ───
///
///   function vaultUISchema() public pure override returns (VaultUISchema memory schema) {
///       schema.vaultType = "DonationVault";
///       schema.description = "Collects BNB donations and lets a designated charity withdraw.";
///       schema.methods = new VaultMethodSchema[](2);
///
///       // View: totalDonated()
///       schema.methods[0].name = "totalDonated";
///       schema.methods[0].description = "Returns the total BNB donated so far.";
///       schema.methods[0].outputs = new FieldDescriptor[](1);
///       schema.methods[0].outputs[0] = FieldDescriptor("total", "uint256", "Total BNB donated", 18);
///
///       // Write: withdraw()
///       schema.methods[1].name = "withdraw";
///       schema.methods[1].description = "Withdraws accumulated donations to the charity address. Only the charity can call.";
///       schema.methods[1].approvals = new ApproveAction[](0);
///       schema.methods[1].isWriteMethod = true;
///   }
///
///
/// ── EXAMPLE: Hypothetical StakingVault (illustrating approve actions) ──────
///
///   function vaultUISchema() public pure override returns (VaultUISchema memory schema) {
///       schema.vaultType = "StakingVault";
///       schema.description = "Stakes tax tokens or LP tokens to earn rewards.";
///       schema.methods = new VaultMethodSchema[](3);
///
///       // View: stakedBalance(address)
///       schema.methods[0].name = "stakedBalance";
///       schema.methods[0].description = "Returns the staked balance for a given user.";
///       schema.methods[0].inputs = new FieldDescriptor[](1);
///       schema.methods[0].inputs[0] = FieldDescriptor("user", "address", "The user address to query", 0);
///       schema.methods[0].outputs = new FieldDescriptor[](1);
///       schema.methods[0].outputs[0] = FieldDescriptor("balance", "uint256", "Staked token balance", 18);
///
///       // Write: deposit(uint256) — requires ERC-20 approval of the tax token
///       schema.methods[1].name = "deposit";
///       schema.methods[1].description = "Stake tax tokens into the vault to earn rewards.";
///       schema.methods[1].inputs = new FieldDescriptor[](1);
///       schema.methods[1].inputs[0] = FieldDescriptor("amount", "uint256", "Amount of tax tokens to stake", 18);
///       schema.methods[1].approvals = new ApproveAction[](1);
///       // The UI will:
///       //   (1) call vault.taxToken() to get the token address
///       //   (2) call token.approve(vault, amount) where amount comes from the "amount" input field
///       schema.methods[1].approvals[0] = ApproveAction("taxToken", "amount");
///       schema.methods[1].isWriteMethod = true;
///
///       // Write: depositLP(uint256) — requires ERC-20 approval of the LP token
///       schema.methods[2].name = "depositLP";
///       schema.methods[2].description = "Stake LP tokens into the vault to earn boosted rewards.";
///       schema.methods[2].inputs = new FieldDescriptor[](1);
///       schema.methods[2].inputs[0] = FieldDescriptor("amount", "uint256", "Amount of LP tokens to stake", 18);
///       schema.methods[2].approvals = new ApproveAction[](1);
///       schema.methods[2].approvals[0] = ApproveAction("lpToken", "amount");
///       schema.methods[2].isWriteMethod = true;
///   }
///
///
/// ── EXAMPLE: Vault with no user-facing methods ─────────────────────────────
///
///   function vaultUISchema() public pure override returns (VaultUISchema memory schema) {
///       schema.vaultType = "SinkVault";
///       schema.description = "A vault that permanently locks all received BNB. No methods available.";
///       schema.methods = new VaultMethodSchema[](0);
///   }
///
abstract contract VaultBaseV2 is VaultBase {
    /// @notice Returns the UI schema describing which methods the UI should
    ///         render for this vault.
    ///
    /// @dev Each vault implementation **must** override this to describe its
    ///      own user-facing methods.
    ///
    ///      The returned `VaultUISchema` struct contains:
    ///        - `vaultType`   – e.g. "FlapXVault", "SplitVault"
    ///        - `description` – overall explanation of the vault
    ///        - `methods`     – ordered array of `VaultMethodSchema`, each
    ///                          describing one view or write method with its
    ///                          inputs, outputs, required approvals, and
    ///                          array flags.
    ///
    ///      The UI renders methods in the order they appear in the array.
    ///      See the VaultMethodSchema and VaultUISchema docs in
    ///      IVaultSchemasV1.sol for the full rendering algorithm.
    ///
    /// @return schema The complete UI schema for this vault.
    function vaultUISchema() public pure virtual returns (VaultUISchema memory schema);
}

// lib/openzeppelin-contracts/contracts/proxy/ERC1967/ERC1967Utils.sol

// OpenZeppelin Contracts (last updated v5.0.0) (proxy/ERC1967/ERC1967Utils.sol)

/**
 * @dev This abstract contract provides getters and event emitting update functions for
 * https://eips.ethereum.org/EIPS/eip-1967[EIP1967] slots.
 */
library ERC1967Utils {
    // We re-declare ERC-1967 events here because they can't be used directly from IERC1967.
    // This will be fixed in Solidity 0.8.21. At that point we should remove these events.
    /**
     * @dev Emitted when the implementation is upgraded.
     */
    event Upgraded(address indexed implementation);

    /**
     * @dev Emitted when the admin account has changed.
     */
    event AdminChanged(address previousAdmin, address newAdmin);

    /**
     * @dev Emitted when the beacon is changed.
     */
    event BeaconUpgraded(address indexed beacon);

    /**
     * @dev Storage slot with the address of the current implementation.
     * This is the keccak-256 hash of "eip1967.proxy.implementation" subtracted by 1.
     */
    // solhint-disable-next-line private-vars-leading-underscore
    bytes32 internal constant IMPLEMENTATION_SLOT = 0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc;

    /**
     * @dev The `implementation` of the proxy is invalid.
     */
    error ERC1967InvalidImplementation(address implementation);

    /**
     * @dev The `admin` of the proxy is invalid.
     */
    error ERC1967InvalidAdmin(address admin);

    /**
     * @dev The `beacon` of the proxy is invalid.
     */
    error ERC1967InvalidBeacon(address beacon);

    /**
     * @dev An upgrade function sees `msg.value > 0` that may be lost.
     */
    error ERC1967NonPayable();

    /**
     * @dev Returns the current implementation address.
     */
    function getImplementation() internal view returns (address) {
        return StorageSlot.getAddressSlot(IMPLEMENTATION_SLOT).value;
    }

    /**
     * @dev Stores a new address in the EIP1967 implementation slot.
     */
    function _setImplementation(address newImplementation) private {
        if (newImplementation.code.length == 0) {
            revert ERC1967InvalidImplementation(newImplementation);
        }
        StorageSlot.getAddressSlot(IMPLEMENTATION_SLOT).value = newImplementation;
    }

    /**
     * @dev Performs implementation upgrade with additional setup call if data is nonempty.
     * This function is payable only if the setup call is performed, otherwise `msg.value` is rejected
     * to avoid stuck value in the contract.
     *
     * Emits an {IERC1967-Upgraded} event.
     */
    function upgradeToAndCall(address newImplementation, bytes memory data) internal {
        _setImplementation(newImplementation);
        emit Upgraded(newImplementation);

        if (data.length > 0) {
            Address.functionDelegateCall(newImplementation, data);
        } else {
            _checkNonPayable();
        }
    }

    /**
     * @dev Storage slot with the admin of the contract.
     * This is the keccak-256 hash of "eip1967.proxy.admin" subtracted by 1.
     */
    // solhint-disable-next-line private-vars-leading-underscore
    bytes32 internal constant ADMIN_SLOT = 0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103;

    /**
     * @dev Returns the current admin.
     *
     * TIP: To get this value clients can read directly from the storage slot shown below (specified by EIP1967) using
     * the https://eth.wiki/json-rpc/API#eth_getstorageat[`eth_getStorageAt`] RPC call.
     * `0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103`
     */
    function getAdmin() internal view returns (address) {
        return StorageSlot.getAddressSlot(ADMIN_SLOT).value;
    }

    /**
     * @dev Stores a new address in the EIP1967 admin slot.
     */
    function _setAdmin(address newAdmin) private {
        if (newAdmin == address(0)) {
            revert ERC1967InvalidAdmin(address(0));
        }
        StorageSlot.getAddressSlot(ADMIN_SLOT).value = newAdmin;
    }

    /**
     * @dev Changes the admin of the proxy.
     *
     * Emits an {IERC1967-AdminChanged} event.
     */
    function changeAdmin(address newAdmin) internal {
        emit AdminChanged(getAdmin(), newAdmin);
        _setAdmin(newAdmin);
    }

    /**
     * @dev The storage slot of the UpgradeableBeacon contract which defines the implementation for this proxy.
     * This is the keccak-256 hash of "eip1967.proxy.beacon" subtracted by 1.
     */
    // solhint-disable-next-line private-vars-leading-underscore
    bytes32 internal constant BEACON_SLOT = 0xa3f0ad74e5423aebfd80d3ef4346578335a9a72aeaee59ff6cb3582b35133d50;

    /**
     * @dev Returns the current beacon.
     */
    function getBeacon() internal view returns (address) {
        return StorageSlot.getAddressSlot(BEACON_SLOT).value;
    }

    /**
     * @dev Stores a new beacon in the EIP1967 beacon slot.
     */
    function _setBeacon(address newBeacon) private {
        if (newBeacon.code.length == 0) {
            revert ERC1967InvalidBeacon(newBeacon);
        }

        StorageSlot.getAddressSlot(BEACON_SLOT).value = newBeacon;

        address beaconImplementation = IBeacon(newBeacon).implementation();
        if (beaconImplementation.code.length == 0) {
            revert ERC1967InvalidImplementation(beaconImplementation);
        }
    }

    /**
     * @dev Change the beacon and trigger a setup call if data is nonempty.
     * This function is payable only if the setup call is performed, otherwise `msg.value` is rejected
     * to avoid stuck value in the contract.
     *
     * Emits an {IERC1967-BeaconUpgraded} event.
     *
     * CAUTION: Invoking this function has no effect on an instance of {BeaconProxy} since v5, since
     * it uses an immutable beacon without looking at the value of the ERC-1967 beacon slot for
     * efficiency.
     */
    function upgradeBeaconToAndCall(address newBeacon, bytes memory data) internal {
        _setBeacon(newBeacon);
        emit BeaconUpgraded(newBeacon);

        if (data.length > 0) {
            Address.functionDelegateCall(IBeacon(newBeacon).implementation(), data);
        } else {
            _checkNonPayable();
        }
    }

    /**
     * @dev Reverts if `msg.value` is not zero. It can be used to avoid `msg.value` stuck in the contract
     * if an upgrade doesn't perform an initialization call.
     */
    function _checkNonPayable() private {
        if (msg.value > 0) {
            revert ERC1967NonPayable();
        }
    }
}

// lib/openzeppelin-contracts/contracts/token/ERC20/utils/SafeERC20.sol

// OpenZeppelin Contracts (last updated v5.0.0) (token/ERC20/utils/SafeERC20.sol)

/**
 * @title SafeERC20
 * @dev Wrappers around ERC20 operations that throw on failure (when the token
 * contract returns false). Tokens that return no value (and instead revert or
 * throw on failure) are also supported, non-reverting calls are assumed to be
 * successful.
 * To use this library you can add a `using SafeERC20 for IERC20;` statement to your contract,
 * which allows you to call the safe operations as `token.safeTransfer(...)`, etc.
 */
library SafeERC20 {
    using Address for address;

    /**
     * @dev An operation with an ERC20 token failed.
     */
    error SafeERC20FailedOperation(address token);

    /**
     * @dev Indicates a failed `decreaseAllowance` request.
     */
    error SafeERC20FailedDecreaseAllowance(address spender, uint256 currentAllowance, uint256 requestedDecrease);

    /**
     * @dev Transfer `value` amount of `token` from the calling contract to `to`. If `token` returns no value,
     * non-reverting calls are assumed to be successful.
     */
    function safeTransfer(IERC20 token, address to, uint256 value) internal {
        _callOptionalReturn(token, abi.encodeCall(token.transfer, (to, value)));
    }

    /**
     * @dev Transfer `value` amount of `token` from `from` to `to`, spending the approval given by `from` to the
     * calling contract. If `token` returns no value, non-reverting calls are assumed to be successful.
     */
    function safeTransferFrom(IERC20 token, address from, address to, uint256 value) internal {
        _callOptionalReturn(token, abi.encodeCall(token.transferFrom, (from, to, value)));
    }

    /**
     * @dev Increase the calling contract's allowance toward `spender` by `value`. If `token` returns no value,
     * non-reverting calls are assumed to be successful.
     */
    function safeIncreaseAllowance(IERC20 token, address spender, uint256 value) internal {
        uint256 oldAllowance = token.allowance(address(this), spender);
        forceApprove(token, spender, oldAllowance + value);
    }

    /**
     * @dev Decrease the calling contract's allowance toward `spender` by `requestedDecrease`. If `token` returns no
     * value, non-reverting calls are assumed to be successful.
     */
    function safeDecreaseAllowance(IERC20 token, address spender, uint256 requestedDecrease) internal {
        unchecked {
            uint256 currentAllowance = token.allowance(address(this), spender);
            if (currentAllowance < requestedDecrease) {
                revert SafeERC20FailedDecreaseAllowance(spender, currentAllowance, requestedDecrease);
            }
            forceApprove(token, spender, currentAllowance - requestedDecrease);
        }
    }

    /**
     * @dev Set the calling contract's allowance toward `spender` to `value`. If `token` returns no value,
     * non-reverting calls are assumed to be successful. Meant to be used with tokens that require the approval
     * to be set to zero before setting it to a non-zero value, such as USDT.
     */
    function forceApprove(IERC20 token, address spender, uint256 value) internal {
        bytes memory approvalCall = abi.encodeCall(token.approve, (spender, value));

        if (!_callOptionalReturnBool(token, approvalCall)) {
            _callOptionalReturn(token, abi.encodeCall(token.approve, (spender, 0)));
            _callOptionalReturn(token, approvalCall);
        }
    }

    /**
     * @dev Imitates a Solidity high-level call (i.e. a regular function call to a contract), relaxing the requirement
     * on the return value: the return value is optional (but if data is returned, it must not be false).
     * @param token The token targeted by the call.
     * @param data The call data (encoded using abi.encode or one of its variants).
     */
    function _callOptionalReturn(IERC20 token, bytes memory data) private {
        // We need to perform a low level call here, to bypass Solidity's return data size checking mechanism, since
        // we're implementing it ourselves. We use {Address-functionCall} to perform this call, which verifies that
        // the target address contains contract code and also asserts for success in the low-level call.

        bytes memory returndata = address(token).functionCall(data);
        if (returndata.length != 0 && !abi.decode(returndata, (bool))) {
            revert SafeERC20FailedOperation(address(token));
        }
    }

    /**
     * @dev Imitates a Solidity high-level call (i.e. a regular function call to a contract), relaxing the requirement
     * on the return value: the return value is optional (but if data is returned, it must not be false).
     * @param token The token targeted by the call.
     * @param data The call data (encoded using abi.encode or one of its variants).
     *
     * This is a variant of {_callOptionalReturn} that silents catches all reverts and returns a bool instead.
     */
    function _callOptionalReturnBool(IERC20 token, bytes memory data) private returns (bool) {
        // We need to perform a low level call here, to bypass Solidity's return data size checking mechanism, since
        // we're implementing it ourselves. We cannot use {Address-functionCall} here since this should return false
        // and not revert is the subcall reverts.

        (bool success, bytes memory returndata) = address(token).call(data);
        return success && (returndata.length == 0 || abi.decode(returndata, (bool))) && address(token).code.length > 0;
    }
}

// lib/openzeppelin-contracts/contracts/proxy/beacon/UpgradeableBeacon.sol

// OpenZeppelin Contracts (last updated v5.0.0) (proxy/beacon/UpgradeableBeacon.sol)

pragma solidity ^0.8.20;


/**
 * @dev This contract is used in conjunction with one or more instances of {BeaconProxy} to determine their
 * implementation contract, which is where they will delegate all function calls.
 *
 * An owner is able to change the implementation the beacon points to, thus upgrading the proxies that use this beacon.
 */
contract UpgradeableBeacon is IBeacon, Ownable {
    address private _implementation;

    /**
     * @dev The `implementation` of the beacon is invalid.
     */
    error BeaconInvalidImplementation(address implementation);

    /**
     * @dev Emitted when the implementation returned by the beacon is changed.
     */
    event Upgraded(address indexed implementation);

    /**
     * @dev Sets the address of the initial implementation, and the initial owner who can upgrade the beacon.
     */
    constructor(address implementation_, address initialOwner) Ownable(initialOwner) {
        _setImplementation(implementation_);
    }

    /**
     * @dev Returns the current implementation address.
     */
    function implementation() public view virtual returns (address) {
        return _implementation;
    }

    /**
     * @dev Upgrades the beacon to a new implementation.
     *
     * Emits an {Upgraded} event.
     *
     * Requirements:
     *
     * - msg.sender must be the owner of the contract.
     * - `newImplementation` must be a contract.
     */
    function upgradeTo(address newImplementation) public virtual onlyOwner {
        _setImplementation(newImplementation);
    }

    /**
     * @dev Sets the implementation contract address for this beacon
     *
     * Requirements:
     *
     * - `newImplementation` must be a contract.
     */
    function _setImplementation(address newImplementation) private {
        if (newImplementation.code.length == 0) {
            revert BeaconInvalidImplementation(newImplementation);
        }
        _implementation = newImplementation;
        emit Upgraded(newImplementation);
    }
}

// src/flap/VaultBaseV3.sol

/// @title VaultBaseV3
/// @author The Flap Team
/// @notice Extended abstract base contract for vault implementations that adds
///         support for ERC20 quote tokens (stablecoins, tokenized equities / RWA)
///         as the vault's revenue currency, via `vaultQuoteToken()` discovery and
///         a normative balance-delta accounting model.
///
/// @dev  ── MOTIVATION ───────────────────────────────────────────────────────
///
/// Every pre-V3 vault is driven by its `receive()` function: when the token's
/// TaxProcessor dispatches tax revenue in the native gas token (BNB / ETH),
/// the value transfer itself invokes `receive()` and the vault's logic runs.
///
/// ERC20 revenue breaks that assumption. An ERC20 `transfer` executes the
/// token contract's code, NOT the recipient's — the vault receives the funds
/// but is never invoked. No `receive()`, no `fallback()`, nothing. This is the
/// single reason vault-enabled launches were historically restricted to native
/// quote tokens.
///
/// V3 closes the gap with two coordinated mechanisms:
///
///   1. **The wake call ("ping"), sent by the protocol.** After every ERC20
///      quote payout, the TaxProcessor calls the recipient wallet with empty
///      calldata and zero value — `wallet.call{value: 0}("")` —
///      which invokes the vault's `receive()` exactly like a native transfer
///      would. The vault gets execution; the funds are already there.
///
///   2. **Balance-delta accounting, implemented by the vault (YOU).** Because
///      the wake call carries no value, `msg.value` is useless for ERC20
///      revenue. The vault must instead compare its current quote balance
///      against a stored baseline to recognize new revenue. The normative
///      model is specified below.
///
///
/// ── BACKWARDS COMPATIBILITY ────────────────────────────────────────────────
///
/// `VaultBaseV3` inherits from `VaultBaseV2` and adds only the new
/// `vaultQuoteToken()` abstract method and the `vaultSpecVersion()` marker.
/// Existing vaults that extend `VaultBase` or `VaultBaseV2` are unaffected —
/// they remain native-only and keep working unchanged. New or upgraded vault
/// implementations should extend `VaultBaseV3` instead of `VaultBaseV2` to
/// gain ERC20 quote support; native-only vaults may also adopt V3 (declare
/// `address(0)`) to benefit from the explicit currency declaration.
///
///
/// ── THE PING CONTRACT (what the protocol guarantees) ──────────────────────
///
/// The TaxProcessor's dispatch upholds four invariants; design your vault
/// against them:
///
///   1. **Transfer first, ping after.** When your `receive()` runs, the
///      revenue is already in your balance.
///   2. **Ping failures are ignored.** If your `receive()` reverts, dispatch
///      proceeds without you — the funds still arrive, but your logic did not
///      run and you will only recognize the revenue on the next wake. Do not
///      rely on reverting to refuse revenue.
///   3. **Ping gas is the dispatcher's, not yours.** The protocol does not
///      cap the wake call — it forwards the dispatch caller's remaining gas
///      (EIP-150), and dispatch is permissionless. The protocol's keeper runs
///      the ENTIRE dispatch (swaps, dividends, burn, up to four wallet
///      payouts) under one fixed gas budget; a heavy `receive()` makes the
///      keeper's dispatch of your token fail until someone re-dispatches with
///      a higher gas limit. Keep `receive()` lightweight: update accounting,
///      emit an event, return. Put heavy work — swaps, staking, buybacks —
///      behind explicit public functions driven by your own automation or the
///      protocol's keeper/trigger services.
///   4. **You may be pinged spuriously.** The same wallet can occupy several
///      payout slots and be pinged more than once per dispatch, and anyone
///      can call your `receive()` at any time. A wake that finds no new
///      revenue MUST be a silent no-op (see accounting model, rule 2).
///
/// Native revenue is unchanged: it still arrives as a plain value transfer
/// invoking `receive()`. A V3 vault handles both currencies with the same
/// code path — the accounting model below is currency-agnostic.
///
///
/// ── NORMATIVE ACCOUNTING MODEL (what YOUR vault must implement) ───────────
///
/// Maintain a baseline of already-recognized revenue, e.g.:
///
///   ```solidity
///   uint256 public accountedQuote; // recognized-and-not-yet-spent revenue
///
///   receive() external payable { _syncRevenue(); }
///
///   function _syncRevenue() internal {
///       address quoteToken = vaultQuoteToken();
///       uint256 bal = quoteToken == address(0)
///           ? address(this).balance
///           : IERC20(quoteToken).balanceOf(address(this));
///       if (bal <= accountedQuote) return;            // rule 2: idempotent no-op
///       uint256 newRevenue = bal - accountedQuote;
///       accountedQuote = bal;                          // rule 1: advance baseline
///       _onRevenue(newRevenue);                        // lightweight only (ping law 3)
///   }
///   ```
///
/// Rules:
///
///   1. **Recognize by delta, never by raw balance.** Crediting
///      `balanceOf(this)` as "new revenue" double-counts everything already
///      recognized. Only `balance - accountedQuote` is new.
///   2. **Zero-delta wakes are silent no-ops.** Required by ping law 4.
///   3. **Every outflow MUST decrement `accountedQuote`** by the amount
///      spent, in the same transaction. Forgetting this leaves the baseline
///      above the real balance, and `bal <= accountedQuote` then suppresses
///      revenue recognition forever — the vault deadlocks. This is the
///      single most dangerous mistake a V3 vault can make.
///   4. **Direct transfers are credited late, and that is fine.** Funds sent
///      to the vault outside dispatch (donations, airdrops, misdirected
///      transfers) trigger no ping; they are recognized on the next wake and
///      are indistinguishable from revenue. Treat them as donations. If your
///      vault's economics require exact per-payout amounts, do not infer them
///      from deltas — wait for a typed-callback spec revision (see FUTURE
///      EXTENSIONS).
///   5. **Recognize before you act.** Any function whose behavior depends on
///      available revenue — spending it, paying it out, or gating on it —
///      MUST run the sync routine first, so its outcome never depends on
///      whether a ping happened to arrive beforehand. This applies to every
///      custom function you add to your vault. Exposing a permissionless
///      `sync()` wrapper is RECOMMENDED: it is the neutral, side-effect-free
///      recognition entry for keepers and UIs, and the recovery path when
///      revenue arrives without a wake call (direct transfers, or pings
///      administratively disabled on the processor).
///
///
/// ── HOW TO IMPLEMENT ──────────────────────────────────────────────────────
///
/// 1. **Inherit from VaultBaseV3.** All obligations from VaultBase and
///    VaultBaseV2 still apply (implement `description()` and
///    `vaultUISchema()`, use `_getPortal()` / `_getGuardian()`, honor the
///    Guardian mandate).
///
/// 2. **Override `vaultQuoteToken()`** to return the revenue currency this
///    vault instance accounts for — `address(0)` for the native gas token,
///    the ERC20 address otherwise. It MUST equal the quote token of the tax
///    token this vault serves, MUST be immutable for the life of the vault
///    (set it once at initialization from the factory's `newVault`
///    parameters), and MUST NOT revert. VaultPortal cross-checks it at
///    launch; lenses and UIs read it to label the vault and to warn when a
///    vault is wired to a token with a different quote.
///
/// 3. **Implement `receive()` with the accounting model above.** Present even
///    if your quote is an ERC20 — the wake call lands there.
///
/// 4. **Keep `vaultSpecVersion()` at the default** unless a later spec
///    revision instructs otherwise.
///
/// 5. **Factory-side requirements** (see VaultFactoryBaseV2):
///      - `isQuoteTokenSupported(quote)` MUST answer truthfully for your
///        vault implementation. This is enforced on-chain at launch: the
///        VaultPortal rejects any launch whose quote your factory does not
///        support. Misdeclaring support strands your users' tax revenue in a
///        vault that ignores it.
///      - `factorySpecVersion()` MUST return "v2.3" (or higher) so the
///        VaultPortal applies the V3 validation flow.
///      - `newVault(taxToken, quoteToken, creator, vaultData)` receives the
///        launch quote token — pass it into your vault's initializer.
///      - Creation-time first buys in an ERC20 quote are funded by the
///        launcher, not the vault: the VaultPortal pulls `quoteAmt` from the
///        launching user (via an EIP-2612 permit signed with the VaultPortal
///        as spender, or a prior approval) and refunds any partial fill.
///        Frontends integrating your factory should request that approval or
///        permit; the vault itself plays no part in launch funding.
///
///
/// ── FUTURE EXTENSIONS (non-normative) ─────────────────────────────────────
///
/// A later spec revision may add a typed revenue callback in the spirit of
/// ERC721's `onERC721Received`:
///
///   ```solidity
///   interface IFlapRevenueReceiver {
///       function onFlapRevenue(address quoteToken, uint256 amount) external;
///   }
///   ```
///
/// Dispatch would prefer the typed callback (exact amounts, no delta
/// ambiguity) and fall back to the zero-value ping. The balance-delta
/// baseline remains the source of truth regardless — transfers can always
/// arrive without a callback — so vaults written against this spec stay
/// correct unchanged.
///
abstract contract VaultBaseV3 is VaultBaseV2 {
    /// @notice The revenue currency this vault accounts for.
    /// @dev MUST equal the quote token of the tax token this vault serves:
    ///      `address(0)` for the native gas token, the ERC20 address
    ///      otherwise. MUST be stable for the life of the vault and MUST NOT
    ///      revert. Consumed by the VaultPortal launch cross-check and by
    ///      lens/UI discovery.
    /// @return quoteToken The revenue currency (`address(0)` = native).
    function vaultQuoteToken() public view virtual returns (address quoteToken);

    /// @notice The vault-side spec revision this implementation conforms to.
    /// @dev Distinct from the factory-side `factorySpecVersion()` ("v2.x"
    ///      series): this string versions the VAULT contract surface.
    ///      Lenses read it to distinguish V3 vaults from legacy ones (which
    ///      implement neither this method nor `vaultQuoteToken()`).
    /// @return The spec version string, "v3" for this revision.
    function vaultSpecVersion() public pure virtual returns (string memory) {
        return "v3";
    }
}

// lib/openzeppelin-contracts/contracts/proxy/beacon/BeaconProxy.sol

// OpenZeppelin Contracts (last updated v5.0.0) (proxy/beacon/BeaconProxy.sol)

pragma solidity ^0.8.20;


/**
 * @dev This contract implements a proxy that gets the implementation address for each call from an {UpgradeableBeacon}.
 *
 * The beacon address can only be set once during construction, and cannot be changed afterwards. It is stored in an
 * immutable variable to avoid unnecessary storage reads, and also in the beacon storage slot specified by
 * https://eips.ethereum.org/EIPS/eip-1967[EIP1967] so that it can be accessed externally.
 *
 * CAUTION: Since the beacon address can never be changed, you must ensure that you either control the beacon, or trust
 * the beacon to not upgrade the implementation maliciously.
 *
 * IMPORTANT: Do not use the implementation logic to modify the beacon storage slot. Doing so would leave the proxy in
 * an inconsistent state where the beacon storage slot does not match the beacon address.
 */
contract BeaconProxy is Proxy {
    // An immutable address for the beacon to avoid unnecessary SLOADs before each delegate call.
    address private immutable _beacon;

    /**
     * @dev Initializes the proxy with `beacon`.
     *
     * If `data` is nonempty, it's used as data in a delegate call to the implementation returned by the beacon. This
     * will typically be an encoded function call, and allows initializing the storage of the proxy like a Solidity
     * constructor.
     *
     * Requirements:
     *
     * - `beacon` must be a contract with the interface {IBeacon}.
     * - If `data` is empty, `msg.value` must be zero.
     */
    constructor(address beacon, bytes memory data) payable {
        ERC1967Utils.upgradeBeaconToAndCall(beacon, data);
        _beacon = beacon;
    }

    /**
     * @dev Returns the current implementation address of the associated beacon.
     */
    function _implementation() internal view virtual override returns (address) {
        return IBeacon(_getBeacon()).implementation();
    }

    /**
     * @dev Returns the beacon.
     */
    function _getBeacon() internal view virtual returns (address) {
        return _beacon;
    }
}

// src/flap/VaultFactoryBaseV2.sol

/// @title VaultFactoryBaseV2
/// @author The Flap Team
/// @notice Extended abstract base contract for vault factory implementations
///         that adds:
///           1. On-chain UI schema discovery via `vaultDataSchema()`
///           2. A `_getGuardian()` helper (mirrors VaultBase's pattern)
///           3. (v2.1) Policy discovery via `tokenCreationPolicies()` so the
///                    UI can surface validation hints before a transaction
///           4. (v2.2) `factorySpecVersion()` to identify the spec revision
///           5. (v2.2) `onBeforeLaunch(bytes)` for wrapper-agnostic pre-launch validation
///
/// @dev  ── MOTIVATION ───────────────────────────────────────────────────────
///
/// The protocol is designed so that anyone can introduce new vault types.
/// Any contract that implements `VaultFactoryBaseV2` can be passed to
/// VaultPortal to launch tokens — no on-chain registration is required.
/// Each factory decodes the
/// opaque `vaultData` bytes parameter in `newVault()` differently — a
/// generic UI has no way to know what fields to render without inspecting
/// each factory's source code.
///
/// Existing factories (FlapXVaultFactory, SplitVaultFactory,
/// SnowBallFactory) already have purpose-built UIs.  `VaultFactoryBaseV2`
/// exists to support **future** factories: by requiring every new factory
/// to override `vaultDataSchema()`, the UI can automatically generate a
/// creation form for any vault type — even ones that did not exist when
/// the UI was built.
///
/// `vaultDataSchema()` returns a `VaultDataSchema` struct (defined in
/// `IVaultSchemasV1.sol`) that fully describes the shape of `vaultData`.
///
///
/// ── BACKWARDS COMPATIBILITY ────────────────────────────────────────────────
///
/// `VaultFactoryBaseV2` is a new abstract contract that implements the
/// existing `IVaultFactory` interface.  Existing factory contracts that
/// directly implement `IVaultFactory` are unaffected.  New or upgraded
/// factory implementations should extend `VaultFactoryBaseV2` instead of
/// implementing `IVaultFactory` directly, to gain:
///   - `vaultDataSchema()` for UI auto-generation
///   - `_getGuardian()` for guardian address resolution
///
///
/// ── HOW TO IMPLEMENT ───────────────────────────────────────────────────────
///
/// 1. **Inherit from VaultFactoryBaseV2**.
///    All obligations from `IVaultFactory` still apply (implement `newVault()`
///    and `isQuoteTokenSupported()`).
///
/// 2. **Override `vaultDataSchema()`** to return a `VaultDataSchema`
///    describing the fields your factory expects in the `vaultData` parameter.
///
///    The schema has three components:
///      - `description` – free-form string explaining what the vault does
///        and what data is required (shown to the user in the UI).
///      - `fields`      – ordered array of `FieldDescriptor`, each describing
///        one component of the ABI-encoded tuple.
///      - `isArray`     – true if `vaultData` is an array of tuples.
///
///    The current spec supports two shapes:
///      • A single tuple    (`isArray == false`)  – e.g. `(string)`
///      • An array of tuples (`isArray == true`)  – e.g. `(address,uint16)[]`
///
///    If `fields` is empty and `isArray` is false, the factory ignores
///    `vaultData` entirely.
///
/// 3. **MANDATE: Guardian access to privileged functions**
///    If your factory (or the vaults it creates) exposes any privileged /
///    role-gated functions, the Guardian address returned by `_getGuardian()`
///    **must** also be granted the required role(s).  Furthermore, the
///    Guardian's role **must not** be revocable by any other account — only
///    the Guardian itself may renounce its own access.
///
///    When using OpenZeppelin's `AccessControl`, override `revokeRole()` to
///    enforce this invariant:
///
///      ```
///      function revokeRole(bytes32 role, address account)
///          public
///          override
///          onlyRole(getRoleAdmin(role))
///      {
///          address guardian = _getGuardian();
///          if (account == guardian) {
///              revert CannotRevokeGuardianRole();
///          }
///          super.revokeRole(role, account);
///      }
///      ```
///
///    This ensures that the Guardian always retains a backup path to call
///    permissioned functions, regardless of any admin action.
///
///
/// ── HOW THE UI USES VaultDataSchema ────────────────────────────────────────
///
///   1. UI obtains the factory address (e.g. from the token-launch event
///      or a directory service).
///   2. UI calls factory.vaultDataSchema() → gets VaultDataSchema.
///   3. For each field in schema.fields, UI renders an input widget:
///        "string"   → text input
///        "address"  → address input (with checksum validation)
///        "uint16"   → number input (0–65535)
///        "uint256"  → big-number input
///        "time"     → date/time picker input (alias for uint256;
///                      value is a Unix timestamp in seconds).
///                      When used in outputs, rendered as a
///                      human-readable time string or countdown clock
///        "bool"     → checkbox
///        "bytes"    → hex input
///        "bytes32"  → hex input (32 bytes)
///      For numeric fields, if field.decimals > 0 the UI multiplies the
///      user's input by 10^decimals before encoding.
///        e.g. decimals=18: user types "1" → encoded value is 1e18
///      If decimals == 0 the raw value is used as-is.
///   4. If schema.isArray == true, UI renders an "Add Row" button for
///      dynamic array entries.
///   5. UI encodes the user input via:
///        If isArray: abi.encode(tuple[])
///        Else:       abi.encode(tuple)
///      using the fieldType values to construct the ABI type string.
///   6. Encoded bytes are passed as `vaultData` in NewTaxTokenWithVaultParams.
///
///
/// ── EXAMPLE: Hypothetical StakingVaultFactory (single tuple) ────────────
///
///   function vaultDataSchema() public pure override returns (VaultDataSchema memory schema) {
///       schema.description = "Creates a staking vault. The creator specifies "
///           "a reward rate and lock duration at launch time.";
///       schema.fields = new FieldDescriptor[](2);
///       schema.fields[0] = FieldDescriptor(
///           "rewardRateBps",                              // name
///           "uint16",                                     // fieldType
///           "Annual reward rate in basis points",         // description
///           0                                             // decimals (raw value)
///       );
///       schema.fields[1] = FieldDescriptor(
///           "lockDuration",                               // name
///           "uint256",                                    // fieldType
///           "Lock duration in seconds",                   // description
///           0                                             // decimals
///       );
///       schema.isArray = false;
///   }
///
///
/// ── EXAMPLE: Hypothetical MultiPayeeFactory (array of tuples) ──────────
///
///   function vaultDataSchema() public pure override returns (VaultDataSchema memory schema) {
///       schema.description = "Creates a vault that distributes received BNB "
///           "among a dynamic set of payees by basis-point shares.";
///       schema.fields = new FieldDescriptor[](2);
///       schema.fields[0] = FieldDescriptor(
///           "payee",                                      // name
///           "address",                                    // fieldType
///           "Payee wallet address",                       // description
///           0                                             // decimals
///       );
///       schema.fields[1] = FieldDescriptor(
///           "bps",                                        // name
///           "uint16",                                     // fieldType
///           "Basis points share (10000 = 100%)",          // description
///           0                                             // decimals (raw value)
///       );
///       schema.isArray = true;  // vaultData = abi.encode((address,uint16)[])
///   }
///
///
/// ── EXAMPLE: Factory that ignores vaultData ────────────────────────────────
///
///   function vaultDataSchema() public pure override returns (VaultDataSchema memory schema) {
///       schema.description = "Creates a vault with no configurable parameters. "
///           "No user input is required — vaultData is ignored.";
///       schema.fields = new FieldDescriptor[](0);
///       schema.isArray = false;
///   }
///
abstract contract VaultFactoryBaseV2 is IVaultFactory, IVaultFactoryValidationV2 {
    /// @notice Error thrown when the current chain is not supported by
    ///         `_getGuardian()`.
    error UnsupportedChain(uint256 chainId);

    /// @notice Error thrown when the deprecated legacy V6 validation hook is
    ///         reached without a factory-specific override.
    error LegacyV6ValidationHookNotImplemented();

    /// @notice Returns the schema describing the `vaultData` bytes expected
    ///         by this factory's `newVault()` method.
    ///
    /// @dev Each factory implementation **must** override this to describe the
    ///      fields it expects.
    ///
    ///      The returned `VaultDataSchema` struct contains:
    ///        - `description` – what the vault does and what data is needed
    ///        - `fields`      – ordered `FieldDescriptor[]` for each tuple
    ///                          component
    ///        - `isArray`     – whether `vaultData` is a tuple array
    ///
    ///      If the factory ignores `vaultData`, return an empty schema
    ///      (fields = [], isArray = false).
    ///
    ///      See the `VaultDataSchema` and `FieldDescriptor` docs in
    ///      `IVaultSchemasV1.sol` for the full specification and UI rendering
    ///      algorithm.
    ///
    /// @return schema The vault data schema for this factory.
    function vaultDataSchema() public pure virtual returns (VaultDataSchema memory schema);

    /// @notice Deprecated legacy hook called by VaultPortal immediately before a new V6
    ///         tax token is created via `newTokenV6WithVault`.
    ///
    /// @dev    This hook is no longer allowed by default.
    ///
    ///         Any factory that still intends to use the legacy v2.1 validation surface
    ///         MUST explicitly override this function. The base implementation always
    ///         reverts with `LegacyV6ValidationHookNotImplemented()` so that new factories
    ///         do not accidentally opt into the old path.
    ///
    ///         New factories should prefer the normalized `onBeforeLaunch(bytes)` flow and
    ///         keep `factorySpecVersion()` at the default `"v2.2"`.
    ///
    ///         Override this function only when a factory intentionally stays on the legacy
    ///         V6-only validation path.
    ///
    ///         ── RETURN VALUE CONTRACT ──────────────────────────────────────────────
    ///
    ///         The caller (VaultPortal) MUST invoke this hook via a low-level call so
    ///         it can distinguish between the three possible outcomes:
    ///
    ///           1. **Hook selector missing entirely** — the low-level call reverts with
    ///              empty returndata (no selector match on the target contract).
    ///              VaultPortal may treat this as absence of legacy support.
    ///
    ///           2. **Hook implemented, validation passed** — returns `(true, "")`.
    ///              VaultPortal continues with token creation.
    ///
    ///           3. **Hook implemented, validation failed** — returns `(false, reason)`
    ///              where `reason` is a human-readable explanation.
    ///              VaultPortal MUST revert, surfacing `reason` to the caller.
    ///
    ///         Pseudo-code for the caller:
    ///
    ///           ```
    ///           (bool callOk, bytes memory ret) = factory.call(
    ///               abi.encodeCall(IVaultFactoryBaseV2.onBeforeNewTokenV6WithVault, (params))
    ///           );
    ///           if (callOk) {
    ///               (bool passed, string memory reason) = abi.decode(ret, (bool, string));
    ///               if (!passed) revert HookRejected(reason);
    ///           } else if (ret.length > 0) {
    ///               // Unexpected revert with error data — bubble it up.
    ///               assembly { revert(add(ret, 32), mload(ret)) }
    ///           }
    ///           // ret.length == 0: selector missing on target contract.
    ///           ```
    ///
    ///         Example use-cases for overrides:
    ///           - Reject unsupported quote tokens
    ///           - Enforce minimum/maximum tax rates
    ///           - Restrict allowed migrator types
    ///           - Require a specific Dividend bps
    ///
    /// @param params The full set of token creation parameters passed to
    ///               `VaultPortal.newTokenV6WithVault`.
    /// @return success True if the params pass all factory-specific constraints.
    /// @return reason  Human-readable explanation if `success` is false; empty otherwise.
    function onBeforeNewTokenV6WithVault(IVaultPortalTypes.NewTokenV6WithVaultParams calldata params)
        external
        virtual
        returns (bool, string memory)
    {
        params = params;
        revert LegacyV6ValidationHookNotImplemented();
    }

    /// @notice Optional wrapper-agnostic pre-launch validation hook introduced in spec v2.2.
    /// @dev    The default implementation decodes the normalized payload and forwards it to
    ///         `_validateBeforeLaunch(...)`. Legacy factories that must stay on the older V6
    ///         hook path should override `factorySpecVersion()` and return `"v2.1"`.
    function onBeforeLaunch(bytes calldata validationData)
        external
        view
        virtual
        override
        returns (bool success, string memory reason)
    {
        IVaultFactoryValidationV2.LaunchValidationDataV1 memory data =
            abi.decode(validationData, (IVaultFactoryValidationV2.LaunchValidationDataV1));
        return _validateBeforeLaunch(data);
    }

    /// @notice Internal validation hook for spec-v2.2+ factories.
    /// @dev    Concrete factories can override this when they want the generic `onBeforeLaunch(...)`
    ///         path. The default implementation is a no-op so older factories remain source-compatible.
    function _validateBeforeLaunch(IVaultFactoryValidationV2.LaunchValidationDataV1 memory data)
        internal
        view
        virtual
        returns (bool success, string memory reason)
    {
        data = data;
        return (true, "");
    }

    /// @notice Returns the version of the VaultFactoryBaseV2 specification that
    ///         this contract conforms to.
    ///
    /// @dev    The default return value is `"v2.2"`, meaning new factories that inherit this
    ///         base opt into the normalized `onBeforeLaunch(...)` validation generation by default.
    ///         Legacy factories that must keep the older V6 hook semantics should override this
    ///         and return `"v2.1"`.
    ///
    ///         The UI SHOULD call this via a low-level `staticcall` before
    ///         calling `tokenCreationPolicies()`.  A revert (or the absence of
    ///         this selector) indicates a pre-v2.1 factory that does not
    ///         support policy discovery.
    ///
    /// @return The spec version string, defaulting to "v2.2".
    function factorySpecVersion() public pure virtual returns (string memory) {
        return "v2.2";
    }

    /// @notice Returns the list of constraints this factory enforces on
    ///         token-creation parameters passed to `newTokenV6WithVault`.
    ///
    /// @dev    The policies returned here are **informational only** — they are
    ///         intended for UI rendering (inline validation hints, error
    ///         messages). The actual enforcement happens in whichever validation
    ///         hook the factory uses: `onBeforeLaunch(bytes)` for spec-v2.2+
    ///         factories, or `onBeforeNewTokenV6WithVault(...)` for explicitly
    ///         legacy v2.1 factories.
    ///
    ///         The default implementation returns an empty array, meaning the
    ///         factory declares no machine-readable constraints.  Factories that
    ///         override either validation hook SHOULD also override this method
    ///         to describe their constraints in policy form.
    ///
    ///         Policies are ordered from most to least important; the UI MAY
    ///         display them in this order.
    ///
    ///         See `FactoryPolicy` in `IVaultSchemasV1.sol` for the full struct
    ///         specification, supported operators, and encoding rules.
    ///
    /// @return policies  An array of FactoryPolicy structs describing the
    ///                   constraints.
    function tokenCreationPolicies() public pure virtual returns (FactoryPolicy[] memory policies) {
        return new FactoryPolicy[](0);
    }

    /// @notice Get the VaultPortal address for the current chain.
    ///
    /// @dev Returns the canonical VaultPortal proxy address for the chain
    ///      this contract is deployed on.
    ///
    ///      Currently supports:
    ///        - BNB Chain   (chain ID 56)  → 0x90497450f2a706f1951b5bdda52B4E5d16f34C06
    ///        - BNB Testnet (chain ID 97)  → 0x027e3704fC5C16522e9393d04C60A3ac5c0d775f
    ///
    ///      Reverts with `UnsupportedChain` if called on an unknown chain.
    ///
    /// @return vaultPortal The VaultPortal contract address for the current chain.
    function _getVaultPortal() internal view returns (address vaultPortal) {
        uint256 chainId = block.chainid;
        if (chainId == 56) {
            // BNB Chain VaultPortal address
            return 0x90497450f2a706f1951b5bdda52B4E5d16f34C06;
        } else if (chainId == 97) {
            // BNB Testnet VaultPortal address
            return 0x027e3704fC5C16522e9393d04C60A3ac5c0d775f;
        } else if (chainId == 4663 || chainId == 46630) {
            // Robinhood Chain — VaultPortal address
            return 0xe9F7AB7DE8FB8756acbB6a1cd13316a43308197B;
        }
        revert UnsupportedChain(chainId);
    }

    /// @notice Get the Guardian address for the current chain.
    ///
    /// @dev Mirrors the `_getGuardian()` helper in `VaultBase`.  The Guardian
    ///      is a privileged address that can always call permissioned functions
    ///      as a backup mechanism.
    ///
    ///      Currently supports:
    ///        - BNB Chain   (chain ID 56)  → 0x9e27098dcD8844bcc6287a557E0b4D09C86B8a4b
    ///        - BNB Testnet (chain ID 97)  → 0x76Fa8C526f8Bc27ba6958B76DeEf92a0dbE46950
    ///
    ///      Reverts with `UnsupportedChain` if called on an unknown chain.
    ///
    /// @return guardian The Guardian contract address for the current chain.
    function _getGuardian() internal view returns (address guardian) {
        uint256 chainId = block.chainid;
        if (chainId == 56) {
            // BNB Chain Guardian address
            return 0x9e27098dcD8844bcc6287a557E0b4D09C86B8a4b;
        } else if (chainId == 97) {
            // BNB Testnet Guardian address
            return 0x76Fa8C526f8Bc27ba6958B76DeEf92a0dbE46950;
        } else if (chainId == 4663 || chainId == 46630) {
            // Robinhood Chain Guardian address
            return 0x0000b48720d3B4ED6BC5031768B07F2b59270000;
        }
        revert UnsupportedChain(chainId);
    }
}

// lib/openzeppelin-contracts-upgradeable/contracts/token/ERC721/ERC721Upgradeable.sol

// OpenZeppelin Contracts (last updated v5.0.0) (token/ERC721/ERC721.sol)

pragma solidity ^0.8.20;


/**
 * @dev Implementation of https://eips.ethereum.org/EIPS/eip-721[ERC721] Non-Fungible Token Standard, including
 * the Metadata extension, but not including the Enumerable extension, which is available separately as
 * {ERC721Enumerable}.
 */
abstract contract ERC721Upgradeable is Initializable, ContextUpgradeable, ERC165Upgradeable, IERC721, IERC721Metadata, IERC721Errors {
    using Strings for uint256;

    /// @custom:storage-location erc7201:openzeppelin.storage.ERC721
    struct ERC721Storage {
        // Token name
        string _name;

        // Token symbol
        string _symbol;

        mapping(uint256 tokenId => address) _owners;

        mapping(address owner => uint256) _balances;

        mapping(uint256 tokenId => address) _tokenApprovals;

        mapping(address owner => mapping(address operator => bool)) _operatorApprovals;
    }

    // keccak256(abi.encode(uint256(keccak256("openzeppelin.storage.ERC721")) - 1)) & ~bytes32(uint256(0xff))
    bytes32 private constant ERC721StorageLocation = 0x80bb2b638cc20bc4d0a60d66940f3ab4a00c1d7b313497ca82fb0b4ab0079300;

    function _getERC721Storage() private pure returns (ERC721Storage storage $) {
        assembly {
            $.slot := ERC721StorageLocation
        }
    }

    /**
     * @dev Initializes the contract by setting a `name` and a `symbol` to the token collection.
     */
    function __ERC721_init(string memory name_, string memory symbol_) internal onlyInitializing {
        __ERC721_init_unchained(name_, symbol_);
    }

    function __ERC721_init_unchained(string memory name_, string memory symbol_) internal onlyInitializing {
        ERC721Storage storage $ = _getERC721Storage();
        $._name = name_;
        $._symbol = symbol_;
    }

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC165Upgradeable, IERC165) returns (bool) {
        return
            interfaceId == type(IERC721).interfaceId ||
            interfaceId == type(IERC721Metadata).interfaceId ||
            super.supportsInterface(interfaceId);
    }

    /**
     * @dev See {IERC721-balanceOf}.
     */
    function balanceOf(address owner) public view virtual returns (uint256) {
        ERC721Storage storage $ = _getERC721Storage();
        if (owner == address(0)) {
            revert ERC721InvalidOwner(address(0));
        }
        return $._balances[owner];
    }

    /**
     * @dev See {IERC721-ownerOf}.
     */
    function ownerOf(uint256 tokenId) public view virtual returns (address) {
        return _requireOwned(tokenId);
    }

    /**
     * @dev See {IERC721Metadata-name}.
     */
    function name() public view virtual returns (string memory) {
        ERC721Storage storage $ = _getERC721Storage();
        return $._name;
    }

    /**
     * @dev See {IERC721Metadata-symbol}.
     */
    function symbol() public view virtual returns (string memory) {
        ERC721Storage storage $ = _getERC721Storage();
        return $._symbol;
    }

    /**
     * @dev See {IERC721Metadata-tokenURI}.
     */
    function tokenURI(uint256 tokenId) public view virtual returns (string memory) {
        _requireOwned(tokenId);

        string memory baseURI = _baseURI();
        return bytes(baseURI).length > 0 ? string.concat(baseURI, tokenId.toString()) : "";
    }

    /**
     * @dev Base URI for computing {tokenURI}. If set, the resulting URI for each
     * token will be the concatenation of the `baseURI` and the `tokenId`. Empty
     * by default, can be overridden in child contracts.
     */
    function _baseURI() internal view virtual returns (string memory) {
        return "";
    }

    /**
     * @dev See {IERC721-approve}.
     */
    function approve(address to, uint256 tokenId) public virtual {
        _approve(to, tokenId, _msgSender());
    }

    /**
     * @dev See {IERC721-getApproved}.
     */
    function getApproved(uint256 tokenId) public view virtual returns (address) {
        _requireOwned(tokenId);

        return _getApproved(tokenId);
    }

    /**
     * @dev See {IERC721-setApprovalForAll}.
     */
    function setApprovalForAll(address operator, bool approved) public virtual {
        _setApprovalForAll(_msgSender(), operator, approved);
    }

    /**
     * @dev See {IERC721-isApprovedForAll}.
     */
    function isApprovedForAll(address owner, address operator) public view virtual returns (bool) {
        ERC721Storage storage $ = _getERC721Storage();
        return $._operatorApprovals[owner][operator];
    }

    /**
     * @dev See {IERC721-transferFrom}.
     */
    function transferFrom(address from, address to, uint256 tokenId) public virtual {
        if (to == address(0)) {
            revert ERC721InvalidReceiver(address(0));
        }
        // Setting an "auth" arguments enables the `_isAuthorized` check which verifies that the token exists
        // (from != 0). Therefore, it is not needed to verify that the return value is not 0 here.
        address previousOwner = _update(to, tokenId, _msgSender());
        if (previousOwner != from) {
            revert ERC721IncorrectOwner(from, tokenId, previousOwner);
        }
    }

    /**
     * @dev See {IERC721-safeTransferFrom}.
     */
    function safeTransferFrom(address from, address to, uint256 tokenId) public {
        safeTransferFrom(from, to, tokenId, "");
    }

    /**
     * @dev See {IERC721-safeTransferFrom}.
     */
    function safeTransferFrom(address from, address to, uint256 tokenId, bytes memory data) public virtual {
        transferFrom(from, to, tokenId);
        _checkOnERC721Received(from, to, tokenId, data);
    }

    /**
     * @dev Returns the owner of the `tokenId`. Does NOT revert if token doesn't exist
     *
     * IMPORTANT: Any overrides to this function that add ownership of tokens not tracked by the
     * core ERC721 logic MUST be matched with the use of {_increaseBalance} to keep balances
     * consistent with ownership. The invariant to preserve is that for any address `a` the value returned by
     * `balanceOf(a)` must be equal to the number of tokens such that `_ownerOf(tokenId)` is `a`.
     */
    function _ownerOf(uint256 tokenId) internal view virtual returns (address) {
        ERC721Storage storage $ = _getERC721Storage();
        return $._owners[tokenId];
    }

    /**
     * @dev Returns the approved address for `tokenId`. Returns 0 if `tokenId` is not minted.
     */
    function _getApproved(uint256 tokenId) internal view virtual returns (address) {
        ERC721Storage storage $ = _getERC721Storage();
        return $._tokenApprovals[tokenId];
    }

    /**
     * @dev Returns whether `spender` is allowed to manage `owner`'s tokens, or `tokenId` in
     * particular (ignoring whether it is owned by `owner`).
     *
     * WARNING: This function assumes that `owner` is the actual owner of `tokenId` and does not verify this
     * assumption.
     */
    function _isAuthorized(address owner, address spender, uint256 tokenId) internal view virtual returns (bool) {
        return
            spender != address(0) &&
            (owner == spender || isApprovedForAll(owner, spender) || _getApproved(tokenId) == spender);
    }

    /**
     * @dev Checks if `spender` can operate on `tokenId`, assuming the provided `owner` is the actual owner.
     * Reverts if `spender` does not have approval from the provided `owner` for the given token or for all its assets
     * the `spender` for the specific `tokenId`.
     *
     * WARNING: This function assumes that `owner` is the actual owner of `tokenId` and does not verify this
     * assumption.
     */
    function _checkAuthorized(address owner, address spender, uint256 tokenId) internal view virtual {
        if (!_isAuthorized(owner, spender, tokenId)) {
            if (owner == address(0)) {
                revert ERC721NonexistentToken(tokenId);
            } else {
                revert ERC721InsufficientApproval(spender, tokenId);
            }
        }
    }

    /**
     * @dev Unsafe write access to the balances, used by extensions that "mint" tokens using an {ownerOf} override.
     *
     * NOTE: the value is limited to type(uint128).max. This protect against _balance overflow. It is unrealistic that
     * a uint256 would ever overflow from increments when these increments are bounded to uint128 values.
     *
     * WARNING: Increasing an account's balance using this function tends to be paired with an override of the
     * {_ownerOf} function to resolve the ownership of the corresponding tokens so that balances and ownership
     * remain consistent with one another.
     */
    function _increaseBalance(address account, uint128 value) internal virtual {
        ERC721Storage storage $ = _getERC721Storage();
        unchecked {
            $._balances[account] += value;
        }
    }

    /**
     * @dev Transfers `tokenId` from its current owner to `to`, or alternatively mints (or burns) if the current owner
     * (or `to`) is the zero address. Returns the owner of the `tokenId` before the update.
     *
     * The `auth` argument is optional. If the value passed is non 0, then this function will check that
     * `auth` is either the owner of the token, or approved to operate on the token (by the owner).
     *
     * Emits a {Transfer} event.
     *
     * NOTE: If overriding this function in a way that tracks balances, see also {_increaseBalance}.
     */
    function _update(address to, uint256 tokenId, address auth) internal virtual returns (address) {
        ERC721Storage storage $ = _getERC721Storage();
        address from = _ownerOf(tokenId);

        // Perform (optional) operator check
        if (auth != address(0)) {
            _checkAuthorized(from, auth, tokenId);
        }

        // Execute the update
        if (from != address(0)) {
            // Clear approval. No need to re-authorize or emit the Approval event
            _approve(address(0), tokenId, address(0), false);

            unchecked {
                $._balances[from] -= 1;
            }
        }

        if (to != address(0)) {
            unchecked {
                $._balances[to] += 1;
            }
        }

        $._owners[tokenId] = to;

        emit Transfer(from, to, tokenId);

        return from;
    }

    /**
     * @dev Mints `tokenId` and transfers it to `to`.
     *
     * WARNING: Usage of this method is discouraged, use {_safeMint} whenever possible
     *
     * Requirements:
     *
     * - `tokenId` must not exist.
     * - `to` cannot be the zero address.
     *
     * Emits a {Transfer} event.
     */
    function _mint(address to, uint256 tokenId) internal {
        if (to == address(0)) {
            revert ERC721InvalidReceiver(address(0));
        }
        address previousOwner = _update(to, tokenId, address(0));
        if (previousOwner != address(0)) {
            revert ERC721InvalidSender(address(0));
        }
    }

    /**
     * @dev Mints `tokenId`, transfers it to `to` and checks for `to` acceptance.
     *
     * Requirements:
     *
     * - `tokenId` must not exist.
     * - If `to` refers to a smart contract, it must implement {IERC721Receiver-onERC721Received}, which is called upon a safe transfer.
     *
     * Emits a {Transfer} event.
     */
    function _safeMint(address to, uint256 tokenId) internal {
        _safeMint(to, tokenId, "");
    }

    /**
     * @dev Same as {xref-ERC721-_safeMint-address-uint256-}[`_safeMint`], with an additional `data` parameter which is
     * forwarded in {IERC721Receiver-onERC721Received} to contract recipients.
     */
    function _safeMint(address to, uint256 tokenId, bytes memory data) internal virtual {
        _mint(to, tokenId);
        _checkOnERC721Received(address(0), to, tokenId, data);
    }

    /**
     * @dev Destroys `tokenId`.
     * The approval is cleared when the token is burned.
     * This is an internal function that does not check if the sender is authorized to operate on the token.
     *
     * Requirements:
     *
     * - `tokenId` must exist.
     *
     * Emits a {Transfer} event.
     */
    function _burn(uint256 tokenId) internal {
        address previousOwner = _update(address(0), tokenId, address(0));
        if (previousOwner == address(0)) {
            revert ERC721NonexistentToken(tokenId);
        }
    }

    /**
     * @dev Transfers `tokenId` from `from` to `to`.
     *  As opposed to {transferFrom}, this imposes no restrictions on msg.sender.
     *
     * Requirements:
     *
     * - `to` cannot be the zero address.
     * - `tokenId` token must be owned by `from`.
     *
     * Emits a {Transfer} event.
     */
    function _transfer(address from, address to, uint256 tokenId) internal {
        if (to == address(0)) {
            revert ERC721InvalidReceiver(address(0));
        }
        address previousOwner = _update(to, tokenId, address(0));
        if (previousOwner == address(0)) {
            revert ERC721NonexistentToken(tokenId);
        } else if (previousOwner != from) {
            revert ERC721IncorrectOwner(from, tokenId, previousOwner);
        }
    }

    /**
     * @dev Safely transfers `tokenId` token from `from` to `to`, checking that contract recipients
     * are aware of the ERC721 standard to prevent tokens from being forever locked.
     *
     * `data` is additional data, it has no specified format and it is sent in call to `to`.
     *
     * This internal function is like {safeTransferFrom} in the sense that it invokes
     * {IERC721Receiver-onERC721Received} on the receiver, and can be used to e.g.
     * implement alternative mechanisms to perform token transfer, such as signature-based.
     *
     * Requirements:
     *
     * - `tokenId` token must exist and be owned by `from`.
     * - `to` cannot be the zero address.
     * - `from` cannot be the zero address.
     * - If `to` refers to a smart contract, it must implement {IERC721Receiver-onERC721Received}, which is called upon a safe transfer.
     *
     * Emits a {Transfer} event.
     */
    function _safeTransfer(address from, address to, uint256 tokenId) internal {
        _safeTransfer(from, to, tokenId, "");
    }

    /**
     * @dev Same as {xref-ERC721-_safeTransfer-address-address-uint256-}[`_safeTransfer`], with an additional `data` parameter which is
     * forwarded in {IERC721Receiver-onERC721Received} to contract recipients.
     */
    function _safeTransfer(address from, address to, uint256 tokenId, bytes memory data) internal virtual {
        _transfer(from, to, tokenId);
        _checkOnERC721Received(from, to, tokenId, data);
    }

    /**
     * @dev Approve `to` to operate on `tokenId`
     *
     * The `auth` argument is optional. If the value passed is non 0, then this function will check that `auth` is
     * either the owner of the token, or approved to operate on all tokens held by this owner.
     *
     * Emits an {Approval} event.
     *
     * Overrides to this logic should be done to the variant with an additional `bool emitEvent` argument.
     */
    function _approve(address to, uint256 tokenId, address auth) internal {
        _approve(to, tokenId, auth, true);
    }

    /**
     * @dev Variant of `_approve` with an optional flag to enable or disable the {Approval} event. The event is not
     * emitted in the context of transfers.
     */
    function _approve(address to, uint256 tokenId, address auth, bool emitEvent) internal virtual {
        ERC721Storage storage $ = _getERC721Storage();
        // Avoid reading the owner unless necessary
        if (emitEvent || auth != address(0)) {
            address owner = _requireOwned(tokenId);

            // We do not use _isAuthorized because single-token approvals should not be able to call approve
            if (auth != address(0) && owner != auth && !isApprovedForAll(owner, auth)) {
                revert ERC721InvalidApprover(auth);
            }

            if (emitEvent) {
                emit Approval(owner, to, tokenId);
            }
        }

        $._tokenApprovals[tokenId] = to;
    }

    /**
     * @dev Approve `operator` to operate on all of `owner` tokens
     *
     * Requirements:
     * - operator can't be the address zero.
     *
     * Emits an {ApprovalForAll} event.
     */
    function _setApprovalForAll(address owner, address operator, bool approved) internal virtual {
        ERC721Storage storage $ = _getERC721Storage();
        if (operator == address(0)) {
            revert ERC721InvalidOperator(operator);
        }
        $._operatorApprovals[owner][operator] = approved;
        emit ApprovalForAll(owner, operator, approved);
    }

    /**
     * @dev Reverts if the `tokenId` doesn't have a current owner (it hasn't been minted, or it has been burned).
     * Returns the owner.
     *
     * Overrides to ownership logic should be done to {_ownerOf}.
     */
    function _requireOwned(uint256 tokenId) internal view returns (address) {
        address owner = _ownerOf(tokenId);
        if (owner == address(0)) {
            revert ERC721NonexistentToken(tokenId);
        }
        return owner;
    }

    /**
     * @dev Private function to invoke {IERC721Receiver-onERC721Received} on a target address. This will revert if the
     * recipient doesn't accept the token transfer. The call is not executed if the target address is not a contract.
     *
     * @param from address representing the previous owner of the given token ID
     * @param to target address that will receive the tokens
     * @param tokenId uint256 ID of the token to be transferred
     * @param data bytes optional data to send along with the call
     */
    function _checkOnERC721Received(address from, address to, uint256 tokenId, bytes memory data) private {
        if (to.code.length > 0) {
            try IERC721Receiver(to).onERC721Received(_msgSender(), from, tokenId, data) returns (bytes4 retval) {
                if (retval != IERC721Receiver.onERC721Received.selector) {
                    revert ERC721InvalidReceiver(to);
                }
            } catch (bytes memory reason) {
                if (reason.length == 0) {
                    revert ERC721InvalidReceiver(to);
                } else {
                    assembly ("memory-safe") {
                        revert(add(32, reason), mload(reason))
                    }
                }
            }
        }
    }
}

// src/AgentCardVault.sol

interface ICardPortal {
    struct ExactInputParams {
        address inputToken;
        address outputToken;
        uint256 inputAmount;
        uint256 minOutputAmount;
        bytes permitData;
    }

    function swapExactInput(ExactInputParams calldata params) external payable returns (uint256 outputAmount);

    struct QuoteExactInputParams {
        address inputToken;
        address outputToken;
        uint256 inputAmount;
    }

    function quoteExactInput(QuoteExactInputParams calldata params) external returns (uint256 outputAmount);
}

/**
 * @title AgentCardVault
 * @notice Paid Agent-minted cards plus 38,500 reserved team cards, with a built-in card market. BNB quote only.
 *
 * Supply
 *   - 770,000 cards. 77 batches of 10,000. Each batch is 500 team cards (5%) and 9,500 paid cards.
 *   - Paid mint is 0.002 BNB. 20% goes to opsWallet. 80% is swapped for the project token through
 *     the Flap Portal and held for that batch. The Portal routes the curve before listing and the
 *     DEX pool after listing; the caller cannot pick the pool.
 *   - One Agent address can mint 7 paid cards in its lifetime, any number per call up to that cap.
 *     Burning does not restore the quota.
 *     Buying and selling cards is open to anyone and does not use the quota.
 *   - Team cards are minted by teamWallet in chunks. They pay nothing. 500 of them sit in each batch.
 *     teamWallet can only take cards already activated by paid mints, so every team card is live on arrival.
 *
 * Repurchase tokens
 *   - When a batch's 9,500 paid cards are minted, that batch's bought tokens are split evenly
 *     across its 10,000 cards. A card can be burned for that amount only after its batch is closed.
 *
 * Trading-tax dividend (BNB)
 *   - Trading tax is paid out as BNB. It is never swapped.
 *   - Dividend weight is 1 per active, unburned card. A paid card is active when minted. A team card
 *     activates once per 19 paid mints in its batch.
 *   - Until the last paid card is sold, tax accumulates and is distributed when a batch closes,
 *     evenly to every card active at that moment. A card burned before the close gets none of it.
 *   - If the open batch has not filled 7 days after its first paid mint, the waiting tax is split over the
 *     cards active at that moment on the next sync / claim / redeem / buy / sellToBid, and new tax keeps being
 *     split the same way until the next batch starts. Nobody can take this tax; it only goes to cards.
 *   - After the last paid card is sold, tax is distributed as it arrives. New weight does not receive
 *     tax that arrived before it. If no card is left, the tax goes to ops.
 *   - Distributed dividends stay on the card until claimed and follow it on a plain transfer.
 *     A sale through the built-in market pays them to the seller instead.
 *   - Burning pays the repurchase tokens and any unpaid BNB dividend, then the card's weight is removed.
 *
 * Market
 *   - Sell orders: list up to 250 / buy up to 150 / unlist up to 1,000 cards per call. No escrow; any transfer
 *     cancels the listing.
 *   - Buy orders: escrow BNB for N cards at one price, optionally limited to one batch. Cancel anytime.
 *   - Open orders are tracked in bitmaps, so getActiveListings / getActiveBids page through them in id order.
 *   - Every fill takes 1% for the owner (dev). Seller proceeds that cannot be pushed are withdrawable.
 *
 * Ops fee
 *   - Pushed to opsWallet with a gas cap. If the push fails it is owed and opsWallet can pull it.
 *     A broken ops wallet never blocks minting.
 */
contract AgentCardVault is Initializable, ReentrancyGuardUpgradeable, ERC721Upgradeable, VaultBaseV3 {
    using SafeERC20 for IERC20;

    uint256 public constant TOTAL_CARDS = 770_000;
    uint256 public constant TEAM_CARDS = 38_500;
    uint256 public constant USER_CARDS = 731_500;
    uint256 public constant BATCHES = 77;
    uint256 public constant BATCH_CARDS = 10_000;
    uint256 public constant TEAM_PER_BATCH = 500;
    uint256 public constant PAID_PER_BATCH = 9_500;
    uint256 public constant MINT_PRICE = 0.002 ether;
    uint256 public constant OPS_BPS = 2_000;
    uint256 public constant MARKET_FEE_BPS = 100;
    uint256 public constant SLIPPAGE_BPS = 800;
    uint256 public constant BPS = 10_000;
    uint256 public constant MAX_MINTS = 7;
    uint256 public constant ACTIVATE_EVERY = 19;
    uint256 public constant TEAM_MINT_CHUNK = 100;
    uint256 public constant MAX_LIST = 250;
    uint256 public constant MAX_UNLIST = 1_000;
    uint256 public constant MAX_BUY = 150;
    uint256 public constant MAX_SELL_TO_BID = 250;
    uint256 public constant MAX_CANCEL_BIDS = 1_000;
    uint256 private constant MAX_PAGE = 500;
    uint256 private constant MAX_SCAN_WORDS = 3_100;
    uint256 public constant OPS_PUSH_GAS = 50_000;
    uint256 public constant STALL_RELEASE = 7 days;
    uint256 public constant ACC = 1e18;
    uint8 public constant STATUS_TRADABLE = 1;
    uint8 public constant STATUS_DEX = 4;

    address public constant AGENT_ID_NFT = 0x60B9262456dE011F7d15a54CdD8c48bAaa8B022F;

    address public owner;
    address public opsWallet;
    address public teamWallet;
    IERC20 public projectToken;

    /// @dev Every BNB wei the vault has booked:
    ///      pendingTax + dividendLiability + opsOwed + bidEscrow + proceedsLiability + marketFeeOwed.
    uint256 public accountedQuote;
    /// @dev Tax waiting for the next batch close, plus rounding remainder.
    uint256 public pendingTax;
    uint256 public dividendLiability;
    uint256 public opsOwed;

    uint256 public totalTaxReceived;
    uint256 public totalDividendPaid;
    uint256 public totalOpsAccrued;
    uint256 public totalOpsPaid;

    uint256 public userMints;
    uint256 public teamMinted;
    uint256 public totalWeight;
    uint256 public accRewardPerShare;
    uint256 public repurchaseLiability;
    uint256 public unassignedBuyback;

    uint256[77] public paidInBatch;
    uint256[77] public batchInventory;
    uint256[77] public batchCredit;
    bool[77] public batchAccounted;

    mapping(address => uint256) public mintsUsed;
    mapping(uint256 => uint256) public rewardDebt;
    mapping(uint256 => bool) public redeemed;

    /// @dev Sell order. No escrow: the card stays with the seller and the listing dies on any transfer.
    struct Listing {
        address seller;
        uint96 price;
    }

    /// @dev Buy order with escrowed BNB. batchPlusOne 0 accepts any card, otherwise only batch (batchPlusOne - 1).
    struct Bid {
        address bidder;
        uint96 price;
        uint32 remaining;
        uint8 batchPlusOne;
    }

    mapping(uint256 => Listing) public listings;
    mapping(uint256 => Bid) public bids;
    uint256 public nextBidId;
    uint256 public bidEscrow;
    mapping(address => uint256) public proceedsOwed;
    uint256 public proceedsLiability;
    uint256 public marketFeeOwed;
    uint256 public totalMarketFees;

    /// @dev One bit per card id / bid id, so a reader can page through open orders without probing every id.
    mapping(uint256 => uint256) private _listedBits;
    mapping(uint256 => uint256) private _openBidBits;

    /// @dev Time of the current batch's first paid mint. Starts the stall clock.
    uint256 public batchOpenedAt;
    /// @dev Cards of the open batch burned through the stall exit. Reset when the batch closes.
    uint256 public openBatchRedeemed;

    event ProjectTokenSet(address indexed token);
    event RevenueRecognized(uint256 fresh, uint256 balance);
    event PaidMint(address indexed minter, uint256 indexed tokenId, uint256 batchId, uint256 paidIndex);
    event TeamCardMinted(uint256 indexed tokenId, address indexed to);
    event TeamActivated(uint256 indexed tokenId, uint256 indexed batchId);
    event BatchAccounted(uint256 indexed batchId, uint256 credit, uint256 inventory);
    event BuybackFilled(uint256 indexed batchId, uint256 bnbIn, uint256 tokensOut);
    event DividendIndexed(uint256 bnb, uint256 weight);
    event DividendClaimed(uint256 indexed tokenId, address indexed to, uint256 bnb);
    event Redeemed(uint256 indexed tokenId, address indexed to, uint256 repurchase, uint256 dividend);
    event OpsAccrued(uint256 bnb);
    event OpsPaid(address indexed to, uint256 bnb);
    event OpsDeferred(address indexed wallet, uint256 owed);
    event OpsWalletUpdated(address indexed previous, address indexed next);
    event OwnershipTransferred(address indexed previous, address indexed next);
    event EmergencyWithdraw(address indexed guardian, address indexed to, address indexed token, uint256 amount);
    event Listed(uint256 indexed tokenId, address indexed seller, uint256 price);
    event Unlisted(uint256 indexed tokenId, address indexed seller);
    event Sold(
        uint256 indexed tokenId, address indexed seller, address indexed buyer, uint256 price, uint256 fee, uint256 dividend
    );
    event BidPlaced(uint256 indexed bidId, address indexed bidder, uint256 price, uint256 quantity, uint256 batchPlusOne);
    event BidCancelled(uint256 indexed bidId, address indexed bidder, uint256 refund);
    event ProceedsDeferred(address indexed seller, uint256 amount);
    event ProceedsWithdrawn(address indexed seller, address indexed to, uint256 amount);
    event MarketFeesClaimed(address indexed to, uint256 amount);

    error ZeroAddress();
    error QuoteNotSupported(address quote);
    error NotOwnerOrGuardian();
    error NotGuardian();
    error NotOpsWallet();
    error TokenAlreadySet();
    error TokenNotSet();
    error AgentIdRequired();
    error MintQuotaUsed();
    error SoldOut();
    error WrongPayment(uint256 expected, uint256 sent);
    error NotCardOwner();
    error NotTeam();
    error BatchStillOpen();
    error NotActive();
    error AlreadyRedeemed();
    error NothingToClaim();
    error BuyFailed();
    error PayFailed();
    error ChunkTooLarge();
    error TeamNotUnlocked();
    error OccupiedFunds(uint256 available, uint256 requested);
    error ZeroAmount();
    error NotOwner();
    error BadOrder();
    error NotBidder();
    error BidFilled();
    error WrongBatch(uint256 tokenId);
    error NothingBought();

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(
        address owner_,
        address taxToken_,
        address quoteToken_,
        address opsWallet_,
        address teamWallet_
    ) external initializer {
        __ERC721_init("Agent Card", "ACARD");
        __ReentrancyGuard_init();
        if (quoteToken_ != address(0)) revert QuoteNotSupported(quoteToken_);
        if (opsWallet_ == address(0) || teamWallet_ == address(0)) revert ZeroAddress();
        owner = owner_ == address(0) ? msg.sender : owner_;
        opsWallet = opsWallet_;
        teamWallet = teamWallet_;
        if (taxToken_ != address(0)) {
            projectToken = IERC20(taxToken_);
            emit ProjectTokenSet(taxToken_);
        }
    }

    function vaultQuoteToken() public pure override returns (address) {
        return address(0);
    }

    receive() external payable {
        _syncRevenue();
    }

    /// @notice Book tax, distribute it if sold out or the open batch stalled for 7 days, and retry any owed ops fee.
    function sync() external nonReentrant {
        _syncRevenue();
        _foldIfDue();
        _pushOps();
    }

    /// @notice Agent-only paid mint of `count` cards in one call. Lifetime cap is 7.
    ///         Payment is exactly `MINT_PRICE * count`. Returns the last minted id.
    function mint(uint256 count) external payable nonReentrant returns (uint256 tokenId) {
        uint256 total = MINT_PRICE * count;
        if (count == 0 || msg.value != total) revert WrongPayment(total, msg.value);
        if (IERC721(AGENT_ID_NFT).balanceOf(msg.sender) == 0) revert AgentIdRequired();
        if (address(projectToken) == address(0)) revert TokenNotSet();
        uint256 used = mintsUsed[msg.sender] + count;
        if (used > MAX_MINTS) revert MintQuotaUsed();
        if (userMints + count > USER_CARDS) revert SoldOut();
        mintsUsed[msg.sender] = used;

        // Shield the payment so it is not booked as tax.
        accountedQuote += total;
        _syncRevenue();

        for (uint256 i; i < count; i++) {
            uint256 ops = (MINT_PRICE * OPS_BPS) / BPS;
            opsOwed += ops;
            totalOpsAccrued += ops;
            emit OpsAccrued(ops);

            uint256 sold = userMints;
            uint256 batchId = sold / PAID_PER_BATCH;
            uint256 got = _buy(MINT_PRICE - ops);
            batchInventory[batchId] += got;
            unassignedBuyback += got;
            emit BuybackFilled(batchId, MINT_PRICE - ops, got);

            uint256 paidIndex = paidInBatch[batchId];
            if (paidIndex == 0) batchOpenedAt = block.timestamp;
            tokenId = batchId * BATCH_CARDS + TEAM_PER_BATCH + paidIndex;
            _mint(msg.sender, tokenId);
            _addWeight(tokenId);

            uint256 nextPaid = paidIndex + 1;
            paidInBatch[batchId] = nextPaid;
            userMints = sold + 1;
            _activateTeam(batchId, paidIndex, nextPaid);
            emit PaidMint(msg.sender, tokenId, batchId, paidIndex);

            if (nextPaid == PAID_PER_BATCH) _accountBatch(batchId);
        }
        _pushOps();
    }

    /// @notice Materialize team cards to teamWallet. Only cards already activated by paid mints can be taken:
    ///         one per 19 paid cards, in the same order they activate. Reaches 38,500 at sell-out.
    function mintTeam(uint256 count) external nonReentrant {
        if (msg.sender != teamWallet) revert NotTeam();
        if (count == 0 || count > TEAM_MINT_CHUNK) revert ChunkTooLarge();
        uint256 cursor = teamMinted;
        if (cursor + count > userMints / ACTIVATE_EVERY) revert TeamNotUnlocked();
        for (uint256 i; i < count; i++) {
            uint256 tokenId = teamTokenId(cursor + i);
            _mint(teamWallet, tokenId);
            emit TeamCardMinted(tokenId, teamWallet);
        }
        teamMinted = cursor + count;
    }

    /// @notice Pull the card's unpaid BNB dividend to the holder. The card stays.
    function claim(uint256 tokenId) external nonReentrant returns (uint256 amount) {
        if (ownerOf(tokenId) != msg.sender) revert NotCardOwner();
        if (!isActive(tokenId)) revert NotActive();
        _syncRevenue();
        _foldIfDue();
        amount = _settleDividend(tokenId);
        if (amount == 0) revert NothingToClaim();
        _sendBnb(msg.sender, amount);
        emit DividendClaimed(tokenId, msg.sender, amount);
    }

    /// @notice Burn the card for its repurchase tokens. Unpaid BNB dividend is paid in the same call.
    function redeem(uint256 tokenId) external nonReentrant returns (uint256 repurchase, uint256 dividend) {
        if (ownerOf(tokenId) != msg.sender) revert NotCardOwner();
        if (redeemed[tokenId]) revert AlreadyRedeemed();
        uint256 batchId = tokenId / BATCH_CARDS;
        if (!isActive(tokenId)) revert NotActive();

        _syncRevenue();
        _foldIfDue();
        dividend = _settleDividend(tokenId);
        totalWeight -= 1;
        redeemed[tokenId] = true;
        if (batchAccounted[batchId]) {
            repurchase = batchCredit[batchId];
            repurchaseLiability -= repurchase;
        } else {
            if (block.timestamp < batchOpenedAt + STALL_RELEASE) revert BatchStillOpen();
            repurchase = _openShare(batchId);
            batchInventory[batchId] -= repurchase;
            unassignedBuyback -= repurchase;
            openBatchRedeemed += 1;
        }
        _burn(tokenId);

        if (repurchase > 0) projectToken.safeTransfer(msg.sender, repurchase);
        if (dividend > 0) _sendBnb(msg.sender, dividend);
        emit Redeemed(tokenId, msg.sender, repurchase, dividend);
    }

    /// @notice opsWallet pulls a deferred ops fee to any address.
    function claimOps(address to) external nonReentrant returns (uint256 amount) {
        if (msg.sender != opsWallet) revert NotOpsWallet();
        if (to == address(0)) revert ZeroAddress();
        amount = opsOwed;
        if (amount == 0) revert NothingToClaim();
        opsOwed = 0;
        accountedQuote -= amount;
        totalOpsPaid += amount;
        (bool ok,) = to.call{value: amount}("");
        if (!ok) revert PayFailed();
        emit OpsPaid(to, amount);
    }

    // ---------------------------------------------------------------- market

    /// @notice List or reprice up to 250 of your cards. The cards stay in your wallet and keep earning.
    function list(uint256[] calldata tokenIds, uint256[] calldata prices) external nonReentrant {
        uint256 n = tokenIds.length;
        if (n == 0 || n > MAX_LIST || n != prices.length) revert BadOrder();
        for (uint256 i; i < n; i++) {
            uint256 id = tokenIds[i];
            uint256 price = prices[i];
            if (_ownerOf(id) != msg.sender) revert NotCardOwner();
            if (price == 0 || price > type(uint96).max) revert BadOrder();
            listings[id] = Listing(msg.sender, uint96(price));
            _markListed(id);
            emit Listed(id, msg.sender, price);
        }
    }

    /// @notice Take down up to 1,000 of your listings.
    function unlist(uint256[] calldata tokenIds) external nonReentrant {
        uint256 n = tokenIds.length;
        if (n == 0 || n > MAX_UNLIST) revert BadOrder();
        for (uint256 i; i < n; i++) {
            uint256 id = tokenIds[i];
            if (listings[id].seller != msg.sender) revert NotCardOwner();
            delete listings[id];
            _clearListed(id);
            emit Unlisted(id, msg.sender);
        }
    }

    /// @notice Buy up to 150 listed cards. A card is skipped if its listing is gone or now costs more than
    ///         `maxPrices[i]`. Unspent BNB is refunded. Each seller also receives the card's unclaimed dividend.
    function buy(uint256[] calldata tokenIds, uint256[] calldata maxPrices)
        external
        payable
        nonReentrant
        returns (uint256 bought)
    {
        uint256 n = tokenIds.length;
        if (n == 0 || n > MAX_BUY || n != maxPrices.length) revert BadOrder();
        accountedQuote += msg.value;
        _syncRevenue();
        _foldIfDue();

        uint256 spent;
        for (uint256 i; i < n; i++) {
            uint256 id = tokenIds[i];
            Listing memory l = listings[id];
            if (l.seller == address(0) || l.seller == msg.sender || l.price > maxPrices[i]) continue;
            if (_ownerOf(id) != l.seller) continue;
            spent += l.price;
            if (spent > msg.value) revert WrongPayment(spent, msg.value);
            _payOrCredit(l.seller, _settleSale(id, l.seller, msg.sender, l.price));
            bought++;
        }
        if (bought == 0) revert NothingBought();
        if (msg.value > spent) _sendBnb(msg.sender, msg.value - spent);
    }

    /// @notice Escrow BNB to buy `quantity` cards at `price` each. `batchPlusOne` 0 accepts any card,
    ///         otherwise only cards of batch (batchPlusOne - 1).
    function placeBid(uint256 price, uint256 quantity, uint256 batchPlusOne)
        external
        payable
        nonReentrant
        returns (uint256 bidId)
    {
        if (price == 0 || price > type(uint96).max || quantity == 0 || quantity > type(uint32).max) revert BadOrder();
        if (batchPlusOne > BATCHES) revert BadOrder();
        uint256 total = price * quantity;
        if (msg.value != total) revert WrongPayment(total, msg.value);
        accountedQuote += total;
        bidEscrow += total;
        bidId = nextBidId++;
        bids[bidId] = Bid(msg.sender, uint96(price), uint32(quantity), uint8(batchPlusOne));
        _openBidBits[bidId >> 8] |= 1 << (bidId & 255);
        emit BidPlaced(bidId, msg.sender, price, quantity, batchPlusOne);
    }

    /// @notice Cancel up to 1,000 of your bids and get the unfilled BNB back.
    function cancelBids(uint256[] calldata bidIds) external nonReentrant returns (uint256 refund) {
        uint256 n = bidIds.length;
        if (n == 0 || n > MAX_CANCEL_BIDS) revert BadOrder();
        for (uint256 i; i < n; i++) {
            Bid storage b = bids[bidIds[i]];
            if (b.bidder != msg.sender) revert NotBidder();
            uint256 r = uint256(b.price) * b.remaining;
            if (r > 0) _closeBid(bidIds[i]);
            b.remaining = 0;
            refund += r;
            emit BidCancelled(bidIds[i], msg.sender, r);
        }
        if (refund == 0) revert NothingToClaim();
        bidEscrow -= refund;
        _sendBnb(msg.sender, refund);
    }

    /// @notice Sell up to 250 of your cards into one bid. You receive the price minus 1%, plus each card's
    ///         unclaimed dividend.
    function sellToBid(uint256 bidId, uint256[] calldata tokenIds) external nonReentrant returns (uint256 received) {
        uint256 n = tokenIds.length;
        if (n == 0 || n > MAX_SELL_TO_BID) revert BadOrder();
        Bid storage b = bids[bidId];
        address bidder = b.bidder;
        if (bidder == address(0) || bidder == msg.sender) revert BadOrder();
        if (b.remaining < n) revert BidFilled();
        uint256 price = b.price;
        uint256 batchPlusOne = b.batchPlusOne;
        b.remaining -= uint32(n);
        if (b.remaining == 0) _closeBid(bidId);
        bidEscrow -= price * n;
        _syncRevenue();
        _foldIfDue();

        for (uint256 i; i < n; i++) {
            uint256 id = tokenIds[i];
            if (_ownerOf(id) != msg.sender) revert NotCardOwner();
            if (batchPlusOne != 0 && id / BATCH_CARDS != batchPlusOne - 1) revert WrongBatch(id);
            received += _settleSale(id, msg.sender, bidder, price);
        }
        _sendBnb(msg.sender, received);
    }

    /// @notice Withdraw sale proceeds that could not be pushed to you.
    function withdrawProceeds(address to) external nonReentrant returns (uint256 amount) {
        if (to == address(0)) revert ZeroAddress();
        amount = proceedsOwed[msg.sender];
        if (amount == 0) revert NothingToClaim();
        proceedsOwed[msg.sender] = 0;
        proceedsLiability -= amount;
        _sendBnb(to, amount);
        emit ProceedsWithdrawn(msg.sender, to, amount);
    }

    /// @notice Owner (dev) collects the 1% market fee.
    function claimMarketFees(address to) external nonReentrant returns (uint256 amount) {
        if (msg.sender != owner) revert NotOwner();
        if (to == address(0)) revert ZeroAddress();
        amount = marketFeeOwed;
        if (amount == 0) revert NothingToClaim();
        marketFeeOwed = 0;
        _sendBnb(to, amount);
        emit MarketFeesClaimed(to, amount);
    }

    // ---------------------------------------------------------------- views

    function mintPrice() public pure returns (uint256) {
        return MINT_PRICE;
    }

    /// @notice Open sell orders in token-id order. Start with `cursor = 0` and pass `next` back until
    ///         `next == TOTAL_CARDS`. `limit` is capped at MAX_PAGE; 0 means MAX_PAGE.
    function getActiveListings(uint256 cursor, uint256 limit)
        external
        view
        returns (uint256[] memory tokenIds, Listing[] memory orders, uint256 next)
    {
        (tokenIds, next) = _scan(_listedBits, cursor, TOTAL_CARDS, limit);
        orders = new Listing[](tokenIds.length);
        for (uint256 i; i < tokenIds.length; i++) orders[i] = listings[tokenIds[i]];
    }

    /// @notice Open buy orders in bid-id order. Start with `cursor = 0` and pass `next` back until
    ///         `next == nextBidId`. `limit` is capped at MAX_PAGE; 0 means MAX_PAGE.
    function getActiveBids(uint256 cursor, uint256 limit)
        external
        view
        returns (uint256[] memory bidIds, Bid[] memory orders, uint256 next)
    {
        (bidIds, next) = _scan(_openBidBits, cursor, nextBidId, limit);
        orders = new Bid[](bidIds.length);
        for (uint256 i; i < bidIds.length; i++) orders[i] = bids[bidIds[i]];
    }

    function hasAgentId(address who) public view returns (bool) {
        return IERC721(AGENT_ID_NFT).balanceOf(who) > 0;
    }

    function teamTokenId(uint256 ordinal) public pure returns (uint256) {
        return (ordinal / TEAM_PER_BATCH) * BATCH_CARDS + (ordinal % TEAM_PER_BATCH);
    }

    function isTeamCard(uint256 tokenId) public pure returns (bool) {
        return tokenId < TOTAL_CARDS && tokenId % BATCH_CARDS < TEAM_PER_BATCH;
    }

    function isActive(uint256 tokenId) public view returns (bool) {
        if (tokenId >= TOTAL_CARDS || redeemed[tokenId]) return false;
        uint256 batchId = tokenId / BATCH_CARDS;
        uint256 index = tokenId % BATCH_CARDS;
        if (index >= TEAM_PER_BATCH) return _ownerOf(tokenId) != address(0);
        return index < paidInBatch[batchId] / ACTIVATE_EVERY;
    }

    /// @notice Distributed, unclaimed BNB dividend on a card.
    function pendingDividend(uint256 tokenId) public view returns (uint256) {
        if (!isActive(tokenId)) return 0;
        return (accRewardPerShare - rewardDebt[tokenId]) / ACC;
    }

    /// @notice BNB tax waiting for the next batch close, including tax not yet booked.
    function undistributedTax() public view returns (uint256) {
        uint256 bal = address(this).balance;
        uint256 acc = accountedQuote;
        return pendingTax + (bal > acc ? bal - acc : 0);
    }

    /// @notice Tokens a burn returns now. An open batch pays its running average only after the 7-day stall.
    function repurchaseOf(uint256 tokenId) public view returns (uint256) {
        if (!isActive(tokenId)) return 0;
        uint256 batchId = tokenId / BATCH_CARDS;
        if (batchAccounted[batchId]) return batchCredit[batchId];
        if (block.timestamp < batchOpenedAt + STALL_RELEASE) return 0;
        return _openShare(batchId);
    }

    function description() public pure override returns (string memory) {
        return "Agent cards with batch buyback and BNB tax dividend";
    }

    function vaultUISchema() public pure override returns (VaultUISchema memory schema) {
        schema.vaultType = "AgentCardVault";
        schema.description = "Agent cards with BNB tax dividend";
        schema.methods = new VaultMethodSchema[](4);
        schema.methods[0].name = "mint";
        schema.methods[0].description = "mint(count), 0.002 BNB each";
        schema.methods[0].isWriteMethod = true;
        schema.methods[1].name = "claim";
        schema.methods[1].description = "Claim a card's BNB dividend";
        schema.methods[1].inputs = new FieldDescriptor[](1);
        schema.methods[1].inputs[0] = FieldDescriptor("tokenId", "uint256", "Card id", 0);
        schema.methods[1].isWriteMethod = true;
        schema.methods[2].name = "redeem";
        schema.methods[2].description = "Burn a card for tokens and BNB";
        schema.methods[2].inputs = new FieldDescriptor[](1);
        schema.methods[2].inputs[0] = FieldDescriptor("tokenId", "uint256", "Card id", 0);
        schema.methods[2].isWriteMethod = true;
        schema.methods[3].name = "sync";
        schema.methods[3].description = "Book and split tax";
        schema.methods[3].isWriteMethod = true;
    }

    // ---------------------------------------------------------------- owner

    function setToken(address token) external {
        if (msg.sender != owner && msg.sender != _getGuardian()) revert NotOwnerOrGuardian();
        if (token == address(0)) revert ZeroAddress();
        if (address(projectToken) != address(0)) revert TokenAlreadySet();
        projectToken = IERC20(token);
        emit ProjectTokenSet(token);
    }

    function setOpsWallet(address next) external {
        if (msg.sender != owner && msg.sender != _getGuardian()) revert NotOwnerOrGuardian();
        if (next == address(0)) revert ZeroAddress();
        address prev = opsWallet;
        opsWallet = next;
        emit OpsWalletUpdated(prev, next);
    }

    function transferOwnership(address next) external {
        if (msg.sender != owner && msg.sender != _getGuardian()) revert NotOwnerOrGuardian();
        if (next == address(0)) revert ZeroAddress();
        address prev = owner;
        owner = next;
        emit OwnershipTransferred(prev, next);
    }

    /// @notice Guardian may only take BNB the vault has not booked.
    function emergencyWithdrawNative(address to, uint256 amount) external nonReentrant {
        if (msg.sender != _getGuardian()) revert NotGuardian();
        if (to == address(0)) revert ZeroAddress();
        if (amount == 0) revert ZeroAmount();
        _syncRevenue();
        uint256 bal = address(this).balance;
        uint256 reserved = accountedQuote;
        uint256 free = bal > reserved ? bal - reserved : 0;
        if (amount > free) revert OccupiedFunds(free, amount);
        (bool ok,) = to.call{value: amount}("");
        if (!ok) revert PayFailed();
        emit EmergencyWithdraw(msg.sender, to, address(0), amount);
    }

    /// @notice Guardian may only take project tokens not owed to cards.
    function emergencyWithdrawToken(address token, address to, uint256 amount) external nonReentrant {
        if (msg.sender != _getGuardian()) revert NotGuardian();
        if (to == address(0) || token == address(0)) revert ZeroAddress();
        if (amount == 0) revert ZeroAmount();
        uint256 reserved = token == address(projectToken) ? unassignedBuyback + repurchaseLiability : 0;
        uint256 bal = IERC20(token).balanceOf(address(this));
        uint256 free = bal > reserved ? bal - reserved : 0;
        if (amount > free) revert OccupiedFunds(free, amount);
        IERC20(token).safeTransfer(to, amount);
        emit EmergencyWithdraw(msg.sender, to, token, amount);
    }

    // ---------------------------------------------------------------- internals

    function _syncRevenue() private {
        uint256 bal = address(this).balance;
        uint256 acc = accountedQuote;
        if (bal <= acc) return;
        uint256 fresh = bal - acc;
        accountedQuote = bal;
        pendingTax += fresh;
        totalTaxReceived += fresh;
        emit RevenueRecognized(fresh, bal);
    }

    /// @dev Sold out: split as it arrives. A batch open for STALL_RELEASE without filling: split what is
    ///      waiting over the active cards, so tax never stays locked. Zero weight before sell-out keeps waiting.
    function _foldIfDue() private {
        if (userMints >= USER_CARDS || (totalWeight != 0 && block.timestamp >= batchOpenedAt + STALL_RELEASE)) {
            _fold();
        }
    }

    /// @dev Distribute pending tax over active cards. A batch close always leaves 10,000 active cards,
    ///      so zero weight is only reachable after sell-out, when the tax goes to ops.
    function _fold() private {
        uint256 tax = pendingTax;
        if (tax == 0) return;
        uint256 weight = totalWeight;
        if (weight == 0) {
            pendingTax = 0;
            opsOwed += tax;
            totalOpsAccrued += tax;
            emit OpsAccrued(tax);
            return;
        }
        uint256 share = (tax * ACC) / weight;
        if (share == 0) return;
        accRewardPerShare += share;
        // Round up: the index has already promised share * weight / ACC. Booking the floor would leave
        // that fraction in pending and index it again on the next fold. share * weight <= tax * ACC.
        uint256 used = (share * weight + ACC - 1) / ACC;
        pendingTax = tax - used;
        dividendLiability += used;
        emit DividendIndexed(used, weight);
    }

    function _addWeight(uint256 tokenId) private {
        rewardDebt[tokenId] = accRewardPerShare;
        totalWeight += 1;
    }

    function _activateTeam(uint256 batchId, uint256 paidBefore, uint256 paidAfter) private {
        uint256 openedBefore = paidBefore / ACTIVATE_EVERY;
        uint256 openedAfter = paidAfter / ACTIVATE_EVERY;
        if (openedAfter <= openedBefore) return;
        uint256 tokenId = batchId * BATCH_CARDS + (openedAfter - 1);
        _addWeight(tokenId);
        emit TeamActivated(tokenId, batchId);
    }

    /// @dev Open batch average: its tokens over its active cards (paid + unlocked team, minus stall burns).
    function _openShare(uint256 batchId) private view returns (uint256) {
        uint256 paid = paidInBatch[batchId];
        return batchInventory[batchId] / (paid + paid / ACTIVATE_EVERY - openBatchRedeemed);
    }

    function _accountBatch(uint256 batchId) private {
        uint256 tokens = batchInventory[batchId];
        uint256 cards = BATCH_CARDS - openBatchRedeemed;
        uint256 credit = tokens / cards;
        openBatchRedeemed = 0;
        batchInventory[batchId] = 0;
        batchCredit[batchId] = credit;
        batchAccounted[batchId] = true;
        unassignedBuyback -= tokens;
        repurchaseLiability += credit * cards;
        emit BatchAccounted(batchId, credit, tokens);
        _fold();
    }

    /// @dev Moves the card's dividend out of dividendLiability. The BNB stays booked until the caller pays it.
    function _settleDividend(uint256 tokenId) private returns (uint256 amount) {
        uint256 acc = accRewardPerShare;
        amount = (acc - rewardDebt[tokenId]) / ACC;
        rewardDebt[tokenId] = acc;
        dividendLiability -= amount;
        totalDividendPaid += amount;
    }

    function _buy(uint256 amountIn) private returns (uint256 got) {
        uint8 status = _status();
        if (status != STATUS_TRADABLE && status != STATUS_DEX) revert BuyFailed();
        uint256 minOut = (_preview(amountIn) * (BPS - SLIPPAGE_BPS)) / BPS;
        if (minOut == 0) revert BuyFailed();
        accountedQuote -= amountIn;
        uint256 beforeBal = projectToken.balanceOf(address(this));
        ICardPortal.ExactInputParams memory params = ICardPortal.ExactInputParams({
            inputToken: address(0),
            outputToken: address(projectToken),
            inputAmount: amountIn,
            minOutputAmount: minOut,
            permitData: ""
        });
        try ICardPortal(_getPortal()).swapExactInput{value: amountIn}(params) returns (uint256) {}
        catch {
            revert BuyFailed();
        }
        got = projectToken.balanceOf(address(this)) - beforeBal;
        if (got == 0) revert BuyFailed();
    }

    function _preview(uint256 amountIn) private returns (uint256) {
        try ICardPortal(_getPortal()).quoteExactInput(
            ICardPortal.QuoteExactInputParams(address(0), address(projectToken), amountIn)
        ) returns (uint256 out) {
            return out;
        } catch {
            return 0;
        }
    }

    function _status() private view returns (uint8 status) {
        (bool ok, bytes memory data) = _getPortal().staticcall(
            abi.encodeWithSelector(bytes4(keccak256("getTokenV8Safe(address)")), address(projectToken))
        );
        if (!ok || data.length < 32) return 0;
        status = uint8(abi.decode(data, (uint256)));
    }

    /// @dev Gas-capped push without copying return data. A failed push stays owed.
    function _pushOps() private {
        uint256 amount = opsOwed;
        if (amount == 0) return;
        address to = opsWallet;
        opsOwed = 0;
        accountedQuote -= amount;
        uint256 gasCap = OPS_PUSH_GAS;
        bool ok;
        assembly {
            ok := call(gasCap, to, amount, 0, 0, 0, 0)
        }
        if (ok) {
            totalOpsPaid += amount;
            emit OpsPaid(to, amount);
        } else {
            opsOwed = amount;
            accountedQuote += amount;
            emit OpsDeferred(to, amount);
        }
    }

    /// @dev Pays booked BNB to the caller's chosen address. A rejecting receiver only blocks its own call.
    function _sendBnb(address to, uint256 amount) private {
        accountedQuote -= amount;
        (bool ok,) = to.call{value: amount}("");
        if (!ok) revert PayFailed();
    }

    /// @dev Pays booked BNB to a third party (a seller) with a gas cap. On failure it is kept as proceeds.
    function _payOrCredit(address to, uint256 amount) private {
        if (amount == 0) return;
        accountedQuote -= amount;
        uint256 gasCap = OPS_PUSH_GAS;
        bool ok;
        assembly {
            ok := call(gasCap, to, amount, 0, 0, 0, 0)
        }
        if (!ok) {
            accountedQuote += amount;
            proceedsOwed[to] += amount;
            proceedsLiability += amount;
            emit ProceedsDeferred(to, amount);
        }
    }

    /// @dev Moves a sold card. `price` is already booked BNB. Returns what the seller is owed:
    ///      price minus the 1% fee, plus the card's distributed dividend.
    function _settleSale(uint256 tokenId, address seller, address buyer, uint256 price)
        private
        returns (uint256 toSeller)
    {
        uint256 fee = (price * MARKET_FEE_BPS) / BPS;
        marketFeeOwed += fee;
        totalMarketFees += fee;
        uint256 dividend = isActive(tokenId) ? _settleDividend(tokenId) : 0;
        _transfer(seller, buyer, tokenId);
        toSeller = price - fee + dividend;
        emit Sold(tokenId, seller, buyer, price, fee, dividend);
    }

    /// @dev Any transfer or burn cancels the card's sell order.
    function _update(address to, uint256 tokenId, address auth) internal override returns (address from) {
        from = super._update(to, tokenId, auth);
        if (listings[tokenId].seller != address(0)) {
            delete listings[tokenId];
            _clearListed(tokenId);
        }
    }

    function _markListed(uint256 tokenId) private {
        _listedBits[tokenId >> 8] |= 1 << (tokenId & 255);
    }

    function _clearListed(uint256 tokenId) private {
        _listedBits[tokenId >> 8] &= ~(1 << (tokenId & 255));
    }

    function _closeBid(uint256 bidId) private {
        _openBidBits[bidId >> 8] &= ~(1 << (bidId & 255));
    }

    /// @dev Collects set bits from `cursor` up to `end`, at most `limit` ids and MAX_SCAN_WORDS words.
    ///      `next` is where the following page starts; the scan is finished when `next == end`.
    function _scan(mapping(uint256 => uint256) storage bitmap, uint256 cursor, uint256 end, uint256 limit)
        private
        view
        returns (uint256[] memory ids, uint256 next)
    {
        if (limit == 0 || limit > MAX_PAGE) limit = MAX_PAGE;
        ids = new uint256[](limit);
        uint256 n;
        uint256 scanned;
        while (cursor < end && n < limit && scanned < MAX_SCAN_WORDS) {
            uint256 word = cursor >> 8;
            uint256 bits = bitmap[word] >> (cursor & 255);
            while (bits != 0 && n < limit) {
                if (bits & 1 == 1) ids[n++] = cursor;
                bits >>= 1;
                cursor += 1;
            }
            if (bits == 0) cursor = (word + 1) << 8;
            scanned += 1;
        }
        next = cursor < end ? cursor : end;
        assembly {
            mstore(ids, n)
        }
    }
}

// src/AgentCardBeaconFactory.sol

/// @notice Beacon factory for AgentCardVault. Does not touch the FOMO countdown contracts.
///         Launch is dual-gated: msg.sender is VaultPortal, creator is devAddress.
///         vaultData is abi.encode(opsWallet, teamWallet). A zero address falls back to creator.
contract AgentCardBeaconFactory is VaultFactoryBaseV2 {
    address public immutable devAddress;
    address public immutable beacon;

    address[] public allVaults;
    mapping(address => address) public vaultOf;

    event VaultCreated(
        address indexed vault,
        address indexed taxToken,
        address indexed creator,
        address quoteToken,
        address opsWallet,
        address teamWallet
    );
    event VaultImplementationUpgraded(address indexed previousImplementation, address indexed newImplementation);
    event VaultUpgradesLocked(address indexed beacon);

    error NotAuthorizedDev(address creator);
    error ZeroDev();
    error OnlyGuardian();

    constructor(address _devAddress) {
        if (_devAddress == address(0)) revert ZeroDev();
        devAddress = _devAddress;
        AgentCardVault impl = new AgentCardVault();
        beacon = address(new UpgradeableBeacon(address(impl), address(this)));
    }

    function newVault(address taxToken, address quoteToken, address creator, bytes calldata vaultData)
        external
        override
        returns (address vault)
    {
        if (msg.sender != _getVaultPortal()) revert OnlyVaultPortal();
        if (creator != devAddress) revert NotAuthorizedDev(creator);

        address opsWallet = creator;
        address teamWallet = creator;
        if (vaultData.length >= 64) {
            (opsWallet, teamWallet) = abi.decode(vaultData, (address, address));
        } else if (vaultData.length >= 32) {
            opsWallet = abi.decode(vaultData, (address));
        }
        if (opsWallet == address(0)) opsWallet = creator;
        if (teamWallet == address(0)) teamWallet = creator;

        vault = address(
            new BeaconProxy(
                beacon,
                abi.encodeCall(AgentCardVault.initialize, (creator, taxToken, quoteToken, opsWallet, teamWallet))
            )
        );
        allVaults.push(vault);
        if (taxToken != address(0)) vaultOf[taxToken] = vault;
        emit VaultCreated(vault, taxToken, creator, quoteToken, opsWallet, teamWallet);
    }

    function upgradeVaultImplementation(address newImplementation) external {
        if (msg.sender != _getGuardian()) revert OnlyGuardian();
        address prev = UpgradeableBeacon(beacon).implementation();
        UpgradeableBeacon(beacon).upgradeTo(newImplementation);
        emit VaultImplementationUpgraded(prev, newImplementation);
    }

    function lockVaultUpgrades() external {
        if (msg.sender != _getGuardian()) revert OnlyGuardian();
        UpgradeableBeacon(beacon).renounceOwnership();
        emit VaultUpgradesLocked(beacon);
    }

    function isVaultUpgradesLocked() external view returns (bool) {
        return UpgradeableBeacon(beacon).owner() == address(0);
    }

    function beaconImplementation() external view returns (address) {
        return UpgradeableBeacon(beacon).implementation();
    }

    /// @notice BNB only. The mint price and the tax dividend are both in BNB.
    function isQuoteTokenSupported(address quoteToken) external pure override returns (bool) {
        return quoteToken == address(0);
    }

    function factorySpecVersion() public pure override returns (string memory) {
        return "v2.3";
    }

    function vaultCount() external view returns (uint256) {
        return allVaults.length;
    }

    function _validateBeforeLaunch(IVaultFactoryValidationV2.LaunchValidationDataV1 memory)
        internal
        pure
        override
        returns (bool success, string memory reason)
    {
        return (true, "");
    }

    function vaultDataSchema() public pure override returns (VaultDataSchema memory schema) {
        schema.description = "Beacon-proxied Agent card vault (VaultBaseV3 / factory v2.3). BNB quote only. "
            "731,500 paid cards at 0.002 BNB, lifetime 7 per Agent. "
            "38,500 team cards, 500 in each batch of 10,000, same repurchase credit and dividend weight. "
            "20% of each mint goes to opsWallet. Trading tax is paid in BNB, split per active card at each batch close. "
            "Built-in card market with sell and buy orders; 1% of each fill goes to the creator.";
        schema.fields = new FieldDescriptor[](2);
        schema.fields[0] = FieldDescriptor("opsWallet", "address", "Receives 20% of each paid mint. 0 defaults to creator.", 0);
        schema.fields[1] =
            FieldDescriptor("teamWallet", "address", "Receives the 38,500 reserved cards. 0 defaults to creator.", 0);
        schema.isArray = false;
    }
}

