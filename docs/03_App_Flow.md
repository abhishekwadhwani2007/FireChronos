# FIRECHRONOS — Application Flow

## High-Level User Journey

1. **Landing / Global Discovery**
   - Hero map of the world with current/recent fire activity (MODIS + VIIRS layers toggleable).
   - Quick stats: “Today’s detections”, “Active regions”.
   - Prominent “Explore a Region” CTA + three demo cards (India / California / Amazon).

2. **Region Selection**
   - Search by country / draw polygon / click demo.
   - System loads pre-aggregated data for that AOI (or triggers light on-the-fly aggregation if needed).

3. **Regional Dashboard (Core Experience)**
   - Top bar: Region name + date range selector + sensor filters.
   - Left / Main: Interactive calendar heatmap (daily → monthly → yearly views).
   - Right panel: Key metrics (total detections, FRP, anomaly score, sensor contribution %).
   - Bottom / Tabs:
     - Sensor Comparison Laboratory
     - Historical Trends
     - Scientific Methodology & Data Sources

4. **Calendar Interaction**
   - Hover day → tooltip with MODIS count, VIIRS count, Harmonized Index, FRP.
   - Click day → detail drawer with individual hotspot list + mini map.
   - Switch between “Raw Sensors” and “Harmonized” views.

5. **Sensor Comparison Laboratory**
   - Side-by-side time series: MODIS vs VIIRS.
   - Scatter / agreement plot.
   - Normalization factors shown transparently.

6. **Export & Share**
   - Download CSV of the selected region + period.
   - Generate simple shareable link or screenshot of the calendar.

7. **Scientific Data Center (always accessible)**
   - Full list of NASA products used.
   - Version numbers, download timestamps.
   - Methodology summary.
   - Known limitations.

## Critical Path (Must Work in Demo)

Landing → Select India → Calendar appears with real data → Toggle MODIS / VIIRS / Harmonized → Click a high-activity day → See details.

Everything else is enhancement.

---


More Description - 

Page 1 — Landing page
Components:
FIRECHRONOS identity.
Main headline.
Short explanation of the MODIS–VIIRS problem.
Interactive satellite map preview.
Explore historical fire activity CTA.
Scientific methodology summary.
NASA dataset attribution.
Feature highlights.

Page 2 — Fire Intelligence Dashboard
Components:
Total recorded detections.
MODIS contribution.
VIIRS contribution.
Harmonized activity indicator.
Geographic map.
Historical trend chart.
Latest available data timestamp.
Data quality and completeness.
Selected region information.
Do not label these detections as confirmed wildfires.

Page 3 — Burning Activity Calendar
Components:
Geographic selection.
Year selector.
Month selector.
Daily calendar heatmap.
Monthly activity comparison.
Historical average.
Unusual activity highlighting.
Sensor breakdown.
This page should receive the greatest development attention.

Page 4 — Historical Analysis
Components:
Multi-year line chart.
Monthly seasonal chart.
MODIS versus VIIRS comparison.
FRP analysis.
Region comparison.
Historical high-activity periods.

Page 5 — Harmonization Laboratory
This is where your project demonstrates genuine scientific work.
Include:
Raw MODIS observations.
Raw VIIRS observations.
Spatial aggregation settings.
Temporal aggregation settings.
Harmonization methodology.
Normalization explanation.
Sensor agreement charts.
Data quality indicators.
Before-and-after comparison.

**Document Owner:** Product + UX  
**Last Updated:** 13 November 2026  
