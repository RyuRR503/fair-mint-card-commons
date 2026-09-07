import type { Rarity } from "./tokens";
import { CN_CITIES, CITY_BY_KEY, type CityDef } from "./cities";

export type Spawn = {
  id: string;
  symbol: string;
  amount: number;
  rarity: Rarity;
  /** city key, e.g. "shanghai" */
  city: string;
  cityName: string;
  cityNameZh: string;
  country: string;
  /** real store name from OpenStreetMap */
  place: string;
  lat: number;
  lng: number;
  distance?: number | null;
};

export type CityPin = {
  key: string;
  name: string;
  nameZh: string;
  lat: number;
  lng: number;
  count: number;
  symbols: string[];
  rarity: Rarity;
};

export const CITIES: CityDef[] = CN_CITIES;
export const cityByKey = (k: string) => CITY_BY_KEY[k];
export const TOTAL_CITIES = CN_CITIES.length;
