// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

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

// lib/openzeppelin-contracts/contracts/token/ERC721/IERC721Receiver.sol

// OpenZeppelin Contracts (last updated v5.0.0) (token/ERC721/IERC721Receiver.sol)

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

// src/flap/IPortal.sol

/// @dev Minimal Portal types stub for VaultFactoryBaseV2 / IVaultFactoryValidationV2.
interface IPortalCommonTypes {
    enum CurveType {
        CURVE_LEGACY_15,
        CURVE_4
    }
}

interface IPortalTypes is IPortalCommonTypes {
    enum TokenVersion {
        TOKEN_LEGACY,
        TOKEN_V2,
        TOKEN_V3,
        TOKEN_V4,
        TOKEN_V5,
        TOKEN_V6,
        TOKEN_V7,
        TOKEN_V8
    }
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
struct FieldDescriptor_0 {
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
    FieldDescriptor_0[] fields;
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
struct ApproveAction_0 {
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
struct VaultMethodSchema_0 {
    string name;
    string description;
    FieldDescriptor_0[] inputs;
    FieldDescriptor_0[] outputs;
    ApproveAction_0[] approvals;
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
struct VaultUISchema_0 {
    string vaultType;
    string description;
    VaultMethodSchema_0[] methods;
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

// lib/openzeppelin-contracts/contracts/interfaces/draft-IERC6093.sol

// OpenZeppelin Contracts (last updated v5.0.0) (interfaces/draft-IERC6093.sol)

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

/// @dev Minimal VaultPortal types stub — only what VaultFactoryBaseV2 references.
interface IVaultPortalTypes {
    enum RiskLevel {
        UNVERIFIED,
        LOW_RISK,
        LOW_MEDIUM_RISK,
        MEDIUM_RISK,
        HIGH_RISK
    }

    /// @dev Placeholder shape for legacy V6 hook signature in VaultFactoryBaseV2.
    struct NewTokenV6WithVaultParams {
        IPortalTypes.TokenVersion tokenVersion;
        address quoteToken;
        uint16 buyTaxRate;
        uint16 sellTaxRate;
        uint16 vaultBps;
        bytes vaultData;
    }
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

// lib/openzeppelin-contracts-upgradeable/contracts/utils/introspection/ERC165Upgradeable.sol

// OpenZeppelin Contracts (last updated v5.0.0) (utils/introspection/ERC165.sol)

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

// lib/openzeppelin-contracts-upgradeable/contracts/token/ERC721/ERC721Upgradeable.sol

// OpenZeppelin Contracts (last updated v5.0.0) (token/ERC721/ERC721.sol)

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

// src/WallStreetCityUpgradeable.sol

    /// @dev Flap Portal token state (same source as DynamicBackstopVault)
interface IFlapPortal {
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

interface IPancakePair {
    function token0() external view returns (address);
    function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast);
}

    /// @dev Chainlink-compatible USD feed
interface IAggregatorV3 {
    function decimals() external view returns (uint8);
    function latestRoundData()
        external
        view
        returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound);
}

    /// @dev Flap stocks registry (BSC): NAV multiplier per tokenized equity
interface IFlapStocksRegistry {
    function getMultiplier(address asset) external view returns (uint256);
}

// Flap Vault Specification V2 (VaultBase / VaultBaseV2). https://docs.flap.sh/flap/developers/vault-developers/vault-and-vaultfactory-specification

struct FieldDescriptor_1 {
    string name;
    string fieldType;
    string description;
    uint8 decimals;
}

struct ApproveAction_1 {
    string tokenType;
    string amountFieldName;
}

struct VaultMethodSchema_1 {
    string name;
    string description;
    FieldDescriptor_1[] inputs;
    FieldDescriptor_1[] outputs;
    ApproveAction_1[] approvals;
    bool isInputArray;
    bool isOutputArray;
    bool isWriteMethod;
}

struct VaultUISchema_1 {
    string vaultType;
    string description;
    VaultMethodSchema_1[] methods;
}

    /// @title VaultBase (Flap V1)
abstract contract VaultBase {
    error UnsupportedChain(uint256 chainId);

    function _getPortal() internal view returns (address portal) {
        uint256 chainId = block.chainid;
        if (chainId == 56) return 0xe2cE6ab80874Fa9Fa2aAE65D277Dd6B8e65C9De0;
        if (chainId == 97) return 0x5bEacaF7ABCbB3aB280e80D007FD31fcE26510e9;
        revert UnsupportedChain(chainId);
    }

    function _getGuardian() internal view returns (address guardian) {
        uint256 chainId = block.chainid;
        if (chainId == 56) return 0x9e27098dcD8844bcc6287a557E0b4D09C86B8a4b;
        if (chainId == 97) return 0x76Fa8C526f8Bc27ba6958B76DeEf92a0dbE46950;
        revert UnsupportedChain(chainId);
    }

    function description() public view virtual returns (string memory);
}

