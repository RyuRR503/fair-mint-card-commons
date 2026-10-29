import cardArtwork from "@/assets/agent-card-gold.jpg";

export function AgentCardArt({ id, compact = false }: { id?: number; compact?: boolean }) {
  return (
    <div className={`ac-card-art ${compact ? "ac-card-art--compact" : ""}`}>
      <img src={cardArtwork} alt="黑金猎鹰 FAGENT" width={1024} height={1536} loading={compact ? "lazy" : "eager"} />
      <div className="ac-art-top"><span>FAGENT</span><span>F / 77</span></div>
      <div className="ac-art-bottom"><span>THE GENESIS COLLECTION</span><strong>{id === undefined ? "770,000" : `#${String(id).padStart(6, "0")}`}</strong><span>BNB CHAIN · FLAP</span></div>
    </div>
  );
}