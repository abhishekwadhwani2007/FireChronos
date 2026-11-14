export interface DayRecord {
  date: string;
  year: number;
  month: number;
  day: number;
  hai: number;
  anomaly_code: 'HIGH' | 'ELEVATED' | 'NORMAL' | 'LOW';
  anomaly_class: string;
  anomaly_score: number;
  count: number;
  modis_count?: number;
  frp_sum: number;
}

export interface CalendarResponse {
  region_id: string;
  mode: 'harmonized' | 'viirs' | 'modis';
  date_range: { start: string; end: string };
  days: DayRecord[];
  summary: {
    total_days: number;
    total_detections: number;
    total_frp_mw: number;
    peak_day: string;
    peak_count: number;
    unusually_high_days: number;
  };
}

export interface Hotspot {
  latitude: number;
  longitude: number;
  acq_time: string;
  satellite: string;
  confidence: string;
  frp: number;
  brightness: number;
  daynight: string;
}

export interface DayDetail {
  date: string;
  year: number;
  month: number;
  day_of_month: number;
  sensors: {
    viirs_n20: {
      detection_count: number;
      frp_sum_mw: number;
      frp_mean_mw: number;
      frp_max_mw: number;
      confidence_breakdown: { high: number; nominal: number; low: number };
      daynight_breakdown: { day: number; night: number };
    };
    modis_calibrated: {
      detection_count: number;
      frp_sum_mw: number;
      note: string;
    };
  };
  harmonization: {
    hai: number;
    anomaly_score: number;
    anomaly_class: string;
    anomaly_code: string;
    monthly_baseline: {
      mean_count: number;
      std_count: number;
      mean_frp: number;
      std_frp: number;
    };
  };
  top_hotspots: Hotspot[];
  hotspot_count: number;
}

export interface SensorComparisonSeries {
  date: string;
  viirs_count: number;
  modis_calibrated_count: number;
  viirs_frp: number;
  modis_calibrated_frp: number;
  hai: number;
  anomaly_score: number;
}

export interface SensorComparisonResponse {
  region_id: string;
  year_filter: number | null;
  total_days: number;
  calibration: {
    method: string;
    count_ratio: number;
    frp_ratio: number;
    note: string;
    correlation_viirs_modis: number;
  };
  series: SensorComparisonSeries[];
}

export interface SeasonalMonth {
  month: number;
  month_name: string;
  baseline_mean_daily: number;
  baseline_std_daily: number;
  yearly_data: Array<{
    year: number;
    total_count: number;
    total_frp: number;
    days_observed: number;
    mean_daily_count: number;
  }>;
}

export interface SeasonalProfileResponse {
  region_id: string;
  profile: SeasonalMonth[];
  fire_seasons: Record<string, string>;
}

export interface GridCell {
  lat: number;
  lon: number;
  count: number;
  frp_sum: number;
}

export interface GridResponse {
  region_id: string;
  spatial_framework: string;
  total_cells: number;
  cells: GridCell[];
}

export interface MetaSourcesResponse {
  project: string;
  event: string;
  total_detections: number;
  date_range: { start: string; end: string };
  sensors: Array<{
    id: string;
    name: string;
    instrument: string;
    satellite: string;
    resolution: string;
    source: string;
    status: string;
  }>;
  spatial_framework: string;
  temporal_framework: string;
  harmonization_index: string;
  generated_at: string;
  methodology: {
    spatial_harmonization: string;
    temporal_harmonization: string;
    sensor_normalization: string;
    anomaly_detection: string;
    hai_formula: string;
    baseline_period: string;
    confidence_mapping: string;
    limitations: string[];
  };
  references: string[];
}
