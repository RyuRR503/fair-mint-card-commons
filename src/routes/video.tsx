import { createFileRoute } from "@tanstack/react-router";
import videoAsset from "@/assets/fagent-video.mp4.asset.json";

export const Route = createFileRoute("/video")({
  head: () => ({ meta: [
    { title: "FAGENT — 视频" },
    { name: "description", content: "FAGENT 独立视频播放页面。" },
    { property: "og:title", content: "FAGENT — 视频" },
    { property: "og:description", content: "FAGENT 独立视频播放页面。" },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: VideoPage,
});

function VideoPage() {
  return (
    <main className="flex h-dvh w-full items-center justify-center overflow-hidden bg-background-deep">
      <video
        className="h-full w-full object-contain"
        src={videoAsset.url}
        aria-label="FAGENT 视频"
        autoPlay
        muted
        playsInline
        controls
        preload="auto"
      />
    </main>
  );
}