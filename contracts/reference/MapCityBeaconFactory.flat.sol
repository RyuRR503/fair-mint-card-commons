// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

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
            /// @solidity memory-safe-assembly
            assembly {
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

// src/flap/IFlapTriggerService.sol

interface IFlapTriggerService {
    function getFee() external view returns (uint256 gasFee);
    function getMaxCallbackGas() external view returns (uint256 maxGas);
    function requestTrigger(uint64 executeAfter) external payable returns (uint256 requestId);
}

interface ITriggerReceiver {
    function trigger(uint256 requestId) external;
}

// src/flap/IFlapVaultEx.sol

/// @title IFlapVaultEx
/// @notice Async exact-input swap intents. Output is verified by balance delta.
interface IFlapVaultEx {
    enum RequestStatus {
        NONE,
        PENDING,
        FULFILLED,
        REFUNDED,
        FAILED
    }

    struct ExactInputParams {
        address inputToken;
        address outputToken;
        uint256 inputAmount;
    }

    struct SwapRequestView {
        uint256 requestId;
        address consumer;
        address inputToken;
        address outputToken;
        uint256 inputAmount;
        uint256 swapInputAmount;
        bool feeInInput;
        uint64 feeBps;
        uint64 createdAt;
        RequestStatus status;
    }

    function requestSwap(ExactInputParams calldata params) external payable returns (uint256 requestId);
    function getRequest(uint256 requestId) external view returns (SwapRequestView memory);
    function maxCallbackGas() external view returns (uint256);
    function isQuoteToken(address token) external view returns (bool);
    function isTokenBlocked(address token) external view returns (bool);
    function feeConfig() external view returns (uint256 feeBps, address feeReceiver);
}

interface IFlapVaultExConsumer {
    /// @param status RequestStatus.FULFILLED (2) or RequestStatus.REFUNDED (3).
    function onFlapVaultExSettled(uint256 requestId, uint8 status, address token, uint256 amount) external;
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

// lib/openzeppelin-contracts/contracts/proxy/Proxy.sol

// OpenZeppelin Contracts (last updated v5.0.0) (proxy/Proxy.sol)


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

// lib/openzeppelin-contracts/contracts/utils/math/SafeCast.sol

// OpenZeppelin Contracts (last updated v5.0.0) (utils/math/SafeCast.sol)
// This file was procedurally generated from scripts/generate/templates/SafeCast.js.

/**
 * @dev Wrappers over Solidity's uintXX/intXX casting operators with added overflow
 * checks.
 *
 * Downcasting from uint256/int256 in Solidity does not revert on overflow. This can
 * easily result in undesired exploitation or bugs, since developers usually
 * assume that overflows raise errors. `SafeCast` restores this intuition by
 * reverting the transaction when such an operation overflows.
 *
 * Using this library instead of the unchecked operations eliminates an entire
 * class of bugs, so it's recommended to use it always.
 */
library SafeCast {
    /**
     * @dev Value doesn't fit in an uint of `bits` size.
     */
    error SafeCastOverflowedUintDowncast(uint8 bits, uint256 value);

    /**
     * @dev An int value doesn't fit in an uint of `bits` size.
     */
    error SafeCastOverflowedIntToUint(int256 value);

    /**
     * @dev Value doesn't fit in an int of `bits` size.
     */
    error SafeCastOverflowedIntDowncast(uint8 bits, int256 value);

    /**
     * @dev An uint value doesn't fit in an int of `bits` size.
     */
    error SafeCastOverflowedUintToInt(uint256 value);

    /**
     * @dev Returns the downcasted uint248 from uint256, reverting on
     * overflow (when the input is greater than largest uint248).
     *
     * Counterpart to Solidity's `uint248` operator.
     *
     * Requirements:
     *
     * - input must fit into 248 bits
     */
    function toUint248(uint256 value) internal pure returns (uint248) {
        if (value > type(uint248).max) {
            revert SafeCastOverflowedUintDowncast(248, value);
        }
        return uint248(value);
    }

    /**
     * @dev Returns the downcasted uint240 from uint256, reverting on
     * overflow (when the input is greater than largest uint240).
     *
     * Counterpart to Solidity's `uint240` operator.
     *
     * Requirements:
     *
     * - input must fit into 240 bits
     */
    function toUint240(uint256 value) internal pure returns (uint240) {
        if (value > type(uint240).max) {
            revert SafeCastOverflowedUintDowncast(240, value);
        }
        return uint240(value);
    }

    /**
     * @dev Returns the downcasted uint232 from uint256, reverting on
     * overflow (when the input is greater than largest uint232).
     *
     * Counterpart to Solidity's `uint232` operator.
     *
     * Requirements:
     *
     * - input must fit into 232 bits
     */
    function toUint232(uint256 value) internal pure returns (uint232) {
        if (value > type(uint232).max) {
            revert SafeCastOverflowedUintDowncast(232, value);
        }
        return uint232(value);
    }

    /**
     * @dev Returns the downcasted uint224 from uint256, reverting on
     * overflow (when the input is greater than largest uint224).
     *
     * Counterpart to Solidity's `uint224` operator.
     *
     * Requirements:
     *
     * - input must fit into 224 bits
     */
    function toUint224(uint256 value) internal pure returns (uint224) {
        if (value > type(uint224).max) {
            revert SafeCastOverflowedUintDowncast(224, value);
        }
        return uint224(value);
    }

    /**
     * @dev Returns the downcasted uint216 from uint256, reverting on
     * overflow (when the input is greater than largest uint216).
     *
     * Counterpart to Solidity's `uint216` operator.
     *
     * Requirements:
     *
     * - input must fit into 216 bits
     */
    function toUint216(uint256 value) internal pure returns (uint216) {
        if (value > type(uint216).max) {
            revert SafeCastOverflowedUintDowncast(216, value);
        }
        return uint216(value);
    }

    /**
     * @dev Returns the downcasted uint208 from uint256, reverting on
     * overflow (when the input is greater than largest uint208).
     *
     * Counterpart to Solidity's `uint208` operator.
     *
     * Requirements:
     *
     * - input must fit into 208 bits
     */
    function toUint208(uint256 value) internal pure returns (uint208) {
        if (value > type(uint208).max) {
            revert SafeCastOverflowedUintDowncast(208, value);
        }
        return uint208(value);
    }

    /**
     * @dev Returns the downcasted uint200 from uint256, reverting on
     * overflow (when the input is greater than largest uint200).
     *
     * Counterpart to Solidity's `uint200` operator.
     *
     * Requirements:
     *
     * - input must fit into 200 bits
     */
    function toUint200(uint256 value) internal pure returns (uint200) {
        if (value > type(uint200).max) {
            revert SafeCastOverflowedUintDowncast(200, value);
        }
        return uint200(value);
    }

    /**
     * @dev Returns the downcasted uint192 from uint256, reverting on
     * overflow (when the input is greater than largest uint192).
     *
     * Counterpart to Solidity's `uint192` operator.
     *
     * Requirements:
     *
     * - input must fit into 192 bits
     */
    function toUint192(uint256 value) internal pure returns (uint192) {
        if (value > type(uint192).max) {
            revert SafeCastOverflowedUintDowncast(192, value);
        }
        return uint192(value);
    }

    /**
     * @dev Returns the downcasted uint184 from uint256, reverting on
     * overflow (when the input is greater than largest uint184).
     *
     * Counterpart to Solidity's `uint184` operator.
     *
     * Requirements:
     *
     * - input must fit into 184 bits
     */
    function toUint184(uint256 value) internal pure returns (uint184) {
        if (value > type(uint184).max) {
            revert SafeCastOverflowedUintDowncast(184, value);
        }
        return uint184(value);
    }

    /**
     * @dev Returns the downcasted uint176 from uint256, reverting on
     * overflow (when the input is greater than largest uint176).
     *
     * Counterpart to Solidity's `uint176` operator.
     *
     * Requirements:
     *
     * - input must fit into 176 bits
     */
    function toUint176(uint256 value) internal pure returns (uint176) {
        if (value > type(uint176).max) {
            revert SafeCastOverflowedUintDowncast(176, value);
        }
        return uint176(value);
    }

    /**
     * @dev Returns the downcasted uint168 from uint256, reverting on
     * overflow (when the input is greater than largest uint168).
     *
     * Counterpart to Solidity's `uint168` operator.
     *
     * Requirements:
     *
     * - input must fit into 168 bits
     */
    function toUint168(uint256 value) internal pure returns (uint168) {
        if (value > type(uint168).max) {
            revert SafeCastOverflowedUintDowncast(168, value);
        }
        return uint168(value);
    }

    /**
     * @dev Returns the downcasted uint160 from uint256, reverting on
     * overflow (when the input is greater than largest uint160).
     *
     * Counterpart to Solidity's `uint160` operator.
     *
     * Requirements:
     *
     * - input must fit into 160 bits
     */
    function toUint160(uint256 value) internal pure returns (uint160) {
        if (value > type(uint160).max) {
            revert SafeCastOverflowedUintDowncast(160, value);
        }
        return uint160(value);
    }

    /**
     * @dev Returns the downcasted uint152 from uint256, reverting on
     * overflow (when the input is greater than largest uint152).
     *
     * Counterpart to Solidity's `uint152` operator.
     *
     * Requirements:
     *
     * - input must fit into 152 bits
     */
    function toUint152(uint256 value) internal pure returns (uint152) {
        if (value > type(uint152).max) {
            revert SafeCastOverflowedUintDowncast(152, value);
        }
        return uint152(value);
    }

    /**
     * @dev Returns the downcasted uint144 from uint256, reverting on
     * overflow (when the input is greater than largest uint144).
     *
     * Counterpart to Solidity's `uint144` operator.
     *
     * Requirements:
     *
     * - input must fit into 144 bits
     */
    function toUint144(uint256 value) internal pure returns (uint144) {
        if (value > type(uint144).max) {
            revert SafeCastOverflowedUintDowncast(144, value);
        }
        return uint144(value);
    }

    /**
     * @dev Returns the downcasted uint136 from uint256, reverting on
     * overflow (when the input is greater than largest uint136).
     *
     * Counterpart to Solidity's `uint136` operator.
     *
     * Requirements:
     *
     * - input must fit into 136 bits
     */
    function toUint136(uint256 value) internal pure returns (uint136) {
        if (value > type(uint136).max) {
            revert SafeCastOverflowedUintDowncast(136, value);
        }
        return uint136(value);
    }

    /**
     * @dev Returns the downcasted uint128 from uint256, reverting on
     * overflow (when the input is greater than largest uint128).
     *
     * Counterpart to Solidity's `uint128` operator.
     *
     * Requirements:
     *
     * - input must fit into 128 bits
     */
    function toUint128(uint256 value) internal pure returns (uint128) {
        if (value > type(uint128).max) {
            revert SafeCastOverflowedUintDowncast(128, value);
        }
        return uint128(value);
    }

    /**
     * @dev Returns the downcasted uint120 from uint256, reverting on
     * overflow (when the input is greater than largest uint120).
     *
     * Counterpart to Solidity's `uint120` operator.
     *
     * Requirements:
     *
     * - input must fit into 120 bits
     */
    function toUint120(uint256 value) internal pure returns (uint120) {
        if (value > type(uint120).max) {
            revert SafeCastOverflowedUintDowncast(120, value);
        }
        return uint120(value);
    }

    /**
     * @dev Returns the downcasted uint112 from uint256, reverting on
     * overflow (when the input is greater than largest uint112).
     *
     * Counterpart to Solidity's `uint112` operator.
     *
     * Requirements:
     *
     * - input must fit into 112 bits
     */
    function toUint112(uint256 value) internal pure returns (uint112) {
        if (value > type(uint112).max) {
            revert SafeCastOverflowedUintDowncast(112, value);
        }
        return uint112(value);
    }

    /**
     * @dev Returns the downcasted uint104 from uint256, reverting on
     * overflow (when the input is greater than largest uint104).
     *
     * Counterpart to Solidity's `uint104` operator.
     *
     * Requirements:
     *
     * - input must fit into 104 bits
     */
    function toUint104(uint256 value) internal pure returns (uint104) {
        if (value > type(uint104).max) {
            revert SafeCastOverflowedUintDowncast(104, value);
        }
        return uint104(value);
    }

    /**
     * @dev Returns the downcasted uint96 from uint256, reverting on
     * overflow (when the input is greater than largest uint96).
     *
     * Counterpart to Solidity's `uint96` operator.
     *
     * Requirements:
     *
     * - input must fit into 96 bits
     */
    function toUint96(uint256 value) internal pure returns (uint96) {
        if (value > type(uint96).max) {
            revert SafeCastOverflowedUintDowncast(96, value);
        }
        return uint96(value);
    }

    /**
     * @dev Returns the downcasted uint88 from uint256, reverting on
     * overflow (when the input is greater than largest uint88).
     *
     * Counterpart to Solidity's `uint88` operator.
     *
     * Requirements:
     *
     * - input must fit into 88 bits
     */
    function toUint88(uint256 value) internal pure returns (uint88) {
        if (value > type(uint88).max) {
            revert SafeCastOverflowedUintDowncast(88, value);
        }
        return uint88(value);
    }

    /**
     * @dev Returns the downcasted uint80 from uint256, reverting on
     * overflow (when the input is greater than largest uint80).
     *
     * Counterpart to Solidity's `uint80` operator.
     *
     * Requirements:
     *
     * - input must fit into 80 bits
     */
    function toUint80(uint256 value) internal pure returns (uint80) {
        if (value > type(uint80).max) {
            revert SafeCastOverflowedUintDowncast(80, value);
        }
        return uint80(value);
    }

    /**
     * @dev Returns the downcasted uint72 from uint256, reverting on
     * overflow (when the input is greater than largest uint72).
     *
     * Counterpart to Solidity's `uint72` operator.
     *
     * Requirements:
     *
     * - input must fit into 72 bits
     */
    function toUint72(uint256 value) internal pure returns (uint72) {
        if (value > type(uint72).max) {
            revert SafeCastOverflowedUintDowncast(72, value);
        }
        return uint72(value);
    }

    /**
     * @dev Returns the downcasted uint64 from uint256, reverting on
     * overflow (when the input is greater than largest uint64).
     *
     * Counterpart to Solidity's `uint64` operator.
     *
     * Requirements:
     *
     * - input must fit into 64 bits
     */
    function toUint64(uint256 value) internal pure returns (uint64) {
        if (value > type(uint64).max) {
            revert SafeCastOverflowedUintDowncast(64, value);
        }
        return uint64(value);
    }

    /**
     * @dev Returns the downcasted uint56 from uint256, reverting on
     * overflow (when the input is greater than largest uint56).
     *
     * Counterpart to Solidity's `uint56` operator.
     *
     * Requirements:
     *
     * - input must fit into 56 bits
     */
    function toUint56(uint256 value) internal pure returns (uint56) {
        if (value > type(uint56).max) {
            revert SafeCastOverflowedUintDowncast(56, value);
        }
        return uint56(value);
    }

    /**
     * @dev Returns the downcasted uint48 from uint256, reverting on
     * overflow (when the input is greater than largest uint48).
     *
     * Counterpart to Solidity's `uint48` operator.
     *
     * Requirements:
     *
     * - input must fit into 48 bits
     */
    function toUint48(uint256 value) internal pure returns (uint48) {
        if (value > type(uint48).max) {
            revert SafeCastOverflowedUintDowncast(48, value);
        }
        return uint48(value);
    }

    /**
     * @dev Returns the downcasted uint40 from uint256, reverting on
     * overflow (when the input is greater than largest uint40).
     *
     * Counterpart to Solidity's `uint40` operator.
     *
     * Requirements:
     *
     * - input must fit into 40 bits
     */
    function toUint40(uint256 value) internal pure returns (uint40) {
        if (value > type(uint40).max) {
            revert SafeCastOverflowedUintDowncast(40, value);
        }
        return uint40(value);
    }

    /**
     * @dev Returns the downcasted uint32 from uint256, reverting on
     * overflow (when the input is greater than largest uint32).
     *
     * Counterpart to Solidity's `uint32` operator.
     *
     * Requirements:
     *
     * - input must fit into 32 bits
     */
    function toUint32(uint256 value) internal pure returns (uint32) {
        if (value > type(uint32).max) {
            revert SafeCastOverflowedUintDowncast(32, value);
        }
        return uint32(value);
    }

    /**
     * @dev Returns the downcasted uint24 from uint256, reverting on
     * overflow (when the input is greater than largest uint24).
     *
     * Counterpart to Solidity's `uint24` operator.
     *
     * Requirements:
     *
     * - input must fit into 24 bits
     */
    function toUint24(uint256 value) internal pure returns (uint24) {
        if (value > type(uint24).max) {
            revert SafeCastOverflowedUintDowncast(24, value);
        }
        return uint24(value);
    }

    /**
     * @dev Returns the downcasted uint16 from uint256, reverting on
     * overflow (when the input is greater than largest uint16).
     *
     * Counterpart to Solidity's `uint16` operator.
     *
     * Requirements:
     *
     * - input must fit into 16 bits
     */
    function toUint16(uint256 value) internal pure returns (uint16) {
        if (value > type(uint16).max) {
            revert SafeCastOverflowedUintDowncast(16, value);
        }
        return uint16(value);
    }

    /**
     * @dev Returns the downcasted uint8 from uint256, reverting on
     * overflow (when the input is greater than largest uint8).
     *
     * Counterpart to Solidity's `uint8` operator.
     *
     * Requirements:
     *
     * - input must fit into 8 bits
     */
    function toUint8(uint256 value) internal pure returns (uint8) {
        if (value > type(uint8).max) {
            revert SafeCastOverflowedUintDowncast(8, value);
        }
        return uint8(value);
    }

    /**
     * @dev Converts a signed int256 into an unsigned uint256.
     *
     * Requirements:
     *
     * - input must be greater than or equal to 0.
     */
    function toUint256(int256 value) internal pure returns (uint256) {
        if (value < 0) {
            revert SafeCastOverflowedIntToUint(value);
        }
        return uint256(value);
    }

    /**
     * @dev Returns the downcasted int248 from int256, reverting on
     * overflow (when the input is less than smallest int248 or
     * greater than largest int248).
     *
     * Counterpart to Solidity's `int248` operator.
     *
     * Requirements:
     *
     * - input must fit into 248 bits
     */
    function toInt248(int256 value) internal pure returns (int248 downcasted) {
        downcasted = int248(value);
        if (downcasted != value) {
            revert SafeCastOverflowedIntDowncast(248, value);
        }
    }

    /**
     * @dev Returns the downcasted int240 from int256, reverting on
     * overflow (when the input is less than smallest int240 or
     * greater than largest int240).
     *
     * Counterpart to Solidity's `int240` operator.
     *
     * Requirements:
     *
     * - input must fit into 240 bits
     */
    function toInt240(int256 value) internal pure returns (int240 downcasted) {
        downcasted = int240(value);
        if (downcasted != value) {
            revert SafeCastOverflowedIntDowncast(240, value);
        }
    }

    /**
     * @dev Returns the downcasted int232 from int256, reverting on
     * overflow (when the input is less than smallest int232 or
     * greater than largest int232).
     *
     * Counterpart to Solidity's `int232` operator.
     *
     * Requirements:
     *
     * - input must fit into 232 bits
     */
    function toInt232(int256 value) internal pure returns (int232 downcasted) {
        downcasted = int232(value);
        if (downcasted != value) {
            revert SafeCastOverflowedIntDowncast(232, value);
        }
    }

    /**
     * @dev Returns the downcasted int224 from int256, reverting on
     * overflow (when the input is less than smallest int224 or
     * greater than largest int224).
     *
     * Counterpart to Solidity's `int224` operator.
     *
     * Requirements:
     *
     * - input must fit into 224 bits
     */
    function toInt224(int256 value) internal pure returns (int224 downcasted) {
        downcasted = int224(value);
        if (downcasted != value) {
            revert SafeCastOverflowedIntDowncast(224, value);
        }
    }

    /**
     * @dev Returns the downcasted int216 from int256, reverting on
     * overflow (when the input is less than smallest int216 or
     * greater than largest int216).
     *
     * Counterpart to Solidity's `int216` operator.
     *
     * Requirements:
     *
     * - input must fit into 216 bits
     */
    function toInt216(int256 value) internal pure returns (int216 downcasted) {
        downcasted = int216(value);
        if (downcasted != value) {
            revert SafeCastOverflowedIntDowncast(216, value);
        }
    }

    /**
     * @dev Returns the downcasted int208 from int256, reverting on
     * overflow (when the input is less than smallest int208 or
     * greater than largest int208).
     *
     * Counterpart to Solidity's `int208` operator.
     *
     * Requirements:
     *
     * - input must fit into 208 bits
     */
    function toInt208(int256 value) internal pure returns (int208 downcasted) {
        downcasted = int208(value);
        if (downcasted != value) {
            revert SafeCastOverflowedIntDowncast(208, value);
        }
    }

    /**
     * @dev Returns the downcasted int200 from int256, reverting on
     * overflow (when the input is less than smallest int200 or
     * greater than largest int200).
     *
     * Counterpart to Solidity's `int200` operator.
     *
     * Requirements:
     *
     * - input must fit into 200 bits
     */
    function toInt200(int256 value) internal pure returns (int200 downcasted) {
        downcasted = int200(value);
        if (downcasted != value) {
            revert SafeCastOverflowedIntDowncast(200, value);
        }
    }

    /**
     * @dev Returns the downcasted int192 from int256, reverting on
     * overflow (when the input is less than smallest int192 or
     * greater than largest int192).
     *
     * Counterpart to Solidity's `int192` operator.
     *
     * Requirements:
     *
     * - input must fit into 192 bits
     */
    function toInt192(int256 value) internal pure returns (int192 downcasted) {
        downcasted = int192(value);
        if (downcasted != value) {
            revert SafeCastOverflowedIntDowncast(192, value);
        }
    }

    /**
     * @dev Returns the downcasted int184 from int256, reverting on
     * overflow (when the input is less than smallest int184 or
     * greater than largest int184).
     *
     * Counterpart to Solidity's `int184` operator.
     *
     * Requirements:
     *
     * - input must fit into 184 bits
     */
    function toInt184(int256 value) internal pure returns (int184 downcasted) {
        downcasted = int184(value);
        if (downcasted != value) {
            revert SafeCastOverflowedIntDowncast(184, value);
        }
    }

    /**
     * @dev Returns the downcasted int176 from int256, reverting on
     * overflow (when the input is less than smallest int176 or
     * greater than largest int176).
     *
     * Counterpart to Solidity's `int176` operator.
     *
     * Requirements:
     *
     * - input must fit into 176 bits
     */
    function toInt176(int256 value) internal pure returns (int176 downcasted) {
        downcasted = int176(value);
        if (downcasted != value) {
            revert SafeCastOverflowedIntDowncast(176, value);
        }
    }

    /**
     * @dev Returns the downcasted int168 from int256, reverting on
     * overflow (when the input is less than smallest int168 or
     * greater than largest int168).
     *
     * Counterpart to Solidity's `int168` operator.
     *
     * Requirements:
     *
     * - input must fit into 168 bits
     */
    function toInt168(int256 value) internal pure returns (int168 downcasted) {
        downcasted = int168(value);
        if (downcasted != value) {
            revert SafeCastOverflowedIntDowncast(168, value);
        }
    }

    /**
     * @dev Returns the downcasted int160 from int256, reverting on
     * overflow (when the input is less than smallest int160 or
     * greater than largest int160).
     *
     * Counterpart to Solidity's `int160` operator.
     *
     * Requirements:
     *
     * - input must fit into 160 bits
     */
    function toInt160(int256 value) internal pure returns (int160 downcasted) {
        downcasted = int160(value);
        if (downcasted != value) {
            revert SafeCastOverflowedIntDowncast(160, value);
        }
    }

    /**
     * @dev Returns the downcasted int152 from int256, reverting on
     * overflow (when the input is less than smallest int152 or
     * greater than largest int152).
     *
     * Counterpart to Solidity's `int152` operator.
     *
     * Requirements:
     *
     * - input must fit into 152 bits
     */
    function toInt152(int256 value) internal pure returns (int152 downcasted) {
        downcasted = int152(value);
        if (downcasted != value) {
            revert SafeCastOverflowedIntDowncast(152, value);
        }
    }

    /**
     * @dev Returns the downcasted int144 from int256, reverting on
     * overflow (when the input is less than smallest int144 or
     * greater than largest int144).
     *
     * Counterpart to Solidity's `int144` operator.
     *
     * Requirements:
     *
     * - input must fit into 144 bits
     */
    function toInt144(int256 value) internal pure returns (int144 downcasted) {
        downcasted = int144(value);
        if (downcasted != value) {
            revert SafeCastOverflowedIntDowncast(144, value);
        }
    }

    /**
     * @dev Returns the downcasted int136 from int256, reverting on
     * overflow (when the input is less than smallest int136 or
     * greater than largest int136).
     *
     * Counterpart to Solidity's `int136` operator.
     *
     * Requirements:
     *
     * - input must fit into 136 bits
     */
    function toInt136(int256 value) internal pure returns (int136 downcasted) {
        downcasted = int136(value);
        if (downcasted != value) {
            revert SafeCastOverflowedIntDowncast(136, value);
        }
    }

    /**
     * @dev Returns the downcasted int128 from int256, reverting on
     * overflow (when the input is less than smallest int128 or
     * greater than largest int128).
     *
     * Counterpart to Solidity's `int128` operator.
     *
     * Requirements:
     *
     * - input must fit into 128 bits
     */
    function toInt128(int256 value) internal pure returns (int128 downcasted) {
        downcasted = int128(value);
        if (downcasted != value) {
            revert SafeCastOverflowedIntDowncast(128, value);
        }
    }

    /**
     * @dev Returns the downcasted int120 from int256, reverting on
     * overflow (when the input is less than smallest int120 or
     * greater than largest int120).
     *
     * Counterpart to Solidity's `int120` operator.
     *
     * Requirements:
     *
     * - input must fit into 120 bits
     */
    function toInt120(int256 value) internal pure returns (int120 downcasted) {
        downcasted = int120(value);
        if (downcasted != value) {
            revert SafeCastOverflowedIntDowncast(120, value);
        }
    }

    /**
     * @dev Returns the downcasted int112 from int256, reverting on
     * overflow (when the input is less than smallest int112 or
     * greater than largest int112).
     *
     * Counterpart to Solidity's `int112` operator.
     *
     * Requirements:
     *
     * - input must fit into 112 bits
     */
    function toInt112(int256 value) internal pure returns (int112 downcasted) {
        downcasted = int112(value);
        if (downcasted != value) {
            revert SafeCastOverflowedIntDowncast(112, value);
        }
    }

    /**
     * @dev Returns the downcasted int104 from int256, reverting on
     * overflow (when the input is less than smallest int104 or
     * greater than largest int104).
     *
     * Counterpart to Solidity's `int104` operator.
     *
     * Requirements:
     *
     * - input must fit into 104 bits
     */
    function toInt104(int256 value) internal pure returns (int104 downcasted) {
        downcasted = int104(value);
        if (downcasted != value) {
            revert SafeCastOverflowedIntDowncast(104, value);
        }
    }

    /**
     * @dev Returns the downcasted int96 from int256, reverting on
     * overflow (when the input is less than smallest int96 or
     * greater than largest int96).
     *
     * Counterpart to Solidity's `int96` operator.
     *
     * Requirements:
     *
     * - input must fit into 96 bits
     */
    function toInt96(int256 value) internal pure returns (int96 downcasted) {
        downcasted = int96(value);
        if (downcasted != value) {
            revert SafeCastOverflowedIntDowncast(96, value);
        }
    }

    /**
     * @dev Returns the downcasted int88 from int256, reverting on
     * overflow (when the input is less than smallest int88 or
     * greater than largest int88).
     *
     * Counterpart to Solidity's `int88` operator.
     *
     * Requirements:
     *
     * - input must fit into 88 bits
     */
    function toInt88(int256 value) internal pure returns (int88 downcasted) {
        downcasted = int88(value);
        if (downcasted != value) {
            revert SafeCastOverflowedIntDowncast(88, value);
        }
    }

    /**
     * @dev Returns the downcasted int80 from int256, reverting on
     * overflow (when the input is less than smallest int80 or
     * greater than largest int80).
     *
     * Counterpart to Solidity's `int80` operator.
     *
     * Requirements:
     *
     * - input must fit into 80 bits
     */
    function toInt80(int256 value) internal pure returns (int80 downcasted) {
        downcasted = int80(value);
        if (downcasted != value) {
            revert SafeCastOverflowedIntDowncast(80, value);
        }
    }

    /**
     * @dev Returns the downcasted int72 from int256, reverting on
     * overflow (when the input is less than smallest int72 or
     * greater than largest int72).
     *
     * Counterpart to Solidity's `int72` operator.
     *
     * Requirements:
     *
     * - input must fit into 72 bits
     */
    function toInt72(int256 value) internal pure returns (int72 downcasted) {
        downcasted = int72(value);
        if (downcasted != value) {
            revert SafeCastOverflowedIntDowncast(72, value);
        }
    }

    /**
     * @dev Returns the downcasted int64 from int256, reverting on
     * overflow (when the input is less than smallest int64 or
     * greater than largest int64).
     *
     * Counterpart to Solidity's `int64` operator.
     *
     * Requirements:
     *
     * - input must fit into 64 bits
     */
    function toInt64(int256 value) internal pure returns (int64 downcasted) {
        downcasted = int64(value);
        if (downcasted != value) {
            revert SafeCastOverflowedIntDowncast(64, value);
        }
    }

    /**
     * @dev Returns the downcasted int56 from int256, reverting on
     * overflow (when the input is less than smallest int56 or
     * greater than largest int56).
     *
     * Counterpart to Solidity's `int56` operator.
     *
     * Requirements:
     *
     * - input must fit into 56 bits
     */
    function toInt56(int256 value) internal pure returns (int56 downcasted) {
        downcasted = int56(value);
        if (downcasted != value) {
            revert SafeCastOverflowedIntDowncast(56, value);
        }
    }

    /**
     * @dev Returns the downcasted int48 from int256, reverting on
     * overflow (when the input is less than smallest int48 or
     * greater than largest int48).
     *
     * Counterpart to Solidity's `int48` operator.
     *
     * Requirements:
     *
     * - input must fit into 48 bits
     */
    function toInt48(int256 value) internal pure returns (int48 downcasted) {
        downcasted = int48(value);
        if (downcasted != value) {
            revert SafeCastOverflowedIntDowncast(48, value);
        }
    }

    /**
     * @dev Returns the downcasted int40 from int256, reverting on
     * overflow (when the input is less than smallest int40 or
     * greater than largest int40).
     *
     * Counterpart to Solidity's `int40` operator.
     *
     * Requirements:
     *
     * - input must fit into 40 bits
     */
    function toInt40(int256 value) internal pure returns (int40 downcasted) {
        downcasted = int40(value);
        if (downcasted != value) {
            revert SafeCastOverflowedIntDowncast(40, value);
        }
    }

    /**
     * @dev Returns the downcasted int32 from int256, reverting on
     * overflow (when the input is less than smallest int32 or
     * greater than largest int32).
     *
     * Counterpart to Solidity's `int32` operator.
     *
     * Requirements:
     *
     * - input must fit into 32 bits
     */
    function toInt32(int256 value) internal pure returns (int32 downcasted) {
        downcasted = int32(value);
        if (downcasted != value) {
            revert SafeCastOverflowedIntDowncast(32, value);
        }
    }

    /**
     * @dev Returns the downcasted int24 from int256, reverting on
     * overflow (when the input is less than smallest int24 or
     * greater than largest int24).
     *
     * Counterpart to Solidity's `int24` operator.
     *
     * Requirements:
     *
     * - input must fit into 24 bits
     */
    function toInt24(int256 value) internal pure returns (int24 downcasted) {
        downcasted = int24(value);
        if (downcasted != value) {
            revert SafeCastOverflowedIntDowncast(24, value);
        }
    }

    /**
     * @dev Returns the downcasted int16 from int256, reverting on
     * overflow (when the input is less than smallest int16 or
     * greater than largest int16).
     *
     * Counterpart to Solidity's `int16` operator.
     *
     * Requirements:
     *
     * - input must fit into 16 bits
     */
    function toInt16(int256 value) internal pure returns (int16 downcasted) {
        downcasted = int16(value);
        if (downcasted != value) {
            revert SafeCastOverflowedIntDowncast(16, value);
        }
    }

    /**
     * @dev Returns the downcasted int8 from int256, reverting on
     * overflow (when the input is less than smallest int8 or
     * greater than largest int8).
     *
     * Counterpart to Solidity's `int8` operator.
     *
     * Requirements:
     *
     * - input must fit into 8 bits
     */
    function toInt8(int256 value) internal pure returns (int8 downcasted) {
        downcasted = int8(value);
        if (downcasted != value) {
            revert SafeCastOverflowedIntDowncast(8, value);
        }
    }

    /**
     * @dev Converts an unsigned uint256 into a signed int256.
     *
     * Requirements:
     *
     * - input must be less than or equal to maxInt256.
     */
    function toInt256(uint256 value) internal pure returns (int256) {
        // Note: Unsafe cast below is okay because `type(int256).max` is guaranteed to be positive
        if (value > uint256(type(int256).max)) {
            revert SafeCastOverflowedUintToInt(value);
        }
        return int256(value);
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
        /// @solidity memory-safe-assembly
        assembly {
            r.slot := slot
        }
    }

    /**
     * @dev Returns an `BooleanSlot` with member `value` located at `slot`.
     */
    function getBooleanSlot(bytes32 slot) internal pure returns (BooleanSlot storage r) {
        /// @solidity memory-safe-assembly
        assembly {
            r.slot := slot
        }
    }

    /**
     * @dev Returns an `Bytes32Slot` with member `value` located at `slot`.
     */
    function getBytes32Slot(bytes32 slot) internal pure returns (Bytes32Slot storage r) {
        /// @solidity memory-safe-assembly
        assembly {
            r.slot := slot
        }
    }

    /**
     * @dev Returns an `Uint256Slot` with member `value` located at `slot`.
     */
    function getUint256Slot(bytes32 slot) internal pure returns (Uint256Slot storage r) {
        /// @solidity memory-safe-assembly
        assembly {
            r.slot := slot
        }
    }

    /**
     * @dev Returns an `StringSlot` with member `value` located at `slot`.
     */
    function getStringSlot(bytes32 slot) internal pure returns (StringSlot storage r) {
        /// @solidity memory-safe-assembly
        assembly {
            r.slot := slot
        }
    }

    /**
     * @dev Returns an `StringSlot` representation of the string storage pointer `store`.
     */
    function getStringSlot(string storage store) internal pure returns (StringSlot storage r) {
        /// @solidity memory-safe-assembly
        assembly {
            r.slot := store.slot
        }
    }

    /**
     * @dev Returns an `BytesSlot` with member `value` located at `slot`.
     */
    function getBytesSlot(bytes32 slot) internal pure returns (BytesSlot storage r) {
        /// @solidity memory-safe-assembly
        assembly {
            r.slot := slot
        }
    }

    /**
     * @dev Returns an `BytesSlot` representation of the bytes storage pointer `store`.
     */
    function getBytesSlot(bytes storage store) internal pure returns (BytesSlot storage r) {
        /// @solidity memory-safe-assembly
        assembly {
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

// lib/openzeppelin-contracts/contracts/token/ERC20/extensions/IERC20Metadata.sol

// OpenZeppelin Contracts (last updated v5.0.0) (token/ERC20/extensions/IERC20Metadata.sol)



/**
 * @dev Interface for the optional metadata functions from the ERC20 standard.
 */
interface IERC20Metadata is IERC20 {
    /**
     * @dev Returns the name of the token.
     */
    function name() external view returns (string memory);

    /**
     * @dev Returns the symbol of the token.
     */
    function symbol() external view returns (string memory);

    /**
     * @dev Returns the decimals places of the token.
     */
    function decimals() external view returns (uint8);
}

// lib/openzeppelin-contracts/contracts/token/ERC721/IERC721.sol

// OpenZeppelin Contracts (last updated v5.0.0) (token/ERC721/IERC721.sol)



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

// lib/openzeppelin-contracts/contracts/proxy/beacon/BeaconProxy.sol

// OpenZeppelin Contracts (last updated v5.0.0) (proxy/beacon/BeaconProxy.sol)



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

// src/MapCityVault.sol

/// @dev Flap Portal token state (read-only, UI pricing).
interface IMapCityPortal {
    struct TokenStateV8Safe {
        uint8 status;
        uint256 reserve;
        uint256 circulatingSupply;
        uint256 price;
        uint8 tokenVersion;
        uint256 r;
        uint256 h;
        uint256 k;
        uint256 dexSupplyThresh;
        address quoteTokenAddress;
        bool nativeToQuoteSwapEnabled;
        bytes32 extensionID;
        uint256 buyTaxRate;
        uint256 sellTaxRate;
        address pool;
        uint256 progress;
        uint8 lpFeeProfile;
        uint8 dexId;
    }

    function getTokenV8Safe(address token) external view returns (TokenStateV8Safe memory);
}

interface IMapCityPair {
    function token0() external view returns (address);
    function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast);
}

interface IMapCityWBNB {
    function deposit() external payable;
}

/**
 * MapCityVault v2 - CATCH walk-to-store map game vault (BSC, 9 bStock districts).
 *
 * Flap Vault V2 framework (BeaconProxy + Guardian + VaultPortal).
 *
 *   tax BNB --> 10% ops
 *           --> trigger-fee reserve (water line, filled FIRST, spent only on Trigger fees)
 *           --> 9 equal district buckets (remainder to district 0)
 *
 * Refill (BNB -> bStock) is done through Flap VaultEx, not PancakeSwap/Chainlink:
 *   - one open order per district, order = min(bucket, maxSwapBnb), only when bucket >= minSwapBnb
 *   - input is WBNB, output is the hard-coded bStock of that district
 *   - settlement callback only does bookkeeping (fulfil -> inventory, refund -> bucket restored as WBNB)
 *   - automation: a self-renewing Flap TriggerService heartbeat (every 10 minutes, fee paid from the reserve;
 *     receive() itself is pure accounting) + permissionless `refill` / `requestRefillTrigger` fallbacks;
 *     a player claim also restarts a dead heartbeat
 *
 * Claims are walk-to-store EIP-712 vouchers signed by `gameSigner`, and only the holder of a
 * SPACE ID Agent ID (soulbound .ai handle = Binance Agentic Wallet identity) may redeem, for itself.
 *
 * Inventory is the vault's live token balance (not a counter), so rebasing bStocks never desync.
 *
 * Powers: the Flap Guardian can withdraw or reconfigure anything (BNB, WBNB, bStocks, any ERC20).
 * The owner has no fund power; it may only set the project token, hand over ownership, change the
 * voucher signer, and clear a dead VaultEx order (bookkeeping only, no value leaves the vault).
 */
contract MapCityVaultUpgradeable is
    Initializable,
    ReentrancyGuardUpgradeable,
    VaultBaseV2,
    IFlapVaultExConsumer,
    ITriggerReceiver
{
    using SafeERC20 for IERC20;
    using SafeCast for uint256;

    uint16 public constant BPS_DENOM = 10000;
    /// @dev 10% of inbound BNB routed to opsTreasury (Flap vault convention).
    uint16 public constant OPS_FEE_BPS = 1000;
    uint8 public constant DISTRICT_COUNT = 9;

    /// @dev Flap VaultEx (same address on BSC mainnet and testnet).
    address public constant VAULTEX = 0x000048Df69f3d2af22Df6DC2d3B01FB592b90000;
    /// @dev SPACE ID Agent ID NFT (soulbound .ai handle, one per Agentic Wallet).
    address public constant AGENT_ID_NFT = 0x60B9262456dE011F7d15a54CdD8c48bAaa8B022F;

    /// @dev Heartbeat: every trigger callback books the next one this far ahead, so refills run on a clock
    ///      instead of depending on tax arrivals (receive() stays pure accounting).
    uint64 public constant HEARTBEAT_INTERVAL = 10 minutes;
    /// @dev Trigger callback only starts another order while at least this much gas is left. Measured against
    ///      the real services on a BSC mainnet fork: one order ~306k gas, booking the next trigger ~198k gas.
    ///      650k = one order + one booking + margin, so after the last order the heartbeat can always be booked
    ///      (the first order of a callback is always attempted regardless, see `trigger`).
    uint256 public constant TRIGGER_ORDER_GAS = 650_000;
    /// @dev A trigger that is still unfired this long after its due time may be replaced.
    uint64 public constant TRIGGER_STALE = 1 hours;
    /// @dev A district whose VaultEx request was rejected is skipped by automation for this long.
    uint64 public constant RETRY_COOLDOWN = 20 minutes;
    /// @dev A still-PENDING VaultEx order may be cleared by owner / guardian only after this long.
    uint64 public constant STUCK_PENDING_AFTER = 7 days;
    /// @dev An order VaultEx cannot report (getRequest reverts / unknown id) may be cleared only after this long.
    uint64 public constant UNREADABLE_ORDER_AFTER = 30 minutes;

    uint256 public constant MIN_SWAP_FLOOR = 0.01 ether;
    uint256 public constant MAX_SWAP_CEIL = 100 ether;
    uint256 public constant RESERVE_TARGET_FLOOR = 0.0005 ether;
    uint256 public constant RESERVE_TARGET_CEIL = 0.2 ether;

    /// @dev District 0..8: bStocks BEP-20 (18 decimals). Order is fixed forever.
    address private constant ASSET_NVDA = 0x02Fca66C1D1aFB4E2A7884261eB00F63598a7436;
    address private constant ASSET_AAPL = 0x431a3BEE82E2ca41e49895CbECE5bB0F76A89b7A;
    address private constant ASSET_TSLA = 0x5b1910eAaD6450E50f816082Aa078C41F10C292f;
    address private constant ASSET_MSFT = 0x80106cb3EAD06659A5ad19DF39D9b4733863B9b0;
    address private constant ASSET_GOOG = 0x3F53De71c126BdaBAe20f9cD64848d317f6C3238;
    address private constant ASSET_SPCX = 0xbe9D156892E55e7154BcD3cB0FEA677F9D3103E1;
    address private constant ASSET_QQQ = 0x205812CdBed920aFf76C6580abD681a46D11efc7;
    address private constant ASSET_MU = 0xcdf2f3e0fa43C47A6662a91C9E4a7C5f69762699;
    address private constant ASSET_SPY = 0x7138b48df7D98D7e3cc221BfE7192D0a178182D8;

    /// @dev One slot per district: native BNB bucket, WBNB bucket (refunds / wrapped leftovers), open order id.
    struct District {
        uint96 bnb;
        uint96 wbnb;
        uint64 swapId;
    }

    IERC20 public projectToken;
    IMapCityPortal public flapPortal;
    /// @dev Vault owner (Flap creator).
    address public owner;
    /// @dev Receives the 10% ops fee on inbound BNB.
    address public opsTreasury;
    uint256 public totalOpsBnbPaid;
    uint256 public totalTaxReceived;

    District[DISTRICT_COUNT] private _d;
    /// @dev Gross WBNB sold in the district's open VaultEx order (0 = none).
    uint256[DISTRICT_COUNT] public swapInput;
    uint256[DISTRICT_COUNT] public totalGameFunded;
    uint256[DISTRICT_COUNT] public totalGamePaid;
    /// @dev Gross WBNB spent on FULFILLED orders.
    uint256[DISTRICT_COUNT] public totalBnbSpent;
    mapping(uint256 => uint8) private _swapDistrictPlusOne;
    /// @dev Automation (the trigger callback) ignores a district until this time.
    uint64[DISTRICT_COUNT] public failedUntil;

    uint256 public minSwapBnb;
    uint256 public maxSwapBnb;

    /// @dev Trigger-fee water line. Filled before any bucket and spent on TriggerService fees (the Guardian can also withdraw it).
    uint256 public triggerReserve;
    uint256 public triggerReserveTarget;
    uint128 public pendingTriggerId;
    /// @dev When the booked trigger is due (heartbeat time, or the booking time for an immediate one).
    uint64 public triggerDueAt;

    // ---- ledger counters (see invariants in tests) ----
    /// @dev BNB credited to buckets from tax.
    uint256 public totalBucketIn;
    /// @dev WBNB credited beyond what an order sold (late refund picked up by reconcileWbnb); keeps the ledger exact.
    uint256 public totalRefundSurplus;
    uint256 public totalReserveFromTax;
    uint256 public totalReserveDonated;
    uint256 public totalTriggerFeePaid;
    /// @dev Sold WBNB not returned by a REFUNDED order (VaultEx fee on refund).
    uint256 public totalSwapFeeLost;
    /// @dev Guardian exits (value leaving outside vouchers / VaultEx / Trigger fees).
    uint256 public totalGuardianBucketCut;
    uint256 public totalGuardianReserveCut;
    uint256[DISTRICT_COUNT] public totalGuardianStockOut;

    bytes32 public constant GAME_VOUCHER_TYPEHASH = keccak256(
        "GameVoucher(address to,uint8 district,uint256 amount,bytes32 spawnId,uint256 nonce,uint256 deadline)"
    );
    address public gameSigner;
    mapping(uint256 => bool) public gameNonceUsed;
    /// @dev Timestamp of the district's latest VaultEx order (used when VaultEx cannot report it).
    uint64[DISTRICT_COUNT] public orderPlacedAt;

    event TreasuryFunded(address indexed from, uint256 amount);
    event OpsFeePaid(address indexed to, uint256 feeWei, uint256 vaultNetWei);
    event OpsFeeSkipped(address indexed to, uint256 feeWei);
    event OpsTreasuryUpdated(address indexed prev, address indexed next);
    event OwnershipTransferred(address indexed prev, address indexed next);
    event ProjectTokenSet(address indexed token);
    event EmergencyWithdraw(address indexed guardian, address indexed to, address indexed token, uint256 amount);
    event SwapRequested(uint8 indexed district, uint256 indexed requestId, uint256 wbnbIn);
    event SwapRequestFailed(uint8 indexed district, uint256 wbnbIn);
    event SwapSettled(uint8 indexed district, uint256 indexed requestId, bool fulfilled, uint256 sold, uint256 got);
    event SwapParamsUpdated(uint256 minSwapBnb, uint256 maxSwapBnb);
    event GameSignerUpdated(address indexed prev, address indexed next);
    event GamePoolFunded(uint8 indexed district, uint256 amount);
    event GameRewardClaimed(
        address indexed to, uint8 indexed district, bytes32 indexed spawnId, address stock, uint256 amount, uint256 nonce
    );
    event TriggerReserveFunded(uint256 amount, bool fromTax);
    event TriggerReserveTargetUpdated(uint256 target);
    event TriggerRequested(uint256 indexed requestId, uint256 fee);
    event TriggerReserveLow(uint256 reserve, uint256 fee);
    event TriggerFired(uint256 indexed requestId, uint256 placed, bool rearm);
    event StuckOrderCleared(uint8 indexed district, uint256 indexed requestId, uint8 vaultExStatus, uint256 recovered, uint256 writtenOff);
    event WbnbReconciled(uint8 indexed district, uint256 amount);

    error WrongPayment();
    error RewardPayFailed();
    error BadDistrict();
    error NotOwnerOrGuardian();
    error NotGuardian();
    error TokenNotSet();
    error TokenAlreadySet();
    error ZeroToken();
    error ZeroOwner();
    error ZeroAddress();
    error BadTokenStatus();
    error NoPool();
    error EmptyReserves();
    error NothingToClaim();
    error GameSignerUnset();
    error BadGameSignature();
    error GameVoucherExpired();
    error GameNonceUsed();
    error GamePoolEmpty();
    error ZeroSpotPrice();
    error BadParams();
    error AgentIdRequired();
    error NotRecipient();
    error SwapPending();
    error BelowMinSwap();
    error SwapRequestRejected();
    error NotVaultEx();
    error NotTrigger();
    error UnknownRequest();
    error BadSettleToken();
    error BadStatus();
    error TriggerPending();
    error TriggerUnavailable();
    error NoOpenOrder();
    error OrderStillActive();

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address owner_, address taxToken_, address opsTreasury_) external initializer {
        __ReentrancyGuard_init();
        flapPortal = IMapCityPortal(_getPortal());
        owner = owner_ == address(0) ? msg.sender : owner_;
        opsTreasury = opsTreasury_;
        if (taxToken_ != address(0)) {
            projectToken = IERC20(taxToken_);
            emit ProjectTokenSet(taxToken_);
        }
        minSwapBnb = 0.1 ether;
        maxSwapBnb = 2 ether;
        // ~0.0002 BNB per heartbeat, one every 10 minutes: 0.03 BNB funds roughly a day of automation.
        triggerReserveTarget = 0.03 ether;
    }

    // ---------------- chain constants ----------------

    function _wbnb() private view returns (address) {
        if (block.chainid == 56) return 0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c;
        if (block.chainid == 97) return 0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd;
        revert UnsupportedChain(block.chainid);
    }

    function _triggerService() private view returns (address) {
        if (block.chainid == 56) return 0xcf4EE25035CF883895110f367F5BA8172416a7F9;
        if (block.chainid == 97) return 0x560E9830926C9e0EB98a59c6b9902383Fc0D9Eb2;
        revert UnsupportedChain(block.chainid);
    }

    function triggerService() external view returns (address) {
        return _triggerService();
    }

    function wbnb() external view returns (address) {
        return _wbnb();
    }

    // ---------------- roles ----------------

    function _requireOwnerOrGuardian() private view {
        if (msg.sender != owner && msg.sender != _getGuardian()) revert NotOwnerOrGuardian();
    }

    /// @dev Only the Flap Guardian. The owner has NO fund-related power at all.
    function _requireGuardian() private view {
        if (msg.sender != _getGuardian()) revert NotGuardian();
    }

    function _requireToken() private view {
        if (address(projectToken) == address(0)) revert TokenNotSet();
    }

    function setToken(address token) external {
        _requireOwnerOrGuardian();
        if (token == address(0)) revert ZeroToken();
        if (address(projectToken) != address(0)) revert TokenAlreadySet();
        projectToken = IERC20(token);
        emit ProjectTokenSet(token);
    }

    function setOpsTreasury(address to) external {
        _requireGuardian();
        address prev = opsTreasury;
        opsTreasury = to;
        emit OpsTreasuryUpdated(prev, to);
    }

    function transferOwnership(address next) external {
        _requireOwnerOrGuardian();
        if (next == address(0)) revert ZeroOwner();
        address prev = owner;
        owner = next;
        emit OwnershipTransferred(prev, next);
    }

    function setSwapParams(uint256 minBnb, uint256 maxBnb) external {
        _requireGuardian();
        if (minBnb < MIN_SWAP_FLOOR || minBnb > maxBnb || maxBnb > MAX_SWAP_CEIL) revert BadParams();
        minSwapBnb = minBnb;
        maxSwapBnb = maxBnb;
        emit SwapParamsUpdated(minBnb, maxBnb);
    }

    function setTriggerReserveTarget(uint256 target) external {
        _requireGuardian();
        if (target < RESERVE_TARGET_FLOOR || target > RESERVE_TARGET_CEIL) revert BadParams();
        triggerReserveTarget = target;
        emit TriggerReserveTargetUpdated(target);
    }

    // ---------------- districts ----------------

    function _districtAsset(uint256 district) private pure returns (address) {
        if (district == 0) return ASSET_NVDA;
        if (district == 1) return ASSET_AAPL;
        if (district == 2) return ASSET_TSLA;
        if (district == 3) return ASSET_MSFT;
        if (district == 4) return ASSET_GOOG;
        if (district == 5) return ASSET_SPCX;
        if (district == 6) return ASSET_QQQ;
        if (district == 7) return ASSET_MU;
        return ASSET_SPY; // 8
    }

    function districtAsset(uint8 district) external pure returns (address) {
        if (district >= DISTRICT_COUNT) revert BadDistrict();
        return _districtAsset(district);
    }

    /// @notice Live map inventory of a district = the vault's actual token balance (rebase-safe).
    function gamePool(uint256 district) public view returns (uint256) {
        if (district >= DISTRICT_COUNT) revert BadDistrict();
        return IERC20(_districtAsset(district)).balanceOf(address(this));
    }

    function pendingBnb(uint8 district) external view returns (uint256) {
        if (district >= DISTRICT_COUNT) revert BadDistrict();
        return _d[district].bnb;
    }

    function pendingWbnb(uint8 district) external view returns (uint256) {
        if (district >= DISTRICT_COUNT) revert BadDistrict();
        return _d[district].wbnb;
    }

    function districtSwapId(uint8 district) external view returns (uint256) {
        if (district >= DISTRICT_COUNT) revert BadDistrict();
        return _d[district].swapId;
    }

    function swapDistrict(uint256 requestId) external view returns (bool known, uint8 district) {
        uint8 dp = _swapDistrictPlusOne[requestId];
        return (dp != 0, dp == 0 ? 0 : dp - 1);
    }

    function _eligible(uint256 district) private view returns (bool) {
        District storage x = _d[district];
        return x.swapId == 0 && block.timestamp >= failedUntil[district] && uint256(x.bnb) + x.wbnb >= minSwapBnb;
    }

    function swapEligible(uint8 district) external view returns (bool) {
        if (district >= DISTRICT_COUNT) revert BadDistrict();
        return _eligible(district);
    }

    function _anyEligible() private view returns (bool) {
        for (uint256 d = 0; d < DISTRICT_COUNT; d++) {
            if (_eligible(d)) return true;
        }
        return false;
    }

    function gameDistrictInfo(uint8 district)
        external
        view
        returns (address stock, uint256 bnbBucket, uint256 inFlight, uint256 pool, uint256 funded, uint256 paid)
    {
        if (district >= DISTRICT_COUNT) revert BadDistrict();
        stock = _districtAsset(district);
        District storage x = _d[district];
        bnbBucket = uint256(x.bnb) + x.wbnb;
        inFlight = swapInput[district];
        pool = gamePool(district);
        funded = totalGameFunded[district];
        paid = totalGamePaid[district];
    }

    /// @notice Whole-vault totals for UI: tax received, ops paid, value waiting in buckets, WBNB swapped, BNB balance.
    function vaultStats()
        external
        view
        returns (uint256 taxReceived, uint256 opsPaid, uint256 bucketsBnb, uint256 swappedBnb, uint256 vaultBnb)
    {
        taxReceived = totalTaxReceived;
        opsPaid = totalOpsBnbPaid;
        for (uint256 d = 0; d < DISTRICT_COUNT; d++) {
            District storage x = _d[d];
            bucketsBnb += uint256(x.bnb) + x.wbnb;
            swappedBnb += totalBnbSpent[d];
        }
        vaultBnb = address(this).balance;
    }

    /// @notice Native BNB that is earmarked (BNB buckets + trigger reserve); anything above it is stray.
    function outstandingRewards() public view returns (uint256 totalPending) {
        totalPending = triggerReserve;
        for (uint256 d = 0; d < DISTRICT_COUNT; d++) {
            totalPending += _d[d].bnb;
        }
    }

    // ---------------- tax inflow (lightweight) ----------------

    receive() external payable {
        if (msg.value == 0) return;
        if (msg.sender == _wbnb()) return;

        totalTaxReceived += msg.value;
        uint256 vaultNet = _routeOpsFee(msg.value);
        if (vaultNet == 0) return;

        // Water line first: the trigger reserve is topped up before any bucket.
        uint256 res = triggerReserve;
        uint256 target = triggerReserveTarget;
        if (res < target) {
            uint256 take = target - res;
            if (take > vaultNet) take = vaultNet;
            triggerReserve = res + take;
            totalReserveFromTax += take;
            vaultNet -= take;
            emit TriggerReserveFunded(take, true);
            if (vaultNet == 0) return;
        }

        uint256 each = vaultNet / DISTRICT_COUNT;
        uint256 rem = vaultNet - each * DISTRICT_COUNT;
        totalBucketIn += vaultNet;
        for (uint256 d = 0; d < DISTRICT_COUNT; d++) {
            uint256 add = d == 0 ? each + rem : each;
            if (add > 0) _d[d].bnb += add.toUint96();
        }
        emit TreasuryFunded(msg.sender, vaultNet);
        // Pure accounting: no external calls here. Refills are driven by the heartbeat trigger.
    }

    function _routeOpsFee(uint256 grossWei) private returns (uint256 vaultNetWei) {
        vaultNetWei = grossWei;
        if (grossWei == 0 || opsTreasury == address(0)) return vaultNetWei;

        uint256 feeWei = (grossWei * OPS_FEE_BPS) / BPS_DENOM;
        if (feeWei == 0) return vaultNetWei;

        (bool ok,) = opsTreasury.call{value: feeWei, gas: 50000}("");
        if (!ok) {
            emit OpsFeeSkipped(opsTreasury, feeWei);
            return grossWei;
        }

        vaultNetWei = grossWei - feeWei;
        totalOpsBnbPaid += feeWei;
        emit OpsFeePaid(opsTreasury, feeWei, vaultNetWei);
    }

    /// @notice Anyone may top up the trigger reserve (only the Guardian can withdraw it again).
    function fundTriggerReserve() external payable {
        if (msg.value == 0) revert WrongPayment();
        triggerReserve += msg.value;
        totalReserveDonated += msg.value;
        emit TriggerReserveFunded(msg.value, false);
    }

    // ---------------- refill: Flap VaultEx ----------------

    /// @notice Permissionless: place the VaultEx order for one eligible district (fallback to the trigger).
    function refill(uint8 district) external nonReentrant returns (uint256 requestId) {
        if (district >= DISTRICT_COUNT) revert BadDistrict();
        District storage x = _d[district];
        if (x.swapId != 0) revert SwapPending();
        if (uint256(x.bnb) + x.wbnb < minSwapBnb) revert BelowMinSwap();
        _placeSwap(district, false);
        return x.swapId;
    }

    /// @dev Moves min(bucket, maxSwapBnb) out of the bucket into one VaultEx order.
    ///      `soft` swallows a VaultEx revert and restores the bucket (as WBNB), used inside the trigger loop.
    function _placeSwap(uint8 district, bool soft) private returns (bool) {
        District storage x = _d[district];
        uint256 funds = uint256(x.bnb) + x.wbnb;
        uint256 amount = funds > maxSwapBnb ? maxSwapBnb : funds;
        uint256 useWbnb = x.wbnb < amount ? x.wbnb : amount;
        uint256 useBnb = amount - useWbnb;

        // effects
        x.bnb -= useBnb.toUint96();
        x.wbnb -= useWbnb.toUint96();

        // interactions
        IERC20 w = IERC20(_wbnb());
        if (useBnb > 0) IMapCityWBNB(address(w)).deposit{value: useBnb}();
        w.forceApprove(VAULTEX, amount);

        IFlapVaultEx.ExactInputParams memory p = IFlapVaultEx.ExactInputParams({
            inputToken: address(w),
            outputToken: _districtAsset(district),
            inputAmount: amount
        });
        uint256 id;
        if (soft) {
            try IFlapVaultEx(VAULTEX).requestSwap(p) returns (uint256 r) {
                id = r;
            } catch {}
        } else {
            id = IFlapVaultEx(VAULTEX).requestSwap(p);
        }
        w.forceApprove(VAULTEX, 0);

        if (id == 0) {
            if (!soft) revert SwapRequestRejected();
            // value stays in the vault, now fully WBNB: restore the bucket so nothing is lost
            x.wbnb += amount.toUint96();
            failedUntil[district] = uint64(block.timestamp) + RETRY_COOLDOWN;
            emit SwapRequestFailed(district, amount);
            return false;
        }
        x.swapId = id.toUint64();
        swapInput[district] = amount;
        orderPlacedAt[district] = uint64(block.timestamp);
        _swapDistrictPlusOne[id] = district + 1;
        emit SwapRequested(district, id, amount);
        return true;
    }

    /// @notice VaultEx settlement. Bookkeeping only: no swaps, no external calls.
    function onFlapVaultExSettled(uint256 requestId, uint8 status, address token, uint256 amount) external override {
        if (msg.sender != VAULTEX) revert NotVaultEx();
        uint8 dp = _swapDistrictPlusOne[requestId];
        if (dp == 0) revert UnknownRequest();
        uint8 district = dp - 1;
        District storage x = _d[district];
        uint256 sold = swapInput[district];

        if (status == 2) {
            if (token != _districtAsset(district)) revert BadSettleToken();
            totalBnbSpent[district] += sold;
            totalGameFunded[district] += amount;
            emit GamePoolFunded(district, amount);
            emit SwapSettled(district, requestId, true, sold, amount);
        } else if (status == 3) {
            if (token != _wbnb()) revert BadSettleToken();
            // Credit only WBNB that really sits in the vault un-booked; never trust the reported amount alone.
            uint256 credit = amount;
            uint256 free = _freeWbnb();
            if (credit > free) credit = free;
            x.wbnb += credit.toUint96();
            if (sold > credit) totalSwapFeeLost += sold - credit;
            else if (credit > sold) totalRefundSurplus += credit - sold;
            emit SwapSettled(district, requestId, false, sold, credit);
        } else {
            revert BadStatus();
        }
        delete _swapDistrictPlusOne[requestId];
        x.swapId = 0;
        swapInput[district] = 0;
    }

    /// @dev WBNB held by the vault that is not booked in any district bucket.
    function _freeWbnb() private view returns (uint256) {
        uint256 held = IERC20(_wbnb()).balanceOf(address(this));
        uint256 booked;
        for (uint256 d = 0; d < DISTRICT_COUNT; d++) {
            booked += _d[d].wbnb;
        }
        return held > booked ? held - booked : 0;
    }

    /// @notice Owner / guardian: book un-booked WBNB (e.g. a refund that arrived without / before its callback)
    ///         into a district bucket. Nothing leaves the vault; the value only becomes spendable again.
    function reconcileWbnb(uint8 district) external nonReentrant {
        _requireOwnerOrGuardian();
        if (district >= DISTRICT_COUNT) revert BadDistrict();
        uint256 free = _freeWbnb();
        if (free == 0) revert WrongPayment();
        _d[district].wbnb += free.toUint96();
        totalRefundSurplus += free;
        emit WbnbReconciled(district, free);
    }

    // ---------------- F4: clear a dead VaultEx order (owner or guardian) ----------------

    /// @notice Unlock a district whose VaultEx order will never call back. Bookkeeping only: no value leaves.
    /// @dev Allowed when VaultEx no longer lists the order as PENDING, or it has been PENDING for 7+ days.
    ///      FULFILLED -> counted as spent (the bStock is already in the live balance).
    ///      otherwise -> any un-booked WBNB (up to the sold amount) returns to the bucket; the rest is written off
    ///      (it may still be recoverable later through `reconcileWbnb`).
    function clearStuckOrder(uint8 district) external nonReentrant {
        _requireOwnerOrGuardian();
        if (district >= DISTRICT_COUNT) revert BadDistrict();
        District storage x = _d[district];
        uint256 id = x.swapId;
        if (id == 0) revert NoOpenOrder();

        IFlapVaultEx.RequestStatus st = IFlapVaultEx.RequestStatus.NONE;
        uint64 created;
        try IFlapVaultEx(VAULTEX).getRequest(id) returns (IFlapVaultEx.SwapRequestView memory r) {
            st = r.status;
            created = r.createdAt;
        } catch {}
        if (st == IFlapVaultEx.RequestStatus.PENDING) {
            if (block.timestamp <= uint256(created) + STUCK_PENDING_AFTER) revert OrderStillActive();
        } else if (st == IFlapVaultEx.RequestStatus.NONE) {
            // VaultEx could not report the order: fail closed for a while instead of trusting the silence.
            if (block.timestamp <= uint256(orderPlacedAt[district]) + UNREADABLE_ORDER_AFTER) revert OrderStillActive();
        }

        uint256 sold = swapInput[district];
        uint256 recovered;
        if (st == IFlapVaultEx.RequestStatus.FULFILLED) {
            totalBnbSpent[district] += sold;
        } else {
            uint256 free = _freeWbnb();
            recovered = free < sold ? free : sold;
            x.wbnb += recovered.toUint96();
            totalSwapFeeLost += sold - recovered;
        }
        delete _swapDistrictPlusOne[id];
        x.swapId = 0;
        swapInput[district] = 0;
        emit StuckOrderCleared(district, id, uint8(st), recovered, sold - recovered);
    }

    // ---------------- refill automation: Flap TriggerService ----------------

    function _triggerSlotFree() private view returns (bool) {
        return pendingTriggerId == 0 || block.timestamp > uint256(triggerDueAt) + TRIGGER_STALE;
    }

    /// @dev Pay the trigger fee from the reserve and ask the service to call `trigger` at `executeAfter`
    ///      (an absolute timestamp; 0 = as soon as possible). Never reverts.
    function _tryArmTrigger(uint64 executeAfter) private returns (bool) {
        if (!_triggerSlotFree()) return false;
        address svc = _triggerService();
        if (svc.code.length == 0) return false;

        uint256 fee;
        try IFlapTriggerService(svc).getFee() returns (uint256 f) {
            fee = f;
        } catch {
            return false;
        }
        uint256 res = triggerReserve;
        if (res < fee) {
            emit TriggerReserveLow(res, fee);
            return false;
        }

        triggerReserve = res - fee;
        try IFlapTriggerService(svc).requestTrigger{value: fee}(executeAfter) returns (uint256 id) {
            totalTriggerFeePaid += fee;
            if (id != 0 && id <= type(uint128).max) {
                pendingTriggerId = uint128(id);
                triggerDueAt = executeAfter == 0 ? uint64(block.timestamp) : executeAfter;
            }
            emit TriggerRequested(id, fee);
            return true;
        } catch {
            triggerReserve = res;
            return false;
        }
    }

    /// @notice Permissionless: start (or restart) the heartbeat. Only possible while no trigger is booked, so it
    ///         cannot be spammed; the fee comes from the reserve. The callback then keeps itself going.
    function requestRefillTrigger() external nonReentrant returns (uint256 requestId) {
        if (!_triggerSlotFree()) revert TriggerPending();
        if (!_tryArmTrigger(0)) revert TriggerUnavailable();
        return pendingTriggerId;
    }

    /// @notice Flap TriggerService callback: scan districts 0..8 and place every eligible order (gas-bounded),
    ///         then book the next callback (heartbeat, or right away when orders are left over).
    function trigger(uint256 requestId) external override nonReentrant {
        if (msg.sender != _triggerService()) revert NotTrigger();
        if (requestId == pendingTriggerId) pendingTriggerId = 0;

        uint256 placed;
        uint256 attempted;
        bool leftover;
        for (uint256 d = 0; d < DISTRICT_COUNT; d++) {
            if (!_eligible(d)) continue;
            // Always attempt at least one district per callback, so every callback makes progress
            // (an order is placed, or the district is put on cooldown) and re-arming can never spin.
            if (attempted > 0 && gasleft() < TRIGGER_ORDER_GAS) {
                leftover = true;
                break;
            }
            attempted++;
            if (_placeSwap(uint8(d), true)) placed++;
        }
        // Leftover orders: come back immediately. Otherwise: next heartbeat. Both only re-arm when this was the
        // live request (a replaced, late callback never books a second chain), and stop quietly when the
        // reserve cannot pay the fee.
        bool rearmed = _tryArmTrigger(leftover ? 0 : uint64(block.timestamp) + HEARTBEAT_INTERVAL);
        emit TriggerFired(requestId, placed, rearmed);
    }

    function triggerStatus()
        external
        view
        returns (uint256 reserve, uint256 target, uint256 fee, uint256 pendingId, bool armable)
    {
        reserve = triggerReserve;
        target = triggerReserveTarget;
        address svc = _triggerService();
        if (svc.code.length > 0) {
            try IFlapTriggerService(svc).getFee() returns (uint256 f) {
                fee = f;
            } catch {}
        }
        pendingId = pendingTriggerId;
        armable = _triggerSlotFree() && reserve >= fee;
    }

    // ---------------- map game claim (Agent ID gated) ----------------

    function setGameSigner(address signer_) external {
        _requireOwnerOrGuardian();
        address prev = gameSigner;
        gameSigner = signer_;
        emit GameSignerUpdated(prev, signer_);
    }

    function gameDomainSeparator() public view returns (bytes32) {
        return keccak256(
            abi.encode(
                keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"),
                keccak256(bytes("MapCityVault")),
                keccak256(bytes("1")),
                block.chainid,
                address(this)
            )
        );
    }

    function gameVoucherDigest(
        address to,
        uint8 district,
        uint256 amount,
        bytes32 spawnId,
        uint256 nonce,
        uint256 deadline
    ) public view returns (bytes32) {
        bytes32 structHash =
            keccak256(abi.encode(GAME_VOUCHER_TYPEHASH, to, district, amount, spawnId, nonce, deadline));
        return keccak256(abi.encodePacked("\x19\x01", gameDomainSeparator(), structHash));
    }

    /// @notice True when `who` holds a SPACE ID Agent ID (i.e. is a Binance Agentic Wallet identity).
    function hasAgentId(address who) public view returns (bool) {
        return IERC721(AGENT_ID_NFT).balanceOf(who) > 0;
    }

    /// @notice Redeem a signed walk-to-store voucher. Only an Agent ID holder, only for itself.
    function claimGameVoucher(
        address to,
        uint8 district,
        uint256 amount,
        bytes32 spawnId,
        uint256 nonce,
        uint256 deadline,
        bytes calldata signature
    ) external nonReentrant {
        if (msg.sender != to) revert NotRecipient();
        if (IERC721(AGENT_ID_NFT).balanceOf(msg.sender) == 0) revert AgentIdRequired();
        if (gameSigner == address(0)) revert GameSignerUnset();
        if (district >= DISTRICT_COUNT) revert BadDistrict();
        if (to == address(0)) revert ZeroAddress();
        if (amount == 0) revert NothingToClaim();
        if (block.timestamp > deadline) revert GameVoucherExpired();
        if (gameNonceUsed[nonce]) revert GameNonceUsed();

        bytes32 digest = gameVoucherDigest(to, district, amount, spawnId, nonce, deadline);
        if (_recoverSigner(digest, signature) != gameSigner) revert BadGameSignature();

        if (amount > gamePool(district)) revert GamePoolEmpty();

        gameNonceUsed[nonce] = true;
        totalGamePaid[district] += amount;

        address stock = _districtAsset(district);
        IERC20(stock).safeTransfer(to, amount);
        emit GameRewardClaimed(to, district, spawnId, stock, amount, nonce);

        // Restart path: if the heartbeat has died (reserve ran dry, trigger lost), a claim books a new one.
        // Cheap when the heartbeat is alive (one storage read); never reverts the claim.
        if (_triggerSlotFree()) _tryArmTrigger(0);
    }

    function _recoverSigner(bytes32 digest, bytes calldata signature) private pure returns (address) {
        if (signature.length != 65) revert BadGameSignature();
        bytes32 r;
        bytes32 s;
        uint8 v;
        assembly {
            r := calldataload(signature.offset)
            s := calldataload(add(signature.offset, 32))
            v := byte(0, calldataload(add(signature.offset, 64)))
        }
        if (uint256(s) > 0x7FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF5D576E7357A4501DDFE92F46681B20A0) {
            revert BadGameSignature();
        }
        if (v != 27 && v != 28) revert BadGameSignature();
        address signer = ecrecover(digest, v, r, s);
        if (signer == address(0)) revert BadGameSignature();
        return signer;
    }

    // ---------------- guardian-only fund control ----------------
    // The owner has no fund power. The Flap Guardian may withdraw anything: BNB (stray first, then buckets,
    // then the trigger reserve), WBNB buckets, bStock inventory, any other ERC20. Every cut is booked so the
    // ledger identities keep holding.

    function emergencyWithdrawNative(address to, uint256 amount) external nonReentrant {
        _requireGuardian();
        if (to == address(0)) revert ZeroAddress();
        uint256 bal = address(this).balance;
        if (amount == 0 || amount > bal) revert WrongPayment();

        uint256 reserved = outstandingRewards();
        uint256 free = bal > reserved ? bal - reserved : 0;
        if (amount > free) {
            uint256 cut = amount - free;
            for (uint256 d = 0; d < DISTRICT_COUNT && cut > 0; d++) {
                uint256 have = _d[d].bnb;
                uint256 take = have < cut ? have : cut;
                _d[d].bnb = (have - take).toUint96();
                totalGuardianBucketCut += take;
                cut -= take;
            }
            if (cut > 0) {
                triggerReserve -= cut;
                totalGuardianReserveCut += cut;
            }
        }
        (bool ok,) = to.call{value: amount}("");
        if (!ok) revert RewardPayFailed();
        emit EmergencyWithdraw(msg.sender, to, address(0), amount);
    }

    function emergencyWithdrawToken(address token, address to, uint256 amount) external nonReentrant {
        _requireGuardian();
        if (to == address(0) || token == address(0)) revert ZeroAddress();
        if (amount == 0) revert WrongPayment();

        if (token == _wbnb()) {
            uint256 free = _freeWbnb();
            if (amount > free) {
                uint256 cut = amount - free;
                for (uint256 d = 0; d < DISTRICT_COUNT && cut > 0; d++) {
                    uint256 have = _d[d].wbnb;
                    uint256 take = have < cut ? have : cut;
                    _d[d].wbnb = (have - take).toUint96();
                    totalGuardianBucketCut += take;
                    cut -= take;
                }
            }
        } else {
            for (uint256 d = 0; d < DISTRICT_COUNT; d++) {
                if (token == _districtAsset(d)) {
                    totalGuardianStockOut[d] += amount;
                    break;
                }
            }
        }
        IERC20(token).safeTransfer(to, amount);
        emit EmergencyWithdraw(msg.sender, to, token, amount);
    }
    // ---------------- Portal / pricing (UI) ----------------

    function marketMeta() external view returns (uint8 status, address pool) {
        _requireToken();
        IMapCityPortal.TokenStateV8Safe memory s = flapPortal.getTokenV8Safe(address(projectToken));
        return (s.status, s.pool);
    }

    function tokenPriceBnbWei() public view returns (uint256 priceWeiPerToken) {
        _requireToken();
        IMapCityPortal.TokenStateV8Safe memory s = flapPortal.getTokenV8Safe(address(projectToken));
        if (s.status != 1 && s.status != 4) revert BadTokenStatus();
        if (s.status == 1) {
            if (s.price == 0) revert ZeroSpotPrice();
            return s.price;
        }
        if (s.pool == address(0)) revert NoPool();
        (uint112 r0, uint112 r1,) = IMapCityPair(s.pool).getReserves();
        address t0 = IMapCityPair(s.pool).token0();
        (uint256 reserveBnb, uint256 reserveTok) =
            t0 == _wbnb() ? (uint256(r0), uint256(r1)) : (uint256(r1), uint256(r0));
        if (reserveBnb == 0 || reserveTok == 0) revert EmptyReserves();
        uint8 tokDec = IERC20Metadata(address(projectToken)).decimals();
        priceWeiPerToken = (reserveBnb * (10 ** uint256(tokDec))) / reserveTok;
        if (priceWeiPerToken == 0) revert ZeroSpotPrice();
    }

    // ---------------- Flap metadata ----------------

    function description() public pure override returns (string memory) {
        return
        "CATCH Map City: project tax BNB funds 9 bStocks district buckets (10% ops, a Trigger-fee reserve first). "
        "Buckets are swapped into bStocks through Flap VaultEx, automated by Flap Trigger. "
        "bStocks are walk-to-store map rewards paid out through signed vouchers to Agent ID wallets; "
        "the Flap Guardian can withdraw or reconfigure any asset.";
    }

    function vaultUISchema() public pure override returns (VaultUISchema memory schema) {
        schema.vaultType = "MapCityVault";
        schema.description = "CATCH map rewards: 10% ops, trigger reserve, 9 bStock buckets via VaultEx";
        schema.methods = new VaultMethodSchema[](6);

        schema.methods[0].name = "vaultStats";
        schema.methods[0].description = "Totals";
        schema.methods[0].outputs = new FieldDescriptor[](5);
        schema.methods[0].outputs[0] = FieldDescriptor("taxReceived", "uint256", "BNB in", 18);
        schema.methods[0].outputs[1] = FieldDescriptor("opsPaid", "uint256", "Ops 10%", 18);
        schema.methods[0].outputs[2] = FieldDescriptor("bucketsBnb", "uint256", "Buckets", 18);
        schema.methods[0].outputs[3] = FieldDescriptor("swappedBnb", "uint256", "Swapped", 18);
        schema.methods[0].outputs[4] = FieldDescriptor("vaultBnb", "uint256", "Balance", 18);

        schema.methods[1].name = "gameDistrictInfo";
        schema.methods[1].description = "0-8 NVDA AAPL TSLA MSFT GOOGL SPCX QQQ MU SPY";
        schema.methods[1].inputs = new FieldDescriptor[](1);
        schema.methods[1].inputs[0] = FieldDescriptor("district", "uint8", "District 0-8", 0);
        schema.methods[1].outputs = new FieldDescriptor[](6);
        schema.methods[1].outputs[0] = FieldDescriptor("stock", "address", "Token", 0);
        schema.methods[1].outputs[1] = FieldDescriptor("bnbBucket", "uint256", "Bucket BNB", 18);
        schema.methods[1].outputs[2] = FieldDescriptor("inFlight", "uint256", "Order in flight", 18);
        schema.methods[1].outputs[3] = FieldDescriptor("pool", "uint256", "Pool", 18);
        schema.methods[1].outputs[4] = FieldDescriptor("funded", "uint256", "Bought", 18);
        schema.methods[1].outputs[5] = FieldDescriptor("paid", "uint256", "Paid", 18);

        schema.methods[2].name = "refill";
        schema.methods[2].description = "Place the VaultEx order for a district";
        schema.methods[2].isWriteMethod = true;
        schema.methods[2].inputs = new FieldDescriptor[](1);
        schema.methods[2].inputs[0] = FieldDescriptor("district", "uint8", "District 0-8", 0);

        schema.methods[3].name = "requestRefillTrigger";
        schema.methods[3].description = "Arm a Flap Trigger (fee from reserve)";
        schema.methods[3].isWriteMethod = true;

        schema.methods[4].name = "triggerStatus";
        schema.methods[4].description = "Trigger reserve water line";
        schema.methods[4].outputs = new FieldDescriptor[](5);
        schema.methods[4].outputs[0] = FieldDescriptor("reserve", "uint256", "Reserve", 18);
        schema.methods[4].outputs[1] = FieldDescriptor("target", "uint256", "Target", 18);
        schema.methods[4].outputs[2] = FieldDescriptor("fee", "uint256", "Trigger fee", 18);
        schema.methods[4].outputs[3] = FieldDescriptor("pendingId", "uint256", "Pending trigger", 0);
        schema.methods[4].outputs[4] = FieldDescriptor("armable", "bool", "Can arm", 0);

        schema.methods[5].name = "claimGameVoucher";
        schema.methods[5].description = "Redeem voucher (Agent ID wallet only)";
        schema.methods[5].isWriteMethod = true;
        schema.methods[5].inputs = new FieldDescriptor[](7);
        schema.methods[5].inputs[0] = FieldDescriptor("to", "address", "Player (= caller)", 0);
        schema.methods[5].inputs[1] = FieldDescriptor("district", "uint8", "District 0-8", 0);
        schema.methods[5].inputs[2] = FieldDescriptor("amount", "uint256", "Amount", 18);
        schema.methods[5].inputs[3] = FieldDescriptor("spawnId", "bytes32", "Spawn", 0);
        schema.methods[5].inputs[4] = FieldDescriptor("nonce", "uint256", "Nonce", 0);
        schema.methods[5].inputs[5] = FieldDescriptor("deadline", "uint256", "Deadline", 0);
        schema.methods[5].inputs[6] = FieldDescriptor("signature", "bytes", "Sig", 0);
    }

    uint256[27] private __gap;
}

// src/MapCityBeaconFactory.sol

/// @title MapCityBeaconFactory
/// @notice Flap-style beacon factory: the factory owns the beacon, Guardian or owner (devAddress) upgrades it.
contract MapCityBeaconFactory is VaultFactoryBaseV2 {
    address public immutable devAddress;
    address public immutable beacon;

    address[] public allVaults;

    event VaultCreated(address indexed vault, address indexed taxToken, address indexed creator, address opsWallet);
    event VaultImplementationUpgraded(address indexed previousImplementation, address indexed newImplementation);
    event VaultUpgradesLocked(address indexed beacon);

    error NotAuthorizedDev(address creator);
    error ZeroDev();
    error OnlyGuardian();

    constructor(address _devAddress) {
        if (_devAddress == address(0)) revert ZeroDev();
        devAddress = _devAddress;

        MapCityVaultUpgradeable impl = new MapCityVaultUpgradeable();
        beacon = address(new UpgradeableBeacon(address(impl), address(this)));
    }

    function newVault(
        address taxToken,
        address, /* quoteToken */
        address creator,
        bytes calldata vaultData
    )
        external
        override
        returns (address vault)
    {
        if (msg.sender != _getVaultPortal()) revert OnlyVaultPortal();
        if (creator != devAddress) revert NotAuthorizedDev(creator);

        address opsWallet = creator;
        if (vaultData.length >= 32) {
            opsWallet = abi.decode(vaultData, (address));
            if (opsWallet == address(0)) opsWallet = creator;
        }

        vault = address(
            new BeaconProxy(
                beacon,
                abi.encodeCall(MapCityVaultUpgradeable.initialize, (creator, taxToken, opsWallet))
            )
        );
        allVaults.push(vault);
        emit VaultCreated(vault, taxToken, creator, opsWallet);
    }

    function upgradeVaultImplementation(address newImplementation) external {
        if (msg.sender != _getGuardian() && msg.sender != devAddress) revert OnlyGuardian();
        address prev = UpgradeableBeacon(beacon).implementation();
        UpgradeableBeacon(beacon).upgradeTo(newImplementation);
        emit VaultImplementationUpgraded(prev, newImplementation);
    }

    function lockVaultUpgrades() external {
        if (msg.sender != _getGuardian() && msg.sender != devAddress) revert OnlyGuardian();
        UpgradeableBeacon(beacon).renounceOwnership();
        emit VaultUpgradesLocked(beacon);
    }

    function isVaultUpgradesLocked() external view returns (bool locked) {
        locked = UpgradeableBeacon(beacon).owner() == address(0);
    }

    function vaultCount() external view returns (uint256) {
        return allVaults.length;
    }

    function isQuoteTokenSupported(address quoteToken) external pure override returns (bool supported) {
        supported = quoteToken == address(0);
    }

    function beaconImplementation() external view returns (address) {
        return UpgradeableBeacon(beacon).implementation();
    }

    function _validateBeforeLaunch(IVaultFactoryValidationV2.LaunchValidationDataV1 memory data)
        internal
        pure
        override
        returns (bool success, string memory reason)
    {
        if (data.quoteToken != address(0)) {
            return (false, "MapCityVault supports native BNB quote only.");
        }
        return (true, "");
    }

    function vaultDataSchema() public pure override returns (VaultDataSchema memory schema) {
        schema.description =
            "Beacon-proxied Map City reward vault. "
            "Factory owns the beacon; upgrades by Guardian or owner. "
            "Address-gated launch: only whitelisted creator may launch. "
            "opsWallet receives 10% of inbound tax BNB (0 => creator).";
        schema.fields = new FieldDescriptor[](1);
        schema.fields[0] = FieldDescriptor(
            "opsWallet",
            "address",
            "Ops treasury (10% tax BNB). Use 0 to default to creator.",
            0
        );
        schema.isArray = false;
    }
}
