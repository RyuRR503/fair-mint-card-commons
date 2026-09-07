import { createFileRoute } from "@tanstack/react-router";
import { Section, Panel } from "@/components/site/Section";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/roadmap")({
  head: () => ({
    meta: [
      { title: "Roadmap — where Touch Grass goes next, and what is in the way" },
      {
        name: "description",
        content:
          "The phone, Asia, the rest of the world, money in, and the structure. Including the parts that are not planned and the questions still open.",
      },
      { property: "og:title", content: "Touch Grass roadmap" },
      {
        property: "og:description",
        content:
          "What is live, what is built but dark, what is being built, and what we have decided not to do.",
      },
    ],
  }),
  component: Roadmap,
});

type Status = "live" | "building" | "next" | "dark" | "open" | "no";

const TAG: Record<Status, { label: string; cls: string }> = {
  live: { label: "live", cls: "bg-primary text-primary-foreground" },
  building: { label: "building", cls: "bg-accent text-accent-foreground" },
  next: { label: "next", cls: "bg-foreground text-background" },
  dark: { label: "built, dark", cls: "bg-muted text-muted-foreground" },
  open: { label: "open question", cls: "bg-secondary text-secondary-foreground" },
  no: { label: "not planned", cls: "bg-destructive text-destructive-foreground" },
};

const CHAPTERS: {
  title: string;
  lead: string;
  items: { s: Status; h: string; p: string }[];
}[] = [
  {
    title: "The phone",
    lead: "A browser can tell you where you are. A phone can prove you stood there.",
    items: [
      { s: "live", h: "The web app", p: "Full map, full claim flow, works on any modern browser." },
      { s: "building", h: "Android build", p: "Same map, same catch, same account, plus real motion sensors and background GPS." },
      { s: "next", h: "iOS", p: "One codebase, already runs. Blocked on store paperwork, not engineering." },
      { s: "next", h: "One account everywhere", p: "Web and app land on the same wallet instead of two." },
    ],
  },
  {
    title: "Asia",
    lead: "Most of the map is currently Europe and North America. That is a bug, not a plan.",
    items: [
      { s: "building", h: "Local doors", p: "Authorised resellers count, not only flagship stores. That is how retail actually works in most of Asia." },
      { s: "next", h: "Per-city midnight", p: "Drops should refill at your midnight, not UTC's." },
      { s: "next", h: "Seven languages", p: "JA, KO, zh-Hans, TH, VI, ID, HI." },
      { s: "no", h: "Mainland China", p: "Not planned." },
    ],
  },
  {
    title: "Rest of world",
    lead: "A fragment worth a coffee in Zurich is worth a day's work somewhere else. That asymmetry has to be designed for, not ignored.",
    items: [
      { s: "building", h: "Banded caps", p: "Catch caps scaled to local purchasing power, so farming never beats working." },
      { s: "next", h: "Lite mode", p: "Low-end phones and 3G. The map should not need a flagship device." },
      { s: "open", h: "OS-level attestation", p: "Strong, but it locks out rooted and older phones. Undecided." },
      { s: "no", h: "Selling this as an income", p: "It is a game with real loot. It is not a job and we will not market it as one." },
    ],
  },
  {
    title: "Money in",
    lead: "Sponsors fund the vault. Fees fund the vault. Nothing depends on new buyers.",
    items: [
      { s: "live", h: "Fee split contract", p: "Immutable on-chain split: one share to the treasury that buys stock for the vault, the other buys and burns $GRASS. The ratio is not adjustable by keys." },
      { s: "dark", h: "Multi-chain sponsor deposits", p: "Built, merged and switched off. A per-spot deposit address, priced by router quote. Nothing bridges." },
      { s: "next", h: "The shop", p: "$GRASS buys memory, identity, constraint and the world. Never a catch. Half of every purchase is burned on the way through." },
      { s: "open", h: "Gasless approvals", p: "$GRASS has no permit(), so a fresh wallet with zero BNB cannot spend it yet." },
    ],
  },
  {
    title: "The structure",
    lead: "A hundred cities is a spreadsheet. A thousand is an operation.",
    items: [
      { s: "building", h: "The keeper", p: "Hourly top-ups from the treasury through a swapper contract, simulated first, capped per run, logged publicly." },
      { s: "next", h: "Sponsor dashboard", p: "Self-serve spots, budgets, and a live visit ledger." },
      { s: "next", h: "Decentralising the treasury key", p: "The split is already trustless. The wallet that feeds it is not, yet." },
    ],
  },
];

function Roadmap() {
  return (
    <>
      <Section
        eyebrow="roadmap"
        title="Where this goes next. And what is in the way."
        lead="Including the things we decided not to build, and the questions we have not answered."
        className="mt-10"
      />
      {CHAPTERS.map((c) => (
        <Section key={c.title} title={c.title} lead={c.lead}>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {c.items.map((i) => (
              <Panel key={i.h}>
                <span
                  className={cn(
                    "label-caps rounded-full px-3 py-1 text-[9px]",
                    TAG[i.s].cls,
                  )}
                >
                  {TAG[i.s].label}
                </span>
                <h3 className="mt-3 text-lg">{i.h}</h3>
                <p className="mt-2 text-sm leading-relaxed text-foreground/70">{i.p}</p>
              </Panel>
            ))}
          </div>
        </Section>
      ))}
    </>
  );
}
