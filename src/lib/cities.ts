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

/** The first launch batch: 30 mainland China cities. */
export const CN_CITIES: CityDef[] = [
  { key: "beijing", name: "Beijing", nameZh: "北京", country: "CN", lat: 39.9042, lng: 116.4074, radius: 28000 },
  { key: "shanghai", name: "Shanghai", nameZh: "上海", country: "CN", lat: 31.2304, lng: 121.4737, radius: 28000 },
  { key: "guangzhou", name: "Guangzhou", nameZh: "广州", country: "CN", lat: 23.1291, lng: 113.2644, radius: 24000 },
  { key: "shenzhen", name: "Shenzhen", nameZh: "深圳", country: "CN", lat: 22.5431, lng: 114.0579, radius: 24000 },
  { key: "chengdu", name: "Chengdu", nameZh: "成都", country: "CN", lat: 30.5728, lng: 104.0668, radius: 22000 },
  { key: "hangzhou", name: "Hangzhou", nameZh: "杭州", country: "CN", lat: 30.2741, lng: 120.1551, radius: 20000 },
  { key: "chongqing", name: "Chongqing", nameZh: "重庆", country: "CN", lat: 29.563, lng: 106.5516, radius: 22000 },
  { key: "wuhan", name: "Wuhan", nameZh: "武汉", country: "CN", lat: 30.5928, lng: 114.3055, radius: 20000 },
  { key: "xian", name: "Xi'an", nameZh: "西安", country: "CN", lat: 34.3416, lng: 108.9398, radius: 20000 },
  { key: "suzhou", name: "Suzhou", nameZh: "苏州", country: "CN", lat: 31.2989, lng: 120.5853, radius: 18000 },
  { key: "nanjing", name: "Nanjing", nameZh: "南京", country: "CN", lat: 32.0603, lng: 118.7969, radius: 20000 },
  { key: "tianjin", name: "Tianjin", nameZh: "天津", country: "CN", lat: 39.0842, lng: 117.2009, radius: 20000 },
  { key: "changsha", name: "Changsha", nameZh: "长沙", country: "CN", lat: 28.2282, lng: 112.9388, radius: 18000 },
  { key: "zhengzhou", name: "Zhengzhou", nameZh: "郑州", country: "CN", lat: 34.7466, lng: 113.6254, radius: 18000 },
  { key: "qingdao", name: "Qingdao", nameZh: "青岛", country: "CN", lat: 36.0671, lng: 120.3826, radius: 18000 },
  { key: "shenyang", name: "Shenyang", nameZh: "沈阳", country: "CN", lat: 41.8057, lng: 123.4315, radius: 18000 },
  { key: "dalian", name: "Dalian", nameZh: "大连", country: "CN", lat: 38.914, lng: 121.6147, radius: 16000 },
  { key: "xiamen", name: "Xiamen", nameZh: "厦门", country: "CN", lat: 24.4798, lng: 118.0894, radius: 16000 },
  { key: "fuzhou", name: "Fuzhou", nameZh: "福州", country: "CN", lat: 26.0745, lng: 119.2965, radius: 16000 },
  { key: "jinan", name: "Jinan", nameZh: "济南", country: "CN", lat: 36.6512, lng: 117.1201, radius: 16000 },
  { key: "hefei", name: "Hefei", nameZh: "合肥", country: "CN", lat: 31.8206, lng: 117.2272, radius: 16000 },
  { key: "kunming", name: "Kunming", nameZh: "昆明", country: "CN", lat: 24.8801, lng: 102.8329, radius: 16000 },
  { key: "nanning", name: "Nanning", nameZh: "南宁", country: "CN", lat: 22.817, lng: 108.3665, radius: 16000 },
  { key: "guiyang", name: "Guiyang", nameZh: "贵阳", country: "CN", lat: 26.647, lng: 106.6302, radius: 15000 },
  { key: "nanchang", name: "Nanchang", nameZh: "南昌", country: "CN", lat: 28.682, lng: 115.8579, radius: 15000 },
  { key: "wuxi", name: "Wuxi", nameZh: "无锡", country: "CN", lat: 31.4912, lng: 120.3119, radius: 15000 },
  { key: "ningbo", name: "Ningbo", nameZh: "宁波", country: "CN", lat: 29.8683, lng: 121.544, radius: 16000 },
  { key: "dongguan", name: "Dongguan", nameZh: "东莞", country: "CN", lat: 23.0207, lng: 113.7518, radius: 16000 },
  { key: "foshan", name: "Foshan", nameZh: "佛山", country: "CN", lat: 23.0219, lng: 113.1214, radius: 16000 },
  { key: "harbin", name: "Harbin", nameZh: "哈尔滨", country: "CN", lat: 45.8038, lng: 126.534, radius: 16000 },
];

export const CITY_BY_KEY: Record<string, CityDef> = Object.fromEntries(
  CN_CITIES.map((c) => [c.key, c]),
);
