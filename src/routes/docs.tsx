import { createFileRoute, Link } from "@tanstack/react-router";
import { Section, Panel } from "@/components/site/Section";
import { RULES } from "@/lib/game.functions";
import { CHAIN, TOKENS, VAULT_ADDRESS } from "@/lib/tokens";

export const Route = createFileRoute("/docs")({
  head: () => ({
    meta: [
      { title: "Docs — contracts, endpoints and rules" },
      {
        name: "description",
        content:
          "The vault contract interface, the claim endpoints, the spawn rules, the token list and the fee split, on BNB Smart Chain.",
      },
      { property: "og:title", content: "Touch Grass docs" },
      { property: "og:description", content: "Everything an integrator or a sceptic needs." },
    ],
  }),
  component: Docs,
});

function Code({ children }: { children: string }) {
  return (
    <pre className="mt-4 overflow-x-auto rounded-2xl bg-foreground/5 p-5 font-mono text-xs leading-relaxed text-foreground/80">
      {children}
    </pre>
  );
}

function Docs() {
  return (
    <>
      <Section
        eyebrow="docs"
        title="The whole machine, written down."
        lead="Nothing here needs an account. Everything on this page can be checked against the chain."
        className="mt-10"
      />

      <Section title="Chain and addresses">
        <Panel className="mt-6">
          <dl className="grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="label-caps text-[10px] text-muted-foreground">Network</dt>
              <dd>
                {CHAIN.name} — chain id {CHAIN.id} ({CHAIN.hexId})
              </dd>
            </div>
            <div>
              <dt className="label-caps text-[10px] text-muted-foreground">RPC</dt>
              <dd className="font-mono text-xs break-all">{CHAIN.rpc}</dd>
            </div>
            <div>
              <dt className="label-caps text-[10px] text-muted-foreground">Explorer</dt>
              <dd className="font-mono text-xs break-all">{CHAIN.explorer}</dd>
            </div>
            <div>
              <dt className="label-caps text-[10px] text-muted-foreground">Vault</dt>
              <dd className="font-mono text-xs break-all">{VAULT_ADDRESS}</dd>
            </div>
          </dl>
        </Panel>
      </Section>

      <Section title="Vault contract">
        <Panel className="mt-6">
          <p className="text-sm leading-relaxed text-foreground/70">
            The vault never mints. It holds BEP-20 stock tokens and releases them against an
            EIP-712 voucher signed by the claim key. Nonces are burned on use, deadlines are
            enforced, and the owner can pause and rotate the signer.
          </p>
          <Code>{`// EIP-712 domain
name: "TouchGrassVault"  version: "1"
chainId: ${CHAIN.id}       verifyingContract: <vault>

struct Voucher {
  address to; address token; uint256 amount;
  bytes32 spawnId; uint256 nonce; uint256 deadline;
}

function claim(Voucher v, bytes signature) external;
function used(uint256 nonce) external view returns (bool);
function setSigner(address newSigner) external onlyOwner;
function pause() / unpause() external onlyOwner;
function sweep(address token, uint256 amount) external onlyOwner;`}</Code>
        </Panel>
      </Section>

      <Section title="Endpoints">
        <Panel className="mt-6">
          <Code>{`GET  spawns   { lat, lng, limit? }
     -> { spawns: [{ id, symbol, amount, rarity, city, place, lat, lng }], total }

POST claim    { address, spawnId, lat, lng, accuracy, deviceId,
                samples: [{ lat, lng, accuracy, epochMs }], motion, tzOffsetMin }
     -> { ok, mode, voucher, signature, contract, chainId }
     -> { ok: false, error }   // one human sentence, 4xx

GET  claims   { address? }  -> recent catches
GET  vault    -> { vault, live, balances[], payableDrops, checkedAt }
GET  legendary -> { next, past }
POST legendary/claim { address, lat, lng, accuracy, code }
POST early-access    { email, kind, city?, company? }`}</Code>
        </Panel>
      </Section>

      <Section title="Rules, as numbers">
        <Panel className="mt-6 overflow-x-auto p-0 sm:p-0">
          <table className="w-full min-w-[420px] text-left text-sm">
            <tbody>
              {Object.entries(RULES).map(([k, v]) => (
                <tr key={k} className="border-b border-border/60 last:border-0">
                  <td className="px-6 py-3 font-mono text-xs text-muted-foreground">{k}</td>
                  <td className="px-6 py-3 font-mono text-xs">{String(v)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      </Section>

      <Section title="Token list">
        <Panel className="mt-6 overflow-x-auto p-0 sm:p-0">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="label-caps border-b border-border text-[10px] text-muted-foreground">
                <th className="px-6 py-4">Symbol</th>
                <th className="px-6 py-4">Address</th>
                <th className="px-6 py-4">Fragment</th>
              </tr>
            </thead>
            <tbody>
              {TOKENS.map((t) => (
                <tr key={t.symbol} className="border-b border-border/60 last:border-0">
                  <td className="px-6 py-3 label-caps text-xs">{t.symbol}</td>
                  <td className="px-6 py-3 font-mono text-[11px] break-all">{t.address}</td>
                  <td className="px-6 py-3 font-mono text-xs">{t.fragment}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
        <p className="mt-4 text-sm text-foreground/70">
          Addresses are placeholders until the vault and the token wrappers are deployed on{" "}
          {CHAIN.short}. The{" "}
          <Link to="/proof" className="underline underline-offset-4">
            proof page
          </Link>{" "}
          always shows what is really there.
        </p>
      </Section>

      <Section title="Fee split">
        <Panel className="mt-6">
          <p className="text-sm leading-relaxed text-foreground/70">
            $GRASS is a BEP-20 with a fixed one billion supply. Trading fees route through an
            immutable splitter: the larger share funds the treasury that buys stock for the vault,
            the rest buys and burns $GRASS on PancakeSwap. The ratio is compiled in — no key can
            change it, and no key can raise the fee.
          </p>
        </Panel>
      </Section>
    </>
  );
}
