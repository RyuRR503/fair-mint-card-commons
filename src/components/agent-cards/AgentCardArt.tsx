import cardArtwork from "@/assets/fagent-nft-gold-weave.jpg";

export function AgentCardArt({ id, compact = false }: { id?: number; compact?: boolean }) {
  return (
    <div className={`ac-card-art ${compact ? "ac-card-art--compact" : ""}`}>
      <img src={cardArtwork} alt="FAGENT 金丝流线卡牌" width={1024} height={1536} loading={compact ? "lazy" : "eager"} />
      {id !== undefined && <span className="absolute bottom-[4.5%] left-[5%] font-mono text-primary text-[10px] sm:text-xs">#{String(id).padStart(6, "0")}</span>}
    </div>
  );
}