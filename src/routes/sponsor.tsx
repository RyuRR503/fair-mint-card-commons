import { createFileRoute } from "@tanstack/react-router";
import { Section, Panel } from "@/components/site/Section";
import { WaitlistForm } from "@/components/site/WaitlistForm";
import { TokenChip } from "@/components/site/TokenChip";

export const Route = createFileRoute("/sponsor")({
  head: () => ({
    meta: [
      { title: "Sponsor a spot — pay per verified footstep, not per impression" },
      {
        name: "description",
        content:
          "Fund the vault with your own stock token, we schedule spawns at your doors, and you pay per verified physical visit. Not per impression. Not per click.",
      },
      { property: "og:title", content: "Sponsor a spot on Touch Grass" },
      {
        property: "og:description",
        content:
          "Outdoor advertising that only bills when somebody actually walked to your door and passed every anti-spoof check.",
      },
    ],
  }),
  component: Sponsor,
});

function Sponsor() {
  return (
    <>
      <Section
        eyebrow="sponsor"
        title="Pay for footsteps. Not impressions."
        lead="A brand sponsors drops at its own doors. It funds the vault with its stock token — or pays us to buy it — we schedule the spawns, and it pays per verified visit: a claim that passed every check."
        className="mt-10"
      />

      <Section title="What a sponsored spot looks like">
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {[
            {
              h: "You pick the doors.",
              p: "Every store, one flagship, or a single street during a launch week. Coordinates, radius and opening window are yours.",
            },
            {
              h: "We fund and schedule.",
              p: "The fragment sits in a public vault before the drop appears. Nothing is minted and nothing is promised that cannot be paid.",
            },
            {
              h: "You get proof.",
              p: "Each visit is a signed claim with a position, a timestamp and an on-chain transfer. Fraudulent taps never bill because they never complete.",
            },
          ].map((c) => (
            <Panel key={c.h}>
              <h3 className="text-lg">{c.h}</h3>
              <p className="mt-2 text-sm leading-relaxed text-foreground/70">{c.p}</p>
            </Panel>
          ))}
        </div>
      </Section>

      <Section title="The billable unit">
        <Panel className="mt-6 flex flex-wrap items-center justify-between gap-8">
          <ul className="max-w-xl space-y-3 text-sm leading-relaxed text-foreground/75">
            <li>· A person stood within metres of your door, phone in hand.</li>
            <li>· Their GPS log looked like a real chipset, not a mock provider.</li>
            <li>· Their trail was physically possible and their clock matched the timezone.</li>
            <li>· A token left the vault and landed in their wallet, publicly, on-chain.</li>
          </ul>
          <div className="flex gap-3">
            <TokenChip symbol="AAPL" size={72} float />
            <TokenChip symbol="GME" size={72} float delay={0.7} />
            <TokenChip symbol="TSLA" size={72} float delay={1.4} />
          </div>
        </Panel>
      </Section>

      <Section title="Talk to us" lead="The self-serve dashboard is the next thing we build. Until then, leave an address or DM @TouchGrassRWA on X.">
        <Panel className="mt-6">
          <WaitlistForm kind="brand" />
        </Panel>
      </Section>
    </>
  );
}
