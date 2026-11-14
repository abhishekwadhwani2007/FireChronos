import {
  CalendarResponse,
  DayDetail,
  SensorComparisonResponse,
  SeasonalProfileResponse,
  GridResponse,
  MetaSourcesResponse,
  ForecastResponse,
  ModelAccuracyResponse,
} from './types';

const API_BASE = '/api';

export async function fetchCalendar(
  region = 'asia',
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

export async function fetchDayDetail(region = 'asia', date: string): Promise<DayDetail> {
  const res = await fetch(`${API_BASE}/regions/${region}/day/${date}`);
  if (!res.ok) throw new Error(`Day Detail API error: ${res.statusText}`);
  return res.json();
}

export async function fetchSensorComparison(
  region = 'asia',
  year?: number
): Promise<SensorComparisonResponse> {
  const url = year
    ? `${API_BASE}/regions/${region}/sensor-comparison?year=${year}`
    : `${API_BASE}/regions/${region}/sensor-comparison`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Sensor Lab API error: ${res.statusText}`);
  return res.json();
}

export async function fetchSeasonalProfile(region = 'asia'): Promise<SeasonalProfileResponse> {
  const res = await fetch(`${API_BASE}/regions/${region}/seasonal-profile`);
  if (!res.ok) throw new Error(`Seasonal Profile API error: ${res.statusText}`);
  return res.json();
}

export async function fetchGrid(region = 'asia', limit = 2000): Promise<GridResponse> {
  const res = await fetch(`${API_BASE}/regions/${region}/grid?limit=${limit}`);
  if (!res.ok) throw new Error(`Grid API error: ${res.statusText}`);
  return res.json();
}

export async function fetchMetaSources(): Promise<MetaSourcesResponse> {
  const res = await fetch(`${API_BASE}/meta/sources`);
  if (!res.ok) throw new Error(`Meta Sources API error: ${res.statusText}`);
  return res.json();
}

export async function fetchAnomalies(region = 'asia', code = 'HIGH', limit = 50) {
  const res = await fetch(`${API_BASE}/regions/${region}/anomalies?code=${code}&limit=${limit}`);
  if (!res.ok) throw new Error(`Anomalies API error: ${res.statusText}`);
  return res.json();
}

export async function fetchForecast(region = 'asia'): Promise<ForecastResponse> {
  const res = await fetch(`${API_BASE}/regions/${region}/forecast`);
  if (!res.ok) throw new Error(`Forecast API error: ${res.statusText}`);
  return res.json();
}

export async function fetchModelAccuracy(region = 'asia'): Promise<ModelAccuracyResponse> {
  const res = await fetch(`${API_BASE}/regions/${region}/model-accuracy`);
  if (!res.ok) throw new Error(`Model Accuracy API error: ${res.statusText}`);
  return res.json();
}