    /// @title VaultBaseV2 (Flap V2)
abstract contract VaultBaseV2 is VaultBase {
    function vaultUISchema() public pure virtual returns (VaultUISchema_1 memory schema);
}

/**
 * WallStreetCity - Wall Street City land deeds (BSC, 9 stock districts).
 * Buy empty plots with project tokens (burned). Flip/list burn 15% spread.
 * District stock dividends from tax BNB via keeper.
 * On transfer/flip, unclaimed stock is paid to the previous owner first.
 */
contract WallStreetCityUpgradeable is Initializable, ERC721Upgradeable, ReentrancyGuardUpgradeable, VaultBaseV2 {
    using SafeERC20 for IERC20;
    using Strings for uint256;

    address public constant BURN_ADDRESS = 0x000000000000000000000000000000000000dEaD;

    /// @dev Primary sale: 500_000 project tokens (18 decimals).
    uint256 public constant plotPrice = 500_000 ether;

    uint16 public constant SALE_TAX_BPS = 1500;
    uint16 public constant BPS_DENOM = 10000;
    /// @dev 10% of inbound BNB routed to opsTreasury (same idea as DynamicBackstopVault).
    uint16 public constant OPS_FEE_BPS = 1000;

    uint16 public constant FLIP_PREMIUM_BPS = 13000;
    uint16 public constant FLIP_SELLER_BPS = 11500;
    uint32 public constant FLIP_COOLDOWN = 30 minutes;

    /// @dev Lifetime primary (genesis) mint cap per wallet. Flip/transfer does not free the slot.
    uint256 public constant MAX_PRIMARY_PLOTS_PER_WALLET = 5;
    /// @dev Max plots per primary-buy tx (blocks buyMany vacuum).
    uint256 public constant MAX_MINT_PER_TX = 1;
    /// @dev Global cooldown: at most one primary mint across all wallets every 30 seconds.
    uint32 public constant GLOBAL_MINT_COOLDOWN = 30 seconds;

    uint8 public constant DISTRICT_COUNT = 9;
    /// @dev Keeper quote premium vs Chainlink fair value (102% = 1.02x), Flap Stocks Vault style.
    uint256 public constant KEEPER_QUOTE_BPS = 10200;
    /// @dev Max Chainlink feed staleness (Flap uses ~24h + buffer).
    uint256 public constant MAX_PRICE_STALENESS = 25 hours;
    /// @dev Cap Flap Stocks registry NAV multiplier (1e18 scale).
    uint256 public constant MAX_NAV_MULTIPLIER = 1.1e18;
    /// @dev BSC BNB/USD Chainlink feed (Flap RWAVault).
    address public constant BNB_USD_FEED = 0x0567F2323251f0Aab15c8dFb1967E4e8A7D42aeE;
    /// @dev Flap Stocks registry on BSC (getMultiplier).
    address public constant FLAP_STOCKS_REGISTRY = 0x5418f7e8fF90354DB0eCD48c8b710219244Eb3C5;

    uint256 public gridSize;
    uint256 public totalPlots;
    /// @dev District cell size = ceil(gridSize / 3).
    uint256 public districtStep;
    IERC20 public projectToken;
    IFlapPortal public flapPortal;
    /// @dev Deployer; may setToken once after the project token is launched.
    address public owner;
    /// @dev Receives 10% ops fee; Guardian may update via setOpsTreasury.
    address public opsTreasury;
    /// @dev Cumulative ops fee paid in wei.
    uint256 public totalOpsBnbPaid;

    // ---------------- dividend accounting (DiamondVault-style) ----------------

    /// @dev Accrual scale (DiamondVault ACC_PRECISION).
    uint256 public constant ACC_PRECISION = 1e30;

    /// @dev District 0..8: Flap tokenized equity + Chainlink USD feed.
    address private constant ASSET_NVDA = 0xA9eE28C80f960B889dFbd1902055218cBa016F75;
    address private constant FEED_NVDA  = 0xea5c2Cbb5cD57daC24E26180b19a929F3E9699B8;
    address private constant ASSET_AAPL = 0x390a684EF9cADE28A7AD0DFa61AB1Eb3842618c4;
    address private constant FEED_AAPL  = 0xb7Ed5bE7977d61E83534230f3256C021e0fae0B6;
    address private constant ASSET_TSLA = 0x2494b603319d4D9F9715c9f4496d9E0364B59d93;
    address private constant FEED_TSLA  = 0xEEA2ae9c074E87596A85ABE698B2Afebc9B57893;
    address private constant ASSET_MSFT = 0x6Bfe75D1ad432050eA973C3A3DcD88F02e2444C3;
    address private constant FEED_MSFT  = 0x5D209cE1fBABeAA8E6f9De4514A74FFB4b34560F;
    address private constant ASSET_GOOG = 0x091FC7778e6932d4009B087B191D1EE3bac5729A;
    address private constant FEED_GOOG  = 0xeDA73F8acb669274B15A977Cb0cdA57a84F18c2a;
    address private constant ASSET_SPCX = 0xd0a58BC9D88D3FF48C0294Cb7e45937d0E41A928;
    address private constant FEED_SPCX  = 0x5Bd3a7c076011800900e52689C0ed46ef931e3e6;
    address private constant ASSET_FXI  = 0x9b8E987e6fEc8Cf1380C4dcA7071e2C7853AEEA1;
    address private constant FEED_FXI   = 0x7D48744FB285b884dF1Ee8005f04B62FF1404a98;
    address private constant ASSET_MU   = 0xcdf2f3e0fa43C47A6662a91C9E4a7C5f69762699;
    address private constant FEED_MU    = 0x75F4285d8e8687A9b5bd7b36A26D672A8C4C1c7a;
    address private constant ASSET_AMD  = 0x75Fd4cF6f8392E41E70391D60c90C0D5211603a1;
    address private constant FEED_AMD   = 0x4442f488fba0b27D970b68b761336224d6d30492;

    /// @dev Per-district BNB bucket for keeper stock buys.
    uint256[DISTRICT_COUNT] public pendingBnb;
    /// @dev Accrued stock per plot, scaled by ACC_PRECISION.
    uint256[DISTRICT_COUNT] public accPerPlot;
    /// @dev Accrued project-token per plot, scaled by ACC_PRECISION (unused).
    uint256[DISTRICT_COUNT] public accTokenPerPlot;
    uint256[DISTRICT_COUNT] public soldInDistrict;
    uint256[DISTRICT_COUNT] public totalStockDistributed;
    uint256[DISTRICT_COUNT] public totalStockClaimed;
    uint256[DISTRICT_COUNT] public totalTokenDistributed;
    uint256[DISTRICT_COUNT] public totalTokenClaimed;

    struct PlotState {
        uint64 mintedAt;
        uint64 acquiredAt;       // last ownership change (flip cooldown start)
        uint128 accrued;         // unclaimed stock amount (district stock, 18 decimals)
        uint256 rewardDebt;      // accPerPlot snapshot at buy/claim (scaled)
        uint256 rewardDebtToken; // accTokenPerPlot snapshot at buy/claim (scaled)
        }

    mapping(uint256 => PlotState) private _plots;
    mapping(uint256 => uint256) public listingPrice;
    /// @dev Last flip/sale base for premium; at least plotPrice.
    mapping(uint256 => uint256) public flipPrice;
    /// @dev Plots owned per district per address 鈥?used to ban self-deal sellStockToVault.
    mapping(uint8 => mapping(address => uint256)) public plotsOwnedInDistrict;
    /// @dev Cumulative primary mints per wallet (not current balance).
    mapping(address => uint256) public primaryMintCount;
    /// @dev Timestamp of last primary mint globally (0 = never).
    uint64 public lastGlobalPrimaryMintAt;

    uint256 public soldPlots;
    /// @dev BNB waiting for first plot sales before district split.
    uint256 public bufferedBnb;
    uint256 public totalBurned;
    /// @dev Gross tax BNB received (before ops fee).
    uint256 public totalTaxReceived;
    uint256 public totalSaleTax;

    // ---------------- map game (walk-to-store claim) ----------------

    /// @dev Fixed share of every permissionless refill routed to the map reward pool.
    ///      Immutable by design: no admin can raise, lower or redirect it.
    uint16 public constant GAME_BPS = 1000; // 10%
    /// @dev EIP-712 typehash for a walk-to-store voucher.
    bytes32 public constant GAME_VOUCHER_TYPEHASH = keccak256(
        "GameVoucher(address to,uint8 district,uint256 amount,bytes32 spawnId,uint256 nonce,uint256 deadline)"
    );

    /// @dev Signer allowed to authorize map claims. The only mutable game parameter.
    address public gameSigner;
    /// @dev Unclaimed map reward inventory per district (stock units, 18 decimals).
    uint256[DISTRICT_COUNT] public gamePool;
    /// @dev Cumulative map rewards funded / paid per district.
    uint256[DISTRICT_COUNT] public totalGameFunded;
    uint256[DISTRICT_COUNT] public totalGamePaid;
    /// @dev Consumed voucher nonces.
    mapping(uint256 => bool) public gameNonceUsed;

    event PlotBought(address indexed buyer, uint256 indexed plotId, uint256 amountPaid);
    event RewardClaimed(
        address indexed owner, uint256 indexed plotId, address stock, uint256 stockPaid, uint256 tokenPaid
    );
    event PlotListed(address indexed seller, uint256 indexed plotId, uint256 price);
    event ListingCancelled(address indexed seller, uint256 indexed plotId);
    event PlotFlipped(
        address indexed seller, address indexed buyer, uint256 indexed plotId, uint256 price, uint256 tax, bool viaListing
    );
    event PlotTransferred(address indexed from, address indexed to, uint256 indexed plotId);
    event TokensBurned(address indexed from, uint256 amount);
    event TreasuryFunded(address indexed from, uint256 amount);
    event OpsFeePaid(address indexed to, uint256 feeWei, uint256 vaultNetWei);
    event OpsFeeSkipped(address indexed to, uint256 feeWei);
    event OpsTreasuryUpdated(address indexed prev, address indexed next);
    event OwnershipTransferred(address indexed prev, address indexed next);
    event ProjectTokenSet(address indexed token);
    event EmergencyWithdraw(address indexed guardian, address indexed to, address indexed token, uint256 amount);
    event StockSoldToVault(
        address indexed keeper, uint8 indexed district, address stock, uint256 stockAmount, uint256 bnbPaid
    );
    event GameConfigUpdated(uint16 gameBps, address indexed signer, bool paused);
    event GameDailyCapUpdated(uint8 indexed district, uint256 cap);
    event GamePoolFunded(uint8 indexed district, uint256 amount);
    event GameRewardClaimed(
        address indexed to, uint8 indexed district, bytes32 indexed spawnId, address stock, uint256 amount, uint256 nonce
    );

    error InvalidPlot();
    error WrongPayment();
    error NotPlotOwner();
    error NothingToClaim();
    error RewardPayFailed();
    error BadConstructorArgs();
    error NotListed();
    error ZeroPrice();
    error SelfTransfer();
    error BadTokenStatus();
    error ZeroSpotPrice();
    error NoPool();
    error EmptyReserves();
    error BadDistrict();
    error StalePriceFeed();
    error BadFeedAnswer();
    error InsufficientDistrictBnb();
    error NoPlotsInDistrict();
    error FlipCooldown();
    error NotOwnerOrGuardian();
    error NotGuardian();
    error TokenNotSet();
    error TokenAlreadySet();
    error ZeroToken();
    error ZeroOwner();
    error EmergencyReserve();
    error ZeroAddress();
    /// @dev sellStockToVault caller owns 鈮? plot in the target district (self-deal drain).
    error SellerOwnsDistrictPlot();
    /// @dev flipBuy execution price exceeded caller maxPrice (slippage).
    error PriceExceedsMax();
    /// @dev Wallet already minted MAX_PRIMARY_PLOTS_PER_WALLET primary plots.
    error MintCapExceeded();
    /// @dev buyMany / batch size exceeds MAX_MINT_PER_TX.
    error MintBatchTooLarge();
    /// @dev Global primary mint attempted before GLOBAL_MINT_COOLDOWN elapsed.
    error GlobalMintCooldownActive();
    error GamePaused();
    error GameSignerUnset();
    error BadGameSignature();
    error GameVoucherExpired();
    error GameNonceUsed();
    error GameCapExceeded();
    error GamePoolEmpty();
    error BadGameBps();

    /// @dev Flap tokenized equity for district 0..8 on BSC.
    function _districtAsset(uint256 district) private pure returns (address) {
        if (district == 0) return ASSET_NVDA;
        if (district == 1) return ASSET_AAPL;
        if (district == 2) return ASSET_TSLA;
        if (district == 3) return ASSET_MSFT;
        if (district == 4) return ASSET_GOOG;
        if (district == 5) return ASSET_SPCX;
        if (district == 6) return ASSET_FXI;
        if (district == 7) return ASSET_MU;
        return ASSET_AMD; // 8
    }

    /// @dev Chainlink USD feed for district 0..8.
    function _districtFeed(uint256 district) private pure returns (address) {
        if (district == 0) return FEED_NVDA;
        if (district == 1) return FEED_AAPL;
        if (district == 2) return FEED_TSLA;
        if (district == 3) return FEED_MSFT;
        if (district == 4) return FEED_GOOG;
        if (district == 5) return FEED_SPCX;
        if (district == 6) return FEED_FXI;
        if (district == 7) return FEED_MU;
        return FEED_AMD; // 8
    }

    /// @dev District map uses ASSET_* / FEED_* below.
    /// @dev 0 NVDA, 1 AAPL, 2 TSLA, 3 MSFT, 4 GOOG,
    ///      5 SPCX (SpaceX), 6 FXI, 7 MU, 8 AMD.
    ///
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /// @notice Initialize a BeaconProxy (called by factory / manual proxy initData).
    /// @param owner_ Vault owner (Flap `creator`). address(0) => msg.sender.
    /// @param taxToken_ Predicted project/tax token from VaultPortal (may be unset until launch).
    /// @param opsTreasury_ Ops fee recipient (10% inbound BNB). address(0) allowed (fee skipped).
    function initialize(address owner_, address taxToken_, address opsTreasury_) external initializer {
        __ERC721_init("Wall Street City", "WSC");
        __ReentrancyGuard_init();

        uint256 gridSize_ = 24;
        gridSize = gridSize_;
        totalPlots = gridSize_ * gridSize_;
        districtStep = (gridSize_ + 2) / 3;
        flapPortal = IFlapPortal(_getPortal());
        owner = owner_ == address(0) ? msg.sender : owner_;
        opsTreasury = opsTreasury_;
        if (taxToken_ != address(0)) {
            projectToken = IERC20(taxToken_);
            emit ProjectTokenSet(taxToken_);
        }
    }

    function _requireOwnerOrGuardian() private view {
        if (msg.sender != owner && msg.sender != _getGuardian()) revert NotOwnerOrGuardian();
    }

    /// @notice Owner or Guardian: bind the project / tax token once after token launch.
    function setToken(address token) external {
        _requireOwnerOrGuardian();
        if (token == address(0)) revert ZeroToken();
        if (address(projectToken) != address(0)) revert TokenAlreadySet();
        projectToken = IERC20(token);
        emit ProjectTokenSet(token);
    }

    function _requireToken() private view {
        if (address(projectToken) == address(0)) revert TokenNotSet();
    }

    // ---------------- districts ----------------

    /// @dev District 0..8 from plot grid: row*3+col using districtStep cells.
    function districtOf(uint256 plotId) public view returns (uint8) {
        if (plotId >= totalPlots) revert InvalidPlot();
        uint256 x = plotId % gridSize;
        uint256 y = plotId / gridSize;
        uint256 col = x / districtStep;
        uint256 row = y / districtStep;
        if (col > 2) col = 2;
        if (row > 2) row = 2;
        return uint8(row * 3 + col);
    }

    /// @dev District stock/feed + bucket and distribution counters.
    function districtInfo(uint8 district)
        external
        view
        returns (
            address stock,
            address feed,
            uint256 sold,
            uint256 bnbBucket,
            uint256 stockDistributed,
            uint256 stockClaimed,
            uint256 tokenDistributed,
            uint256 tokenClaimed
        )
    {
        if (district >= DISTRICT_COUNT) revert BadDistrict();
        stock = _districtAsset(district);
        feed = _districtFeed(district);
        sold = soldInDistrict[district];
        bnbBucket = pendingBnb[district];
        stockDistributed = totalStockDistributed[district];
        stockClaimed = totalStockClaimed[district];
        tokenDistributed = totalTokenDistributed[district];
        tokenClaimed = totalTokenClaimed[district];
    }

    function districtAsset(uint8 district) external pure returns (address) {
        if (district >= DISTRICT_COUNT) revert BadDistrict();
        return _districtAsset(district);
    }

    /// @notice Tax/ops BNB in; 10% ops fee, 90% split into pendingBnb by sold plots.
    /// @dev Portal direct sends are ignored (same pattern as DynamicBackstopVault).
    receive() external payable {
        if (msg.value == 0) return;
        if (msg.sender == address(flapPortal)) return;

        totalTaxReceived += msg.value;
        uint256 vaultNet = _routeOpsFee(msg.value);
        if (vaultNet == 0) return;

        _distributeToPlots(vaultNet);
        emit TreasuryFunded(msg.sender, vaultNet);
    }

    /// @dev Route OPS_FEE_BPS of inbound BNB to opsTreasury; return vault net for dividends.
    /// @dev If opsTreasury is address(0), skip fee and keep full gross for dividends.
    /// @dev If the opsTreasury BNB transfer fails, degrade: do not revert 鈥?keep full gross
    ///      for dividend buckets so tax inflow cannot be frozen by a bad ops address.
    function _routeOpsFee(uint256 grossWei) private returns (uint256 vaultNetWei) {
        vaultNetWei = grossWei;
        if (grossWei == 0 || opsTreasury == address(0)) return vaultNetWei;

        uint256 feeWei = (grossWei * OPS_FEE_BPS) / BPS_DENOM;
        if (feeWei == 0) return vaultNetWei;

        (bool ok, ) = opsTreasury.call{value: feeWei}("");
        if (!ok) {
            emit OpsFeeSkipped(opsTreasury, feeWei);
            return grossWei;
        }

        vaultNetWei = grossWei - feeWei;
        totalOpsBnbPaid += feeWei;
        emit OpsFeePaid(opsTreasury, feeWei, vaultNetWei);
    }

    /// @notice Owner or Guardian: update ops treasury.
    function setOpsTreasury(address to) external {
        _requireOwnerOrGuardian();
        address prev = opsTreasury;
        opsTreasury = to;
        emit OpsTreasuryUpdated(prev, to);
    }

    /// @notice Owner or Guardian: transfer contract ownership (Guardian backup if owner key is lost).
    function transferOwnership(address next) external {
        _requireOwnerOrGuardian();
        if (next == address(0)) revert ZeroOwner();
        address prev = owner;
        owner = next;
        emit OwnershipTransferred(prev, next);
    }

    function _requireGuardian() private view {
        if (msg.sender != _getGuardian()) revert NotGuardian();
    }

    /// @notice Guardian-only rescue for excess native BNB (cannot touch dividend buckets).
    /// @dev Reserved = sum of pendingBnb + bufferedBnb (outstandingRewards).
    function emergencyWithdrawNative(address to, uint256 amount) external nonReentrant {
        _requireGuardian();
        if (to == address(0)) revert ZeroAddress();
        if (amount == 0) revert WrongPayment();
        uint256 reserved = outstandingRewards();
        if (address(this).balance < reserved + amount) revert EmergencyReserve();
        (bool ok, ) = to.call{value: amount}("");
        if (!ok) revert RewardPayFailed();
        emit EmergencyWithdraw(msg.sender, to, address(0), amount);
    }

    /// @notice Guardian-only rescue for ERC20. District stock cannot go below unclaimed accrual.
    function emergencyWithdrawToken(address token, address to, uint256 amount) external nonReentrant {
        _requireGuardian();
        if (to == address(0) || token == address(0)) revert ZeroAddress();
        if (amount == 0) revert WrongPayment();

        for (uint256 d = 0; d < DISTRICT_COUNT; d++) {
            if (token != _districtAsset(d)) continue;
            uint256 unclaimed = totalStockDistributed[d] - totalStockClaimed[d] + gamePool[d];
            uint256 bal = IERC20(token).balanceOf(address(this));
            if (bal < unclaimed + amount) revert EmergencyReserve();
            break;
        }

        IERC20(token).safeTransfer(to, amount);
        emit EmergencyWithdraw(msg.sender, to, token, amount);
    }

    /// @dev Split amount (+ buffer) across 9 district pendingBnb buckets by sold share.
    function _distributeToPlots(uint256 amount) private {
        if (soldPlots == 0) {
            bufferedBnb += amount;
            return;
        }
        uint256 total = amount + bufferedBnb;
        if (total == 0) return;
        uint256 assigned;
        for (uint256 d = 0; d < DISTRICT_COUNT; d++) {
            uint256 sold = soldInDistrict[d];
            if (sold == 0) continue;
            uint256 share = (total * sold) / soldPlots;
            pendingBnb[d] += share;
            assigned += share;
        }
        bufferedBnb = total - assigned;
    }

    // ---------------- keeper: sell stock for district BNB ----------------

    /// @dev Fair BNB for stockAmount via Chainlink + NAV multiplier + 1.02x premium.
    function quoteStockForBnb(uint8 district, uint256 stockAmount) public view returns (uint256 bnbWei) {
        if (district >= DISTRICT_COUNT) revert BadDistrict();
        if (stockAmount == 0) return 0;

        uint256 stockUsd = _readFeed(_districtFeed(district)); // 1e18
        uint256 bnbUsd = _readFeed(BNB_USD_FEED);               // 1e18
        uint256 multiplier = _navMultiplier(_districtAsset(district));

        // stockAmount (1e18) -> USD -> BNB, then * 1.02
        bnbWei = (stockAmount * stockUsd) / 1e18;
        bnbWei = (bnbWei * multiplier) / 1e18;
        bnbWei = (bnbWei * 1e18) / bnbUsd;
        bnbWei = (bnbWei * KEEPER_QUOTE_BPS) / BPS_DENOM;
    }

    /// @notice Keeper sells district stock to vault; pays from pendingBnb.
    /// @dev Accrues stock to plots; owners claim later.
    ///      Callers who own any plot in `district` are banned (blocks self-deal drain).
    function sellStockToVault(uint8 district, uint256 stockAmount) external nonReentrant {
        if (district >= DISTRICT_COUNT) revert BadDistrict();
        if (plotsOwnedInDistrict[district][msg.sender] != 0) revert SellerOwnsDistrictPlot();
        uint256 sold = soldInDistrict[district];
        if (sold == 0) revert NoPlotsInDistrict();
        if (stockAmount == 0) revert WrongPayment();

        uint256 bnbOwed = quoteStockForBnb(district, stockAmount);
        if (bnbOwed == 0) revert ZeroSpotPrice();
        if (bnbOwed > pendingBnb[district]) revert InsufficientDistrictBnb();

        IERC20(_districtAsset(district)).safeTransferFrom(msg.sender, address(this), stockAmount);

        pendingBnb[district] -= bnbOwed;

        // Route a fixed share of every permissionless refill into the map reward pool.
        uint256 gameCut = (stockAmount * gameBps) / BPS_DENOM;
        uint256 plotCut = stockAmount - gameCut;
        if (gameCut != 0) {
            gamePool[district] += gameCut;
            totalGameFunded[district] += gameCut;
            emit GamePoolFunded(district, gameCut);
        }
        if (plotCut != 0) {
            accPerPlot[district] += (plotCut * ACC_PRECISION) / sold;
            totalStockDistributed[district] += plotCut;
        }

        (bool ok, ) = msg.sender.call{value: bnbOwed}("");
        if (!ok) revert RewardPayFailed();

        emit StockSoldToVault(msg.sender, district, _districtAsset(district), stockAmount, bnbOwed);
    }

    /// @dev Read Chainlink answer as 1e18 USD.
    function _readFeed(address feed) private view returns (uint256 price1e18) {
        (, int256 answer,, uint256 updatedAt,) = IAggregatorV3(feed).latestRoundData();
        if (answer <= 0) revert BadFeedAnswer();
        if (block.timestamp > updatedAt + MAX_PRICE_STALENESS) revert StalePriceFeed();
        uint8 dec = IAggregatorV3(feed).decimals();
        price1e18 = uint256(answer) * (10 ** (18 - uint256(dec)));
    }

    /// @dev Flap NAV multiplier in [1e18, MAX_NAV_MULTIPLIER]; else 1e18.
    function _navMultiplier(address asset) private view returns (uint256) {
        if (block.chainid != 56) return 1e18;
        try IFlapStocksRegistry(FLAP_STOCKS_REGISTRY).getMultiplier(asset) returns (uint256 m) {
            if (m < 1e18) return 1e18;
            if (m > MAX_NAV_MULTIPLIER) return MAX_NAV_MULTIPLIER;
            return m;
        } catch {
            return 1e18;
        }
    }

    function _wbnb() private view returns (address) {
        uint256 c = block.chainid;
        if (c == 56) return 0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c;
        if (c == 97) return 0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd;
        revert UnsupportedChain(c);
    }

    // ---------------- Portal / pricing ----------------

    /// @dev Token status + pool for UI (internal market vs DEX).
    function marketMeta() external view returns (uint8 status, address pool) {
        _requireToken();
        IFlapPortal.TokenStateV8Safe memory s = flapPortal.getTokenV8Safe(address(projectToken));
        return (s.status, s.pool);
    }

    /// @dev Project token price in BNB wei (Portal internal or Pancake reserves).
    function tokenPriceBnbWei() public view returns (uint256 priceWeiPerToken) {
        _requireToken();
        IFlapPortal.TokenStateV8Safe memory s = flapPortal.getTokenV8Safe(address(projectToken));
        if (s.status != 1 && s.status != 4) revert BadTokenStatus();
        if (s.status == 1) {
            if (s.price == 0) revert ZeroSpotPrice();
            return s.price;
        }
        if (s.pool == address(0)) revert NoPool();
        address wbnb = _wbnb();
        (uint112 r0, uint112 r1,) = IPancakePair(s.pool).getReserves();
        address t0 = IPancakePair(s.pool).token0();
        (uint256 reserveBnb, uint256 reserveTok) = t0 == wbnb
            ? (uint256(r0), uint256(r1))
            : (uint256(r1), uint256(r0));
        if (reserveBnb == 0 || reserveTok == 0) revert EmptyReserves();
        uint8 tokDec = IERC20Metadata(address(projectToken)).decimals();
        priceWeiPerToken = (reserveBnb * (10 ** uint256(tokDec))) / reserveTok;
        if (priceWeiPerToken == 0) revert ZeroSpotPrice();
    }

    /// @dev BNB value of one primary plot purchase (500_000 tokens).
    function plotPriceBnb() public view returns (uint256 bnbWei) {
        _requireToken();
        uint8 tokDec = IERC20Metadata(address(projectToken)).decimals();
        bnbWei = plotPrice * tokenPriceBnbWei() / (10 ** uint256(tokDec));
    }

    /// @notice Buy empty plot; burns plotPrice tokens (approve first).
    /// @dev Subject to wallet cap, global 30s rate limit, and MAX_MINT_PER_TX.
    function buyWithToken(uint256 plotId) external nonReentrant {
        _enforceAndRecordPrimaryMint(1);
        _burnPayment(plotPrice);
        _buyOne(plotId);
        emit PlotBought(msg.sender, plotId, plotPrice);
    }

    function buy(uint256 plotId) external nonReentrant {
        _enforceAndRecordPrimaryMint(1);
        _burnPayment(plotPrice);
        _buyOne(plotId);
        emit PlotBought(msg.sender, plotId, plotPrice);
    }

    function buyManyWithToken(uint256[] calldata plotIds) external nonReentrant {
        uint256 n = plotIds.length;
        if (n == 0) revert WrongPayment();
        _enforceAndRecordPrimaryMint(n);
        _burnPayment(plotPrice * n);
        for (uint256 i = 0; i < n; i++) {
            _buyOne(plotIds[i]);
            emit PlotBought(msg.sender, plotIds[i], plotPrice);
        }
    }

    /// @dev Earliest timestamp any wallet may primary-mint again under the global rate limit
    ///      (0 if ready / never minted globally).
    function nextGlobalPrimaryMintAt() public view returns (uint256) {
        uint64 last = lastGlobalPrimaryMintAt;
        if (last == 0) return 0;
        uint256 unlock = uint256(last) + GLOBAL_MINT_COOLDOWN;
        return block.timestamp >= unlock ? 0 : unlock;
    }

    /// @dev Cap + per-tx + global rate limit for genesis buys only (not flip/secondary).
    function _enforceAndRecordPrimaryMint(uint256 n) private {
        if (n > MAX_MINT_PER_TX) revert MintBatchTooLarge();
        uint256 minted = primaryMintCount[msg.sender];
        if (minted + n > MAX_PRIMARY_PLOTS_PER_WALLET) revert MintCapExceeded();
        uint64 lastGlobal = lastGlobalPrimaryMintAt;
        if (lastGlobal != 0 && block.timestamp < uint256(lastGlobal) + GLOBAL_MINT_COOLDOWN) {
            revert GlobalMintCooldownActive();
        }
        primaryMintCount[msg.sender] = minted + n;
        lastGlobalPrimaryMintAt = uint64(block.timestamp);
    }

    function _burnPayment(uint256 amount) private {
        _requireToken();
        projectToken.safeTransferFrom(msg.sender, BURN_ADDRESS, amount);
        totalBurned += amount;
        emit TokensBurned(msg.sender, amount);
    }

    function _buyOne(uint256 plotId) private {
        if (plotId >= totalPlots) revert InvalidPlot();
        uint8 d = districtOf(plotId);
        // Snapshot rewardDebt at purchase.
        _plots[plotId] = PlotState({
            mintedAt: uint64(block.timestamp),
            acquiredAt: uint64(block.timestamp),
            accrued: 0,
            rewardDebt: accPerPlot[d],
            rewardDebtToken: accTokenPerPlot[d]
        });
        flipPrice[plotId] = plotPrice;
        soldPlots += 1;
        soldInDistrict[d] += 1;
        _safeMint(msg.sender, plotId);
    }

    function list(uint256 plotId, uint256 price) external nonReentrant {
        if (ownerOf(plotId) != msg.sender) revert NotPlotOwner();
        if (price == 0) revert ZeroPrice();
        listingPrice[plotId] = price;
        emit PlotListed(msg.sender, plotId, price);
    }

    function cancelList(uint256 plotId) external nonReentrant {
        if (ownerOf(plotId) != msg.sender) revert NotPlotOwner();
        if (listingPrice[plotId] == 0) revert NotListed();
        listingPrice[plotId] = 0;
        emit ListingCancelled(msg.sender, plotId);
    }

    /// @dev Flip cost = max(base, plotPrice) * 130%; listing may undercut.
    function flipQuote(uint256 plotId)
        public
        view
        returns (uint256 price, uint256 sellerProceeds, bool viaListing, uint256 flipAvailableAt)
    {
        uint256 base = flipPrice[plotId];
        if (base < plotPrice) base = plotPrice;
        uint256 flipCost = (base * FLIP_PREMIUM_BPS) / BPS_DENOM;
        uint256 ask = listingPrice[plotId];
        viaListing = ask != 0 && ask <= flipCost;
        if (viaListing) {
            price = ask;
            sellerProceeds = (price * (BPS_DENOM - SALE_TAX_BPS)) / BPS_DENOM;
            flipAvailableAt = 0; // listing buys ignore flip cooldown
        } else {
            price = flipCost;
            sellerProceeds = (base * FLIP_SELLER_BPS) / BPS_DENOM;
            uint256 unlockAt = uint256(_plots[plotId].acquiredAt) + FLIP_COOLDOWN;
            flipAvailableAt = block.timestamp >= unlockAt ? 0 : unlockAt;
        }
    }

    /// @notice Force-buy or take listing; burns flip spread (approve first).
    /// @param maxPrice Slippage cap: revert if execution price > maxPrice.
    function flipBuy(uint256 plotId, uint256 maxPrice) external nonReentrant {
        _requireToken();
        address seller = ownerOf(plotId);
        if (seller == msg.sender) revert SelfTransfer();

        (uint256 price, uint256 sellerProceeds, bool viaListing, uint256 flipAvailableAt) = flipQuote(plotId);
        if (price > maxPrice) revert PriceExceedsMax();
        if (!viaListing && flipAvailableAt != 0) revert FlipCooldown();

        listingPrice[plotId] = 0;
        _transfer(seller, msg.sender, plotId);
        flipPrice[plotId] = price;

        uint256 fee = price - sellerProceeds;
        projectToken.safeTransferFrom(msg.sender, seller, sellerProceeds);
        if (fee > 0) {
            projectToken.safeTransferFrom(msg.sender, BURN_ADDRESS, fee);
            totalSaleTax += fee;
            emit TokensBurned(msg.sender, fee);
        }

        emit PlotFlipped(seller, msg.sender, plotId, price, fee, viaListing);
    }

    function _update(address to, uint256 tokenId, address auth) internal override returns (address) {
        address from = _ownerOf(tokenId);
        if (from != address(0) && to != address(0) && from == to) revert SelfTransfer();
        if (listingPrice[tokenId] != 0) {
            listingPrice[tokenId] = 0;
            if (from != address(0)) {
                emit ListingCancelled(from, tokenId);
            }
        }
        // Issue2 fix: pay unclaimed district stock to the previous owner BEFORE the deed moves.
        // Applies to flipBuy, listing takes, and normal ERC721 transfers.
        if (from != address(0) && to != address(0) && from != to) {
            _payoutPendingStock(tokenId, from);
        }
        // Track per-district ownership for sellStockToVault self-deal ban.
        if (tokenId < totalPlots) {
            uint8 d = districtOf(tokenId);
            if (from != address(0)) {
                plotsOwnedInDistrict[d][from] -= 1;
            }
            if (to != address(0)) {
                plotsOwnedInDistrict[d][to] += 1;
            }
        }
        address prev = super._update(to, tokenId, auth);
        if (to != address(0)) {
            _plots[tokenId].acquiredAt = uint64(block.timestamp);
        }
        if (from != address(0) && to != address(0) && from != to) {
            emit PlotTransferred(from, to, tokenId);
        }
        return prev;
    }

    // ---------------- map game: voucher claim ----------------

    /// @notice Owner or Guardian: configure the map reward pool.
    /// @param bps_ Share of each keeper refill routed to the map pool (max MAX_GAME_BPS).
    /// @param signer_ Voucher signer (address(0) disables claims).
    /// @param paused_ Halt map claims.
    function setGameConfig(uint16 bps_, address signer_, bool paused_) external {
        _requireOwnerOrGuardian();
        if (bps_ > MAX_GAME_BPS) revert BadGameBps();
        gameBps = bps_;
        gameSigner = signer_;
        gamePaused = paused_;
        emit GameConfigUpdated(bps_, signer_, paused_);
    }

    /// @notice Owner or Guardian: per-district daily payout ceiling (stock units, 18 decimals).
    function setGameDailyCap(uint8 district, uint256 cap) external {
        _requireOwnerOrGuardian();
        if (district >= DISTRICT_COUNT) revert BadDistrict();
        gameDailyCap[district] = cap;
        emit GameDailyCapUpdated(district, cap);
    }

    /// @dev EIP-712 domain separator, computed live so it stays correct behind a proxy.
    function gameDomainSeparator() public view returns (bytes32) {
        return keccak256(
            abi.encode(
                keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"),
                keccak256(bytes("WallStreetCity")),
                keccak256(bytes("1")),
                block.chainid,
                address(this)
            )
        );
    }

    /// @notice Digest a walk-to-store voucher for off-chain signing / verification.
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

    /// @notice Redeem a signed walk-to-store voucher. Anyone may relay; stock always goes to `to`.
    function claimGameVoucher(
        address to,
        uint8 district,
        uint256 amount,
        bytes32 spawnId,
        uint256 nonce,
        uint256 deadline,
        bytes calldata signature
    ) external nonReentrant {
        if (gamePaused) revert GamePaused();
        if (gameSigner == address(0)) revert GameSignerUnset();
        if (district >= DISTRICT_COUNT) revert BadDistrict();
        if (to == address(0)) revert ZeroAddress();
        if (amount == 0) revert NothingToClaim();
        if (block.timestamp > deadline) revert GameVoucherExpired();
        if (gameNonceUsed[nonce]) revert GameNonceUsed();

        bytes32 digest = gameVoucherDigest(to, district, amount, spawnId, nonce, deadline);
        if (_recoverSigner(digest, signature) != gameSigner) revert BadGameSignature();

        if (amount > gamePool[district]) revert GamePoolEmpty();

        uint256 today = block.timestamp / 1 days;
        if (gameDaySpentAt[district] != today) {
            gameDaySpentAt[district] = today;
            gameDaySpent[district] = 0;
        }
        uint256 spent = gameDaySpent[district] + amount;
        if (spent > gameDailyCap[district]) revert GameCapExceeded();

        gameNonceUsed[nonce] = true;
        gameDaySpent[district] = spent;
        gamePool[district] -= amount;
        totalGamePaid[district] += amount;

        address stock = _districtAsset(district);
        IERC20(stock).safeTransfer(to, amount);
        emit GameRewardClaimed(to, district, spawnId, stock, amount, nonce);
    }

    /// @dev ECDSA recovery with low-s / valid-v enforcement (no malleable signatures).
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

    /// @notice Map pool status for the UI / proof-of-reserves page.
    function gameDistrictInfo(uint8 district)
        external
        view
        returns (address stock, uint256 pool, uint256 dailyCap, uint256 spentToday, uint256 funded, uint256 paid)
    {
        if (district >= DISTRICT_COUNT) revert BadDistrict();
        stock = _districtAsset(district);
        pool = gamePool[district];
        dailyCap = gameDailyCap[district];
        spentToday = gameDaySpentAt[district] == block.timestamp / 1 days ? gameDaySpent[district] : 0;
        funded = totalGameFunded[district];
        paid = totalGamePaid[district];
    }

    function claim(uint256 plotId) external nonReentrant {
        _claimOne(plotId);
    }

    function claimMany(uint256[] calldata plotIds) external nonReentrant {
        for (uint256 i = 0; i < plotIds.length; i++) {
            _claimOne(plotIds[i]);
        }
    }

    function _claimOne(uint256 plotId) private {
        if (ownerOf(plotId) != msg.sender) revert NotPlotOwner();
        uint256 stockOwed = _payoutPendingStock(plotId, msg.sender);
        if (stockOwed == 0) revert NothingToClaim();
    }

    /// @dev Pays pending district stock for `plotId` to `recipient` and zeros the plot accrual.
    ///      Returns the stock amount paid (0 if nothing pending). Does not check NFT ownership.
    function _payoutPendingStock(uint256 plotId, address recipient) private returns (uint256 stockOwed) {
        PlotState storage p = _plots[plotId];
        if (p.mintedAt == 0) return 0;

        uint8 d = districtOf(plotId);
        stockOwed = uint256(p.accrued) + (accPerPlot[d] - p.rewardDebt) / ACC_PRECISION;
        if (stockOwed == 0) {
            // Keep debts aligned even when nothing is owed.
            p.rewardDebt = accPerPlot[d];
            p.rewardDebtToken = accTokenPerPlot[d];
            return 0;
        }

        p.accrued = 0;
        p.rewardDebt = accPerPlot[d];
        p.rewardDebtToken = accTokenPerPlot[d];

        totalStockClaimed[d] += stockOwed;
        IERC20(_districtAsset(d)).safeTransfer(recipient, stockOwed);
        emit RewardClaimed(recipient, plotId, _districtAsset(d), stockOwed, 0);
    }

    function pendingReward(uint256 plotId) public view returns (uint256) {
        PlotState storage p = _plots[plotId];
        if (p.mintedAt == 0) return 0;
        uint8 d = districtOf(plotId);
        return uint256(p.accrued) + (accPerPlot[d] - p.rewardDebt) / ACC_PRECISION;
    }

    /// @dev Always 0; kept for ABI/storage compatibility (no token dividends).
    function pendingTokenReward(uint256 plotId) public view returns (uint256) {
      PlotState storage p = _plots[plotId];
      if (p.mintedAt == 0) return 0;
      uint8 d = districtOf(plotId);
      return (accTokenPerPlot[d] - p.rewardDebtToken) / ACC_PRECISION;
  }

    function plotInfo(uint256 plotId)
        external
        view
        returns (address plotOwner, uint256 x, uint256 y, uint256 mintedAt, uint256 pending, uint256 pendingToken)
    {
        if (plotId >= totalPlots) revert InvalidPlot();
        plotOwner = _ownerOf(plotId);
        x = plotId % gridSize;
        y = plotId / gridSize;
        mintedAt = _plots[plotId].mintedAt;
        pending = pendingReward(plotId);
        pendingToken = pendingTokenReward(plotId);
    }

    /// @dev Batch plot owners, stock pendings, listing/flip prices, acquiredAts.
    ///      tokenPendings are unused (always 0).
    function plotsInfo(uint256 offset, uint256 limit)
        external
        view
        returns (
            address[] memory owners,
            uint256[] memory pendings,
            uint256[] memory tokenPendings,
            uint256[] memory prices,
            uint256[] memory flipPrices,
            uint256[] memory acquiredAts
        )
    {
        uint256 end = offset + limit;
        if (end > totalPlots) end = totalPlots;
        uint256 n = end > offset ? end - offset : 0;
        owners = new address[](n);
        pendings = new uint256[](n);
        tokenPendings = new uint256[](n);
        prices = new uint256[](n);
        flipPrices = new uint256[](n);
        acquiredAts = new uint256[](n);
        for (uint256 i = 0; i < n; i++) {
            uint256 plotId = offset + i;
            owners[i] = _ownerOf(plotId);
            pendings[i] = pendingReward(plotId);
            tokenPendings[i] = pendingTokenReward(plotId);
            prices[i] = listingPrice[plotId];
            flipPrices[i] = flipPrice[plotId];
            acquiredAts[i] = _plots[plotId].acquiredAt;
        }
    }

    /// @dev Vault BNB balance (reward reserve).
    function rewardReserve() public view returns (uint256) {
        return address(this).balance;
    }

    /// @dev Sum of pendingBnb buckets + bufferedBnb (owed to future stock accrual).
    function outstandingRewards() public view returns (uint256 totalPending) {
        for (uint256 d = 0; d < DISTRICT_COUNT; d++) {
            totalPending += pendingBnb[d];
        }
        totalPending += bufferedBnb;
    }

    /// @dev Reserve vs outstanding BNB buckets; solvent if reserve >= outstanding.
    function treasuryStatus()
        external
        view
        returns (uint256 reserve, uint256 outstanding, bool solvent)
    {
        reserve = rewardReserve();
        outstanding = outstandingRewards();
        solvent = reserve >= outstanding;
    }

    /// @dev Vault BNB balance valued via Chainlink BNB/USD (1e18).
    function reserveUsd() external view returns (uint256 usd1e18) {
        uint256 bal = address(this).balance;
        if (bal == 0) return 0;
        uint256 bnbUsd = _readFeed(BNB_USD_FEED);
        usd1e18 = (bal * bnbUsd) / 1e18;
    }

    /// @dev Stock amount valued via district Chainlink feed (1e18 USD).
    function stockValueUsd(uint8 district, uint256 stockAmount) external view returns (uint256 usd1e18) {
        if (district >= DISTRICT_COUNT) revert BadDistrict();
        if (stockAmount == 0) return 0;
        uint256 stockUsd = _readFeed(_districtFeed(district));
        usd1e18 = (stockAmount * stockUsd) / 1e18;
    }

    /// @dev BNB + held stock balances valued in USD (1e18).
    function totalAssetsUsd() external view returns (uint256 usd1e18) {
        uint256 bal = address(this).balance;
        if (bal > 0) {
            usd1e18 = (bal * _readFeed(BNB_USD_FEED)) / 1e18;
        }
        for (uint256 d = 0; d < DISTRICT_COUNT; d++) {
            address stock = _districtAsset(d);
            if (stock == address(0)) continue;
            uint256 stockBal = IERC20(stock).balanceOf(address(this));
            if (stockBal == 0) continue;
            usd1e18 += (stockBal * _readFeed(_districtFeed(d))) / 1e18;
        }
    }

    // ---------------- Flap VaultBaseV2 ----------------

    /// @dev Project / tax token address for Flap host.
    function taxToken() external view returns (address) {
        return address(projectToken);
    }

    function description() public view override returns (string memory) {
        return string(
            abi.encodePacked(
                "Wall Street City: 9 stock districts, all-token land; ",
                "tax BNB 10% ops + 90% equal-per-plot stock dividends; ",
                "15% flip spread burned; soldPlots=",
                soldPlots.toString(),
                " opsPaidWei=",
                totalOpsBnbPaid.toString()
            )
        );
    }

    function vaultUISchema() public pure override returns (VaultUISchema_1 memory schema) {
        schema.vaultType = "WallStreetCity";
        schema.description =
            "Wall Street City land vault. Buy/flip with project token (flip spread burned); claim stock dividends; keeper sells stock for district BNB.";

        schema.methods = new VaultMethodSchema_1[](4);

        schema.methods[0].name = "buyWithToken";
        schema.methods[0].description =
            "Buy an empty plot; burns 500000 project tokens. Max 5/wallet, 1/tx, 30s global rate limit.";
        schema.methods[0].isWriteMethod = true;
        schema.methods[0].inputs = new FieldDescriptor_1[](1);
        schema.methods[0].inputs[0] = FieldDescriptor_1("plotId", "uint256", "Plot id", 0);
        schema.methods[0].approvals = new ApproveAction_1[](1);
        schema.methods[0].approvals[0] = ApproveAction_1("taxToken", "plotPrice");

        schema.methods[1].name = "flipBuy";
        schema.methods[1].description =
            "Force-buy or take a listing with project tokens. Pass maxPrice as slippage cap.";
        schema.methods[1].isWriteMethod = true;
        schema.methods[1].inputs = new FieldDescriptor_1[](2);
        schema.methods[1].inputs[0] = FieldDescriptor_1("plotId", "uint256", "Plot id", 0);
        schema.methods[1].inputs[1] = FieldDescriptor_1("maxPrice", "uint256", "Max acceptable price (slippage)", 18);
        schema.methods[1].approvals = new ApproveAction_1[](1);
        schema.methods[1].approvals[0] = ApproveAction_1("taxToken", "price");

        schema.methods[2].name = "claim";
        schema.methods[2].description = "Claim stock dividends for one plot. Transfers/flips auto-pay unclaimed stock to the previous owner first.";
        schema.methods[2].isWriteMethod = true;
        schema.methods[2].inputs = new FieldDescriptor_1[](1);
        schema.methods[2].inputs[0] = FieldDescriptor_1("plotId", "uint256", "Plot id", 0);

        schema.methods[3].name = "sellStockToVault";
        schema.methods[3].description =
            "Keeper only: sell district stock for BNB. Reverts if caller owns any plot in that district.";
        schema.methods[3].isWriteMethod = true;
        schema.methods[3].inputs = new FieldDescriptor_1[](2);
        schema.methods[3].inputs[0] = FieldDescriptor_1("district", "uint8", "District 0-8", 0);
        schema.methods[3].inputs[1] = FieldDescriptor_1("stockAmount", "uint256", "Stock amount (1e18)", 18);
    }

    function tokenURI(uint256 plotId) public view override returns (string memory) {
        _requireOwned(plotId);
        uint256 x = plotId % gridSize;
        uint256 y = plotId / gridSize;
        uint256 d = districtOf(plotId);
        return string(
            abi.encodePacked(
                "data:application/json;utf8,",
                '{"name":"Wall Street Plot #', plotId.toString(),
                '","description":"One block of Wall Street City. Stock dividends stay with the deed.",',
                '"attributes":[{"trait_type":"x","value":', x.toString(),
                '},{"trait_type":"y","value":', y.toString(),
                '},{"trait_type":"district","value":', d.toString(), "}]}"
            )
        );
    }

    /// @dev Reserved for future upgrades (OZ storage gap).
    ///      Reduced by 2 for primaryMintCount + lastGlobalPrimaryMintAt.
    uint256[37] private __gap;
}

// src/WallStreetCityBeacon.sol

/// @title WallStreetCityBeaconFactory
/// @notice FreeCoinVaultBeaconFactory-style Flap factory: Factory owns the beacon.
/// @dev Remix: deploy ONLY `WallStreetCityBeaconFactory(devAddress)` — constructor
///      internally `new`s the implementation + `UpgradeableBeacon(impl, address(this))`.
///      Upgrade authority is Guardian-only via `upgradeVaultImplementation` (zero exceptions:
///      no deployer EOA / multisig / separate beacon owner). Dual gate on `newVault`:
///        A) msg.sender == VaultPortal
///        B) creator    == devAddress (immutable whitelist)
contract WallStreetCityBeaconFactory is VaultFactoryBaseV2 {
    /// @notice Only this creator may launch via Portal (immutable at deploy).
    address public immutable devAddress;
    /// @notice UpgradeableBeacon owned by this factory (never an external initialOwner).
    address public immutable beacon;

    address[] public allVaults;

    event VaultCreated(
        address indexed vault,
        address indexed taxToken,
        address indexed creator,
        address opsWallet
    );
    event VaultImplementationUpgraded(address indexed previousImplementation, address indexed newImplementation);
    event VaultUpgradesLocked(address indexed beacon);

    error NotAuthorizedDev(address creator);
    error ZeroDev();
    error OnlyGuardian();

    /// @param _devAddress Whitelisted Flap creator (must match Portal-injected creator).
    constructor(address _devAddress) {
        if (_devAddress == address(0)) revert ZeroDev();
        devAddress = _devAddress;

        WallStreetCityUpgradeable impl = new WallStreetCityUpgradeable();
        // OZ v5 requires initialOwner; factory itself is the only beacon owner.
        beacon = address(new UpgradeableBeacon(address(impl), address(this)));
    }

    /// @param taxToken  Predicted tax token from VaultPortal (may not exist yet).
    /// @param creator   Launch creator from Portal — must equal `devAddress`.
    /// @param vaultData abi.encode(address opsWallet); 0 / empty => opsWallet = creator.
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
                abi.encodeCall(
                    WallStreetCityUpgradeable.initialize, (creator, taxToken, opsWallet)
                )
            )
        );
        allVaults.push(vault);
        emit VaultCreated(vault, taxToken, creator, opsWallet);
    }

