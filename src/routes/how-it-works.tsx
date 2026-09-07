import { createFileRoute, Link } from "@tanstack/react-router";
import { Section, Panel } from "@/components/site/Section";
import { RULES } from "@/lib/game.functions";
import { CHAIN } from "@/lib/tokens";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: "How Touch Grass works — walk, tap, get the fragment" },
      {
        name: "description",
        content:
          "The spawn table, the claim server, the vault contract on BNB Smart Chain, and every anti-cheat rule that stands between a spoofer and a share.",
      },
      { property: "og:title", content: "How Touch Grass works" },
      {
        property: "og:description",
        content:
          "Three parts: a spawn table, a claim server that proves you were there, and a vault that only pays against a signed voucher.",
      },
    ],
  }),
  component: HowItWorks,
});

const STEPS = [
  {
    n: "01",
    h: "Connect a wallet, enable location.",
    p: "The app watches your GPS and draws every drop around you. Nothing is sent anywhere yet.",
  },
  {
    n: "02",
    h: "Walk until the button unlocks.",
    p: `Close enough is ${RULES.baseRadiusM} m plus half the error your phone reports — ${RULES.baseRadiusM + 5} m on a clean fix, ${RULES.maxRadiusM} m at the accuracy ceiling. A downtown fix is routinely twenty to fifty metres out, and a flat radius only ever refused people who were standing there.`,
  },
  {
    n: "03",
    h: "The app sends your fix and its GPS log.",
    p: `Not just one position: at least ${RULES.minFixSamples} readings over ${RULES.minFixSeconds} seconds, plus motion from the accelerometer.`,
  },
  {
    n: "04",
    h: "The server re-checks everything.",
    p: "Distance, accuracy, jitter, travel since your last fix, device clock against the timezone, and the daily caps. A rejected claim costs you nothing.",
  },
  {
    n: "05",
    h: "It signs a voucher.",
    p: `to, token, amount, spawnId, nonce, deadline — ${RULES.voucherTtlMin} minutes. Signed with the claim key using EIP-712, so a voucher for one vault is worthless on another.`,
  },
  {
    n: "06",
    h: "Your wallet calls claim().",
    p: "The vault verifies the signature, burns the nonce, and transfers the fragment to you. Nothing is minted — every fragment was bought and deposited before it spawned.",
  },
];

const ANTICHEAT = [
  ["Radius and accuracy", `${RULES.baseRadiusM}–${RULES.maxRadiusM} m radius scaled to your own error bar, GPS accuracy under ${RULES.maxAccuracyM} m. Indoor and coarse IP fixes are refused.`],
  ["Travel", `A new catch has to be reachable from the last one: walking speed (${RULES.walkSpeedMs} m/s) under ${RULES.flightThresholdKm} km, a plane plus ${RULES.airportMinutes} minutes of airport beyond it. Two different cities inside one hour is refused whatever the distance — the rule follows the device, so a fresh wallet does not clear the trail behind your phone.`],
  ["Proof of presence", "A real chipset wobbles by centimetres and its accuracy drifts every second. A mock provider returns the same coordinates and the same error forever, and that is exactly what we look for."],
  ["Motion", "Hands shake, emulators do not. A perfect zero is refused."],
  ["Clock and timezone", `A device clock more than ${RULES.clockSkewHours} hours off the timezone of the place you claim to stand in is refused.`],
  ["Cooldowns", `${RULES.walletCooldownMin} minutes between two catches by the same wallet, ${RULES.dropCooldownMin} minutes before the same drop wakes up for anyone.`],
  ["Caps", `${RULES.perWalletPerDay} catches per wallet per day, ${RULES.perDropPerDay} per drop per day, one catch per drop per wallet.`],
  ["Nonces and deadlines", `A voucher is single-use and expires in ${RULES.voucherTtlMin} minutes. Replays are impossible.`],
];

function HowItWorks() {
  return (
    <>
      <Section
        eyebrow="how it works"
        title="Walk there. Tap. The chain does the rest."
        lead="Three parts make it work: a spawn table that says where and how much, a claim server that checks you are really there and signs a voucher, and a vault contract that holds the tokens and only releases them against a valid voucher."
        className="mt-10"
      />

      <Section title="Six steps, four of them invisible.">
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {STEPS.map((s) => (
            <Panel key={s.n}>
              <span className="label-caps text-3xl text-primary">{s.n}</span>
              <h3 className="mt-2 text-lg">{s.h}</h3>
              <p className="mt-2 text-sm leading-relaxed text-foreground/70">{s.p}</p>
            </Panel>
          ))}
        </div>
      </Section>

      <Section title="The voucher">
        <Panel className="mt-6">
          <pre className="overflow-x-auto font-mono text-xs leading-relaxed text-foreground/80">{`Voucher {
  address to;       // your wallet
  address token;    // e.g. AAPL on ${CHAIN.short}
  uint256 amount;   // 0.011 AAPL = 11000000000000000 (18 decimals)
  bytes32 spawnId;  // keccak256("paris-0")
  uint256 nonce;    // unique, burned on use
  uint256 deadline; // unix seconds
}`}</pre>
          <p className="mt-5 text-sm leading-relaxed text-foreground/70">
            The chain never trusts the app. It trusts one key, and that key only signs after the
            physical checks pass. If the key leaks, the owner rotates it with{" "}
            <code className="font-mono text-xs">setSigner</code> and pauses the vault.
          </p>
        </Panel>
      </Section>

      <Section title="Anti-cheat" lead="GPS can be faked and wallets are free, so per-wallet limits alone are worthless. Every counter is keyed on something a fresh wallet does not reset.">
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {ANTICHEAT.map(([h, p]) => (
            <Panel key={h}>
              <h3 className="label-caps text-xs text-primary-foreground/70">{h}</h3>
              <p className="mt-2 text-sm leading-relaxed text-foreground/70">{p}</p>
            </Panel>
          ))}
        </div>
        <div className="mt-6 flex gap-4">
          <Link to="/docs" className="label-caps text-xs underline underline-offset-4">
            Full documentation →
          </Link>
          <Link to="/app" className="label-caps text-xs underline underline-offset-4">
            Open the app →
          </Link>
        </div>
      </Section>
    </>
  );
}
