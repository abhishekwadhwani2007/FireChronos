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
    monthly_baseline?: {
      month?: number;
      mean_count?: number;
      std_count?: number;
      mean_frp?: number;
      std_frp?: number;
    };
  };
  top_hotspots: Hotspot[];
}

export interface SensorComparisonDay {
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
    correlation_viirs_modis: number | null;
  };
  series: SensorComparisonDay[];
}

export interface MonthlyBaseline {
  month: number;
  month_name: string;
  baseline_mean_daily: number;
  baseline_std_daily: number;
  yearly_data: {
    year: number;
    total_count: number;
    total_frp: number;
    days_observed: number;
    mean_daily_count: number;
  }[];
}

export interface SeasonalProfileResponse {
  region_id: string;
  profile: MonthlyBaseline[];
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
  challenge: string;
  data_sources: {
    sensor: string;
    satellite: string;
    resolution: string;
    source: string;
    citation: string;
  }[];
  algorithm: {
    name: string;
    version: string;
    equation: string;
    scaling_factor: number;
  };
}

export interface ForecastCorridor {
  id: string;
  name: string;
  countries: string[];
  centroid: [number, number];
  risk_tier: 'CRITICAL' | 'ELEVATED' | 'NOMINAL' | 'SUPPRESSED';
  share_percentage: number;
  predicted_hotspots: number;
  predicted_frp_mw: number;
  primary_driver: string;
  key_zones: string[];
  coordinates_sample: [number, number][];
}

export interface ForecastDay {
  date: string;
  day_offset: number;
  day_of_week: string;
  predicted_hai: number;
  confidence_interval_low: number;
  confidence_interval_high: number;
  high_anomaly_probability: number;
  risk_tier: 'CRITICAL' | 'ELEVATED' | 'NOMINAL' | 'SUPPRESSED';
  color: string;
  alert_code: string;
  expected_seasonal_baseline: number;
  total_estimated_hotspots?: number;
  dominant_corridor?: string;
  center_of_mass?: [number, number];
  corridors?: ForecastCorridor[];
}

export interface ForecastResponse {
  generated_at: string;
  anchor_date: string;
  region_id: string;
  forecast_horizon_days: number;
  model_metadata: {
    architecture: string;
    regression_mae: number;
    regression_r2: number;
    classifier_roc_auc: number;
    classifier_high_precision: number;
    classifier_accuracy: number;
    validation_strategy: string;
    sensor_foundation: string;
  };
  forecasts: ForecastDay[];
  disclaimer: string;
}

export interface ModelAccuracyResponse {
  schema_version: string;
  project: string;
  challenge: string;
  region: string;
  architecture: string;
  evaluation_methodology: string;
  data_source: string;
  sample_counts: {
    total_days: number;
    train_days: number;
    test_days: number;
    feature_count: number;
  };
  classifier_head: {
    model: string;
    target: string;
    roc_auc: number;
    high_precision_operating_point: {
      threshold: number;
      precision: number;
      recall: number;
      f1: number;
      accuracy: number;
      tp: number;
      fp: number;
      fn: number;
      tn: number;
    };
    balanced_operating_point: {
      threshold: number;
      precision: number;
      recall: number;
      f1: number;
      accuracy: number;
      tp: number;
      fp: number;
      fn: number;
      tn: number;
    };
    verification_statement: string;
  };
  regressor_head: {
    model: string;
    target: string;
    horizon_1d: {
      mae: number;
      rmse: number;
      r2: number;
    };
    multi_horizon: Record<string, {
      horizon_days: number;
      mae: number;
      rmse: number;
      r2: number;
    }>;
  };
  top_features: string[];
}