    /// @notice Guardian-only: upgrade the shared beacon implementation for all proxies.
    function upgradeVaultImplementation(address newImplementation) external {
        if (msg.sender != _getGuardian()) revert OnlyGuardian();
        address prev = UpgradeableBeacon(beacon).implementation();
        UpgradeableBeacon(beacon).upgradeTo(newImplementation);
        emit VaultImplementationUpgraded(prev, newImplementation);
    }

    /// @notice Guardian-only: permanently renounce beacon ownership (irreversible).
    function lockVaultUpgrades() external {
        if (msg.sender != _getGuardian()) revert OnlyGuardian();
        UpgradeableBeacon(beacon).renounceOwnership();
        emit VaultUpgradesLocked(beacon);
    }

    /// @notice True once `lockVaultUpgrades` renounced beacon ownership to address(0).
    function isVaultUpgradesLocked() external view returns (bool locked) {
        locked = UpgradeableBeacon(beacon).owner() == address(0);
    }

    function isQuoteTokenSupported(address quoteToken) external pure override returns (bool supported) {
        supported = quoteToken == address(0);
    }

    function vaultCount() external view returns (uint256) {
        return allVaults.length;
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
            return (false, "WallStreetCity supports native BNB quote only.");
        }
        return (true, "");
    }

    function vaultDataSchema() public pure override returns (VaultDataSchema memory schema) {
        schema.description =
            "Beacon-proxied WallStreetCity land vault (24x24). "
            "Factory owns the beacon; upgrades are Guardian-only. "
            "Address-gated launch: only whitelisted creator may launch. "
            "opsWallet receives 10% of inbound tax BNB (0 => creator).";
        schema.fields = new FieldDescriptor_0[](1);
        schema.fields[0] = FieldDescriptor_0(
            "opsWallet",
            "address",
            "Ops treasury (10% tax BNB). Use 0 to default to creator.",
            0
        );
        schema.isArray = false;
    }
}