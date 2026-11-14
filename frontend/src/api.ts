import {
  CalendarResponse,
  DayDetail,
  SensorComparisonResponse,
  SeasonalProfileResponse,
  GridResponse,
  MetaSourcesResponse,
} from './types';

const API_BASE = '/api';

export async function fetchCalendar(
  region = 'india',
  start = '2020-01-01',
  end = '2026-11-13',
  mode: 'harmonized' | 'viirs' | 'modis' = 'harmonized'
): Promise<CalendarResponse> {
  const res = await fetch(
    `${API_BASE}/regions/${region}/calendar?from=${start}&to=${end}&mode=${mode}`
  );
  if (!res.ok) throw new Error(`Calendar API error: ${res.statusText}`);
  return res.json();
}

export async function fetchDayDetail(region = 'india', date: string): Promise<DayDetail> {
  const res = await fetch(`${API_BASE}/regions/${region}/day/${date}`);
  if (!res.ok) throw new Error(`Day Detail API error: ${res.statusText}`);
  return res.json();
}

export async function fetchSensorComparison(
  region = 'india',
  year?: number
): Promise<SensorComparisonResponse> {
  const url = year
    ? `${API_BASE}/regions/${region}/sensor-comparison?year=${year}`
    : `${API_BASE}/regions/${region}/sensor-comparison`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Sensor Lab API error: ${res.statusText}`);
  return res.json();
}

export async function fetchSeasonalProfile(region = 'india'): Promise<SeasonalProfileResponse> {
  const res = await fetch(`${API_BASE}/regions/${region}/seasonal-profile`);
  if (!res.ok) throw new Error(`Seasonal Profile API error: ${res.statusText}`);
  return res.json();
}

export async function fetchGrid(region = 'india', limit = 1500): Promise<GridResponse> {
  const res = await fetch(`${API_BASE}/regions/${region}/grid?limit=${limit}`);
  if (!res.ok) throw new Error(`Grid API error: ${res.statusText}`);
  return res.json();
}

export async function fetchMetaSources(): Promise<MetaSourcesResponse> {
  const res = await fetch(`${API_BASE}/meta/sources`);
  if (!res.ok) throw new Error(`Meta Sources API error: ${res.statusText}`);
  return res.json();
}

export async function fetchAnomalies(region = 'india', code = 'HIGH', limit = 50) {
  const res = await fetch(`${API_BASE}/regions/${region}/anomalies?code=${code}&limit=${limit}`);
  if (!res.ok) throw new Error(`Anomalies API error: ${res.statusText}`);
  return res.json();
}
