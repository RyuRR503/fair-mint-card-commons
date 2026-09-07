export type CityDef = {
  /** stable key */
  key: string;
  name: string;
  nameZh: string;
  country: string;
  lat: number;
  lng: number;
  /** search radius in metres used when importing real stores */
  radius: number;
};

/** Tier-1 and new tier-1 cities in mainland China — the first launch batch. */
export const CN_CITIES: CityDef[] = [
  { key: "beijing", name: "Beijing", nameZh: "北京", country: "CN", lat: 39.9042, lng: 116.4074, radius: 28000 },
  { key: "shanghai", name: "Shanghai", nameZh: "上海", country: "CN", lat: 31.2304, lng: 121.4737, radius: 28000 },
  { key: "guangzhou", name: "Guangzhou", nameZh: "广州", country: "CN", lat: 23.1291, lng: 113.2644, radius: 24000 },
  { key: "shenzhen", name: "Shenzhen", nameZh: "深圳", country: "CN", lat: 22.5431, lng: 114.0579, radius: 24000 },
  { key: "chengdu", name: "Chengdu", nameZh: "成都", country: "CN", lat: 30.5728, lng: 104.0668, radius: 22000 },
  { key: "hangzhou", name: "Hangzhou", nameZh: "杭州", country: "CN", lat: 30.2741, lng: 120.1551, radius: 20000 },
  { key: "chongqing", name: "Chongqing", nameZh: "重庆", country: "CN", lat: 29.5630, lng: 106.5516, radius: 22000 },
  { key: "wuhan", name: "Wuhan", nameZh: "武汉", country: "CN", lat: 30.5928, lng: 114.3055, radius: 20000 },
  { key: "xian", name: "Xi'an", nameZh: "西安", country: "CN", lat: 34.3416, lng: 108.9398, radius: 20000 },
  { key: "suzhou", name: "Suzhou", nameZh: "苏州", country: "CN", lat: 31.2989, lng: 120.5853, radius: 18000 },
  { key: "nanjing", name: "Nanjing", nameZh: "南京", country: "CN", lat: 32.0603, lng: 118.7969, radius: 20000 },
  { key: "tianjin", name: "Tianjin", nameZh: "天津", country: "CN", lat: 39.3434, lng: 117.3616, radius: 20000 },
  { key: "changsha", name: "Changsha", nameZh: "长沙", country: "CN", lat: 28.2282, lng: 112.9388, radius: 18000 },
  { key: "zhengzhou", name: "Zhengzhou", nameZh: "郑州", country: "CN", lat: 34.7466, lng: 113.6254, radius: 18000 },
  { key: "qingdao", name: "Qingdao", nameZh: "青岛", country: "CN", lat: 36.0671, lng: 120.3826, radius: 18000 },
];

export const CITY_BY_KEY: Record<string, CityDef> = Object.fromEntries(
  CN_CITIES.map((c) => [c.key, c]),
);
