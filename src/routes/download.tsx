import { createFileRoute, Link } from "@tanstack/react-router";
import { Section, Panel } from "@/components/site/Section";

export const Route = createFileRoute("/download")({
  head: () => ({
    meta: [
      { title: "Get the app — Android APK and iOS web app" },
      {
        name: "description",
        content:
          "Install Touch Grass on Android for real motion sensors and background GPS, or add the web app to your iOS home screen.",
      },
      { property: "og:title", content: "Get Touch Grass" },
      { property: "og:description", content: "Android APK now, App Store next, iOS web app today." },
    ],
  }),
  component: Download,
});

function Download() {
  return (
    <>
      <Section
        eyebrow="get the app"
        title="The map fits in a pocket."
        lead="The browser works everywhere. The app adds real motion sensors, background GPS and a claim button that survives a locked screen."
        className="mt-10"
      />

      <Section title="Pick your platform">
        <div className="mt-6 grid gap-5 md:grid-cols-3">
          <Panel>
            <h3 className="text-lg">Android</h3>
            <p className="mt-2 text-sm text-foreground/70">
              Direct APK. Allow install from unknown sources, then open it. Updates in-app.
            </p>
            <a
              href="https://expo.dev/artifacts/eas/touchgrass-bsc.apk"
              className="label-caps mt-5 inline-block rounded-full bg-primary px-6 py-3 text-xs text-primary-foreground shadow-[var(--shadow-glossy)]"
            >
              Download APK
            </a>
          </Panel>
          <Panel>
            <h3 className="text-lg">iOS</h3>
            <p className="mt-2 text-sm text-foreground/70">
              Open the web app in Safari, tap Share, then Add to Home Screen. It behaves like a
              native app minus background GPS. The store build is in review.
            </p>
            <Link
              to="/app"
              className="label-caps mt-5 inline-block rounded-full bg-card px-6 py-3 text-xs shadow-[var(--shadow-pop)]"
            >
              Open the web app
            </Link>
          </Panel>
          <Panel>
            <h3 className="text-lg">Desktop</h3>
            <p className="mt-2 text-sm text-foreground/70">
              You can browse the whole world map and the vault from a laptop. You cannot catch
              anything — the accuracy check will refuse a wifi fix, on purpose.
            </p>
            <Link
              to="/app"
              className="label-caps mt-5 inline-block rounded-full bg-card px-6 py-3 text-xs shadow-[var(--shadow-pop)]"
            >
              Browse the map
            </Link>
          </Panel>
        </div>
      </Section>

      <Section title="Permissions we ask for, and why">
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {[
            ["Precise location", "The whole game. Coarse location is refused because it cannot tell a door from a block."],
            ["Motion sensors", "Distinguishing a hand from an emulator. Readings never leave the claim request."],
            ["Nothing else", "No contacts, no photos, no ad id. The app has no account, only a wallet."],
            ["What we store", "Your position log for the anti-cheat window, your catches, and your wallet address. That is the list."],
          ].map(([h, p]) => (
            <Panel key={h}>
              <h3 className="label-caps text-xs text-primary-foreground/70">{h}</h3>
              <p className="mt-2 text-sm leading-relaxed text-foreground/70">{p}</p>
            </Panel>
          ))}
        </div>
      </Section>
    </>
  );
}
