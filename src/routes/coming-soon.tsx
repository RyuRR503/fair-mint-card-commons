import { createFileRoute } from "@tanstack/react-router";
import { SITE_PREVIEW_META } from "@/lib/site-preview";
import { useMemo } from "react";
import { CatchLettering } from "@/components/site/CatchLettering";
import { LiveMap } from "@/components/site/LiveMap";
import type { MapPin } from "@/components/site/WorldMap";
import { getMapSummary } from "@/lib/map.functions";
import { useMapPoints } from "@/lib/useMapPoints";

export const Route = createFileRoute("/coming-soon")({
  head: () => ({
    meta: [
      { title: "CATCH 即将开启 — 点位分布与覆盖城市" },
      { name: "description", content: "CATCH 尚未正式上线。先看看我们在各城市的点位分布。" },
      { property: "og:title", content: "CATCH 即将开启" },
      { property: "og:description", content: "项目尚未正式上线，可先浏览覆盖城市与点位分布。" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      ...SITE_PREVIEW_META,
    ],
  }),
  loader: () => getMapSummary(),
  errorComponent: () => <div className="px-5 py-32 text-center text-muted-foreground">点位信息暂时无法加载，请稍后刷新。</div>,
  component: ComingSoon,
});

function ComingSoon() {
  const summary = Route.useLoaderData();
  const points = useMapPoints();
  const pins: MapPin[] = useMemo(
    () => summary.pins.map((c) => ({ key: c.key, lat: c.lat, lng: c.lng, label: c.nameZh, count: c.count, symbols: c.symbols, rarity: c.rarity })),
    [summary.pins],
  );
  return (
    <div className="mx-auto max-w-6xl px-5 py-12 sm:py-16">
      <div className="text-center">
        <CatchLettering className="mx-auto h-14 w-auto sm:h-20" />
        <p className="label-caps mt-6 text-primary">COMING SOON</p>
        <h1 className="mt-3 text-balance text-3xl sm:text-5xl">项目即将开启</h1>
        <p className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground">
          CATCH 尚未正式上线，目前仅开放点位分布预览。领取等功能将在正式上线后开放。
        </p>
        <p className="readout mt-6">{summary.totalCities} 座城市 / {summary.totalSpawns} 个点位</p>
      </div>
      <div className="ink-frame mt-10 overflow-hidden rounded-md">
        <LiveMap pins={pins} points={points} />
      </div>
    </div>
  );
}
