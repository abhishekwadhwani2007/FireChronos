# FIRECHRONOS — Product Requirements Document (PRD)

**Project Name:** FIRECHRONOS  
**Tagline:** One Planet. Two Satellite Systems. One Consistent Fire History.  
**Challenge:** NASA Space Apps Challenge 2026 — Harmonization of MODIS and VIIRS Hot Spots  
**Team Size:** 5  
**Event Dates:** 14–15 November 2026  

---

## 1. Problem Statement

MODIS (Terra/Aqua) and VIIRS (NOAA-20 / NOAA-21) active-fire detections cannot be directly compared because of differences in spatial resolution, sensitivity, overpass times, and detection algorithms. This prevents the creation of a long, consistent burning-activity time series.

## 2. Solution Overview

FIRECHRONOS is a web application that:

1. Ingests authentic NASA FIRMS MODIS and VIIRS active-fire data.
2. Harmonizes the two sensor families into a consistent spatial-temporal framework.
3. Provides an interactive **Burning Activity Calendar** + global discovery map + sensor comparison laboratory.
4. Allows users to select any region (or use pre-loaded India, California, Amazon demos) and explore historical fire patterns, anomalies, and sensor agreement.

## 3. Primary Objectives (Must Have)

- Retrieve and display authentic NASA FIRMS MODIS C6.1 and VIIRS (NOAA-20 + NOAA-21) data.
- Preserve sensor identity (never silently merge).
- Produce a harmonized daily/monthly activity index.
- Interactive world map with MODIS / VIIRS layers.
- Regional selection → detailed calendar + historical comparison.
- Clear distinction between raw observations and derived harmonized indicators.
- Scientific transparency (data sources, versions, methodology, limitations).

## 4. Secondary Objectives (Should Have)

- Sensor agreement statistics.
- Anomaly detection relative to historical baseline.
- Downloadable regional reports (CSV / simple PDF).
- Basic natural-language insights (“This month was 2.3× above the 5-year average”).

## 5. Out of Scope (for the 48-hour hackathon)

- Real-time global processing of every satellite overpass.
- Full burned-area products.
- Machine-learning fire prediction.
- Mobile native apps.
- User accounts / authentication.

## 6. Target Users

- Fire researchers & remote-sensing scientists
- Environmental agencies & forest departments
- Journalists & climate communicators
- Students and educators
- NASA Space Apps judges

## 7. Success Metrics (Hackathon)

- Working end-to-end demo with real FIRMS data for at least one region (India preferred).
- Clear visual proof of harmonization (raw MODIS vs raw VIIRS vs harmonized calendar).
- Judges can select a region and see meaningful historical patterns within < 30 seconds.
- All data sources and methodology documented.

NASA Space Apps Challenge 2026
### Harmonization of MODIS and VIIRS Hot Spots

**Project:** FIRECHRONOS  
**Tagline:** One Planet. Two Satellite Systems. One Consistent Fire History.  
**Category:** Earth Science / Geospatial Intelligence / Scientific Software  
**Team size:** 5 members  
**Development approach:** AI-assisted development (vibe coding)  
**Development strategy:** Research and preparation before the hackathon; implementation during the event  
**Geographical scope:** Global discovery + regional deep analysis  
**Event:** November 14–15, 2026

---

# DOCUMENT 1 — MASTER_PROMPT.md

# 1. YOUR ROLE

You are the principal software architect and technical development agent responsible for building FIRECHRONOS.

Operate as a coordinated multidisciplinary engineering team consisting of:

1. Senior Full-Stack Architect
2. NASA Earth Observation Research Specialist
3. Geospatial Data Engineer
4. Satellite Data Harmonization Researcher
5. Python Backend Engineer
6. Frontend Engineer
7. Data Visualization Specialist
8. Statistical Analysis and ML Engineer
9. UI/UX Designer
10. Software Testing Engineer

Your task is to transform the FIRECHRONOS specification into a functional, scientifically credible and competition-ready application.

This is an international NASA Space Apps Challenge project.

Do not approach it as an ordinary college website.

The application must demonstrate an actual scientific solution to the problem of comparing MODIS and VIIRS active-fire observations.

You must prioritize scientific validity, working functionality, usability and explainability.

# 2. PROJECT OVERVIEW

## 2.1 Project identity

FIRECHRONOS is a global fire activity intelligence platform that transforms MODIS and VIIRS active-fire satellite observations into a common spatial and temporal analytical framework.

It enables users to:

- Explore global active-fire observations.
- Select geographical areas.
- Investigate historical burning activity.
- Compare MODIS and VIIRS records.
- Examine harmonized activity indicators.
- Identify unusual historical activity.
- Understand seasonal fire patterns.
- Generate scientific reports.

## 2.2 Main problem

MODIS and VIIRS observe active fires differently.

Their records cannot be compared directly without accounting for:

- Spatial resolution.
- Detection sensitivity.
- Observation frequency.
- Instrument characteristics.
- Detection algorithms.
- Data quality.
- Satellite coverage.

The objective is to develop a transparent harmonization framework that produces more meaningful historical comparisons.

## 2.3 Main product

The central product must be:

**THE HARMONIZED BURNING ACTIVITY CALENDAR**

This calendar allows users to examine fire activity across daily, monthly, seasonal and yearly time periods.

It must be the central experience of the application.

Do not treat it as an ordinary secondary dashboard component.

# 3. PROJECT OBJECTIVES

### Primary objectives

1. Retrieve authentic NASA MODIS active-fire observations.
2. Retrieve authentic NASA VIIRS active-fire observations.
3. Standardize the original data structures.
4. Establish a common spatial reference framework.
5. Establish a common temporal aggregation framework.
6. Develop sensor-aware normalization.
7. Generate harmonized activity indicators.
8. Develop an interactive burning activity calendar.
9. Support geographical selection.
10. Provide historical comparisons.

### Secondary objectives

1. Statistical anomaly detection.
2. Fire season identification.
3. Sensor agreement analysis.
4. Regional comparisons.
5. Downloadable reports.
6. Explainable analytical insights.

### Optional objectives

1. Natural-language research assistant.
2. Environmental context integration.
3. Advanced statistical calibration.
4. Seasonal clustering.
5. Additional satellite datasets.

Never allow optional features to delay primary objectives.

# 4. PRODUCT ARCHITECTURE

The application must contain five principal modules.

## MODULE 1: GLOBAL FIRE INTELLIGENCE

Purpose: Explore global active-fire observations.

Components:

- Interactive world map.
- MODIS observation layer.
- VIIRS observation layer.
- Sensor filters.
- Time filters.
- Geographic search.
- Latest data information.
- Selected region information.
- Observation details.

Users should be able to select a region and proceed to detailed analysis.

## MODULE 2: HARMONIZED BURNING CALENDAR

Purpose: Visualize historical fire activity consistently.

Components:

- Daily calendar.
- Monthly calendar.
- Yearly comparison.
- Activity heatmap.
- Historical averages.
- Sensor-specific contributions.
- Harmonized activity index.
- Unusual activity indicators.
- Missing-data indicators.

The calendar must support a selected geographic area and historical period.

## MODULE 3: SENSOR COMPARISON LABORATORY

Purpose: Demonstrate the scientific contribution.

Components:

- Raw MODIS observations.
- Raw VIIRS observations.
- Sensor-specific activity trends.
- Common spatial aggregation.
- Common temporal aggregation.
- Sensor-normalized indicators.
- Calibration analysis.
- Sensor agreement statistics.
- Harmonization methodology.
- Quality indicators.

The application must clearly distinguish raw observations from derived harmonized indicators.

## MODULE 4: HISTORICAL FIRE INTELLIGENCE

Purpose: Investigate historical patterns.

Components:

- Historical time series.
- Monthly seasonal profiles.
- Annual activity comparisons.
- Historical baselines.
- Anomaly detection.
- Critical historical periods.
- Region-to-region comparison.

## MODULE 5: SCIENTIFIC DATA CENTER

Purpose: Establish transparency and reproducibility.

Components:

- NASA data sources.
- Product documentation.
- Product versions.
- Retrieval timestamps.
- Data processing methodology.
- Statistical methodology.
- Model documentation.
- Scientific references.
- Data limitations.
- Dataset export.

# 5. GEOGRAPHICAL STRATEGY

FIRECHRONOS must support global discovery and selected regional analysis.

Do not attempt to process every global historical observation on demand.

### Global interface

Provide:

- Global map.
- Global active-fire observation overview.
- Geographic search.
- Country selection.
- Regional selection.
- Available data coverage.

### Regional analysis

Provide:

- Custom AOI selection.
- Historical data retrieval.
- Daily and monthly aggregation.
- Sensor comparison.
- Historical baseline.
- Anomaly analysis.
- Exportable regional reports.

### Initial demonstration regions

Prepare these geographical examples:

1. Gujarat, India — regional demonstration.
2. California, USA — geographical comparison.
3. Amazon region, South America — large-scale regional demonstration.

These are proposed demonstration areas, not assumptions about which regions have the highest activity.

Use authentic NASA records for all three.

# 6. SCIENTIFIC DATA SOURCES

Primary source:

NASA FIRMS.

Official website:
https://firms.modaps.eosdis.nasa.gov/

Official API:
https://firms.modaps.eosdis.nasa.gov/api/

Historical archive:
https://firms.modaps.eosdis.nasa.gov/download/

Required products:

- MODIS Collection 6.1 active fire.
- VIIRS Suomi-NPP active fire.
- VIIRS NOAA-20 active fire.
- VIIRS NOAA-21 active fire.

Preserve satellite identity and product identity.

Do not automatically merge all VIIRS platforms into one indistinguishable source.

Optional sources:

- NASA Earthdata.
- NASA Worldview.
- NASA GIBS.
- NASA POWER.

Do not introduce additional datasets unless they serve a specific scientific purpose.

# 7. HARMONIZATION ENGINE

The harmonization engine is the most important backend component.

Implement the following stages.

### Stage 1: Ingestion

Retrieve observations from NASA FIRMS.

Preserve:

- Latitude.
- Longitude.
- Acquisition date.
- Acquisition time.
- Satellite.
- Instrument.
- Confidence.
- FRP.
- Product source.
- Product version.

### Stage 2: Validation

Check:

- Missing coordinates.
- Invalid dates.
- Invalid geographic coordinates.
- Duplicate ingestion records.
- Missing required fields.
- Invalid numerical values.
- Unexpected product identifiers.

### Stage 3: Spatial harmonization

Assign observations to a common geographic grid.

Initial proposed grid: 5 km.

The grid must have a documented CRS, cell dimensions and assignment method.

Allow alternative grid resolutions for research experiments.

Do not imply that assigning two observations to the same cell makes the underlying measurements physically equivalent.

### Stage 4: Temporal harmonization

Generate:

- Daily aggregation.
- Monthly aggregation.
- Seasonal aggregation.
- Annual aggregation.

Use a consistent timezone policy, preferably UTC for source processing.

Preserve the original acquisition timestamp.

### Stage 5: Sensor-specific statistics

Calculate separately:

- MODIS detection counts.
- VIIRS detection counts.
- Mean FRP.
- Total FRP.
- Median FRP.
- Confidence distribution.
- Observation coverage indicators.

Do not treat confidence values from different products as directly equivalent without a documented mapping.

### Stage 6: Normalization

Calculate sensor-specific historical standardized activity.

Example:

Z = (X - historical_mean) / historical_standard_deviation

The historical baseline must use comparable calendar periods.

Handle zero standard deviation and insufficient observations explicitly.

### Stage 7: Combined indicator

Develop a documented combined activity index.

Only combine standardized sensor-specific values when sufficient data and quality conditions are satisfied.

Preserve separate sensor outputs.

If calibration is not validated, clearly label the combined metric as a standardized analytical indicator, not a corrected physical fire count.

### Stage 8: Quality assessment

Track:

- Record completeness.
- Missing time intervals.
- Sensor availability.
- Baseline sample size.
- Processing version.
- Calibration status.
- Data quality limitations.

# 8. HISTORICAL ANOMALY DETECTION

Implement a statistical baseline approach first.

Compare an observation period against historical observations from the same calendar month.

Example:

Current June activity versus previous June activity.

Provide classifications:

- Within historical range.
- Elevated.
- Unusually high.
- Unusually low.
- Insufficient historical data.

Do not generate official emergency warnings.

Do not interpret anomalies as confirmed wildfire emergencies.

# 9. AI INTEGRATION

AI is optional.

If implemented, it must interpret actual backend calculations.

It can explain:

- Why activity appears elevated.
- How the historical baseline was calculated.
- What the sensor differences mean.
- Which observations contribute to the analysis.
- What limitations apply.

It must never invent NASA observations, statistics or scientific conclusions.

# 10. COMPLETE USER EXPERIENCE

The application must support this workflow:

1. User opens FIRECHRONOS.
2. User explores the global map.
3. User selects a geographic area.
4. User selects a historical date range.
5. Application retrieves or loads available data.
6. Backend validates the observations.
7. Harmonization engine processes them.
8. Application displays the burning activity calendar.
9. User examines historical patterns.
10. User compares MODIS and VIIRS.
11. User investigates unusual activity.
12. User downloads the analysis.

# 11. DEVELOPMENT PRIORITIES

### P0 — Essential

- NASA data ingestion.
- Data validation.
- Spatial and temporal aggregation.
- Harmonization engine.
- Burning activity calendar.
- Geographic selection.
- Historical analysis.

### P1 — Important

- Sensor comparison.
- Anomaly detection.
- Data quality.
- Report generation.

### P2 — Optional

- AI explanation assistant.
- Advanced ML.
- Environmental context.
- Advanced calibration.

# 12. AI DEVELOPMENT AGENT BEHAVIOUR

You must follow these instructions throughout development.

1. Read all project documentation before editing code.
2. Understand the existing architecture.
3. Never independently redesign the entire architecture.
4. Work on the requested module.
5. Reuse existing components.
6. Preserve established API contracts.
7. Use authentic NASA data.
8. Never create fabricated scientific records.
9. Test every important calculation.
10. Maintain responsive design.
11. Maintain clear error handling.
12. Update PROJECT_STATUS.md after completing major work.
13. Explain important technical decisions.
14. Identify dependencies before changing shared code.
15. Never claim a feature is complete until it has been tested.

Before beginning any major task, explain:

- What you are going to implement.
- Which files will change.
- Which dependencies are required.
- Which existing components will be reused.
- How the result will be tested.

# 13. FINAL DEFINITION OF DONE

FIRECHRONOS is complete when:

- Authentic MODIS data is integrated.
- Authentic VIIRS data is integrated.
- Original sensor information is preserved.
- A common analytical framework exists.
- Harmonized activity indicators are calculated.
- The calendar works for selected regions.
- Historical comparisons work.
- Sensor comparisons work.
- Data limitations are visible.
- The frontend and backend are integrated.
- The application is publicly accessible.
- The demonstration works without relying on a live API request at every step.
- The methodology is documented.

The primary goal is not the number of features.

The primary goal is a working and scientifically defensible harmonized burning activity calendar.

---

10. Hackathon rules

- Do not waste time building unnecessary authentication.
- Do not integrate technologies just to increase the technology count.
- Do not replace actual NASA data with sample statistics.
- Use archived NASA data as a clearly labelled fallback.
- Do not make unsupported scientific claims.
- Keep the core application functional even if optional modules fail.

DOCUMENT 3 — SKILLS.md

# FIRECHRONOS AI DEVELOPMENT SKILLS

This file defines the specialized capabilities the development agent should apply.

## SKILL 1: NASA DATA RESEARCH

**Purpose:** Retrieve and understand official satellite datasets.

Required capabilities:

- Research NASA FIRMS.
- Understand MODIS Collection 6.1.
- Understand VIIRS active-fire products.
- Understand satellite identifiers.
- Understand product versions.
- Understand observation attributes.
- Understand confidence fields.
- Understand FRP.
- Interpret NRT and standard products.
- Read API documentation.

Expected output:

A verified dataset specification and ingestion implementation.

Do not assume that every product exposes identical fields.

## SKILL 2: GEOSPATIAL DATA PROCESSING

**Purpose:** Process satellite observations geographically.

Required capabilities:

- Latitude/longitude processing.
- Coordinate reference systems.
- Point-in-polygon queries.
- Bounding-box filtering.
- AOI selection.
- Spatial grid generation.
- Spatial aggregation.
- GeoJSON.
- PostGIS queries.

Expected output:

A reliable geospatial processing module.

## SKILL 3: SATELLITE DATA HARMONIZATION

**Purpose:** Make cross-sensor comparisons more meaningful.

Required capabilities:

- Sensor-specific data analysis.
- Common spatial aggregation.
- Temporal aggregation.
- Statistical normalization.
- Historical baseline construction.
- Overlap-period analysis.
- Calibration experiments.
- Data quality evaluation.

Expected output:

A transparent and reproducible harmonization engine.

Never equate a common grid with identical sensor sensitivity.

## SKILL 4: STATISTICAL ANALYSIS

**Purpose:** Identify meaningful historical patterns.

Required capabilities:

- Mean and median.
- Standard deviation.
- Z-scores.
- Seasonal comparisons.
- Time-series aggregation.
- Correlation.
- Robust statistics.
- Anomaly detection.
- Missing-data analysis.

Expected output:

Reliable regional historical analysis.

## SKILL 5: FRONTEND DEVELOPMENT

**Purpose:** Build the scientific application.

Required capabilities:

- React.
- TypeScript.
- Tailwind CSS.
- Responsive design.
- Reusable components.
- State management.
- API integration.
- Loading and error states.
- Component testing.

Expected output:

A professional and responsive scientific interface.

## SKILL 6: GEOSPATIAL VISUALIZATION

**Purpose:** Display satellite observations meaningfully.

Required capabilities:

- MapLibre.
- Geographic layers.
- Point visualization.
- Heatmaps.
- Layer filters.
- AOI drawing.
- Map interactions.
- Spatial selection.

Expected output:

An interactive global and regional map.

## SKILL 7: SCIENTIFIC DATA VISUALIZATION

**Purpose:** Communicate analytical results.

Required capabilities:

- Calendar heatmaps.
- Time-series charts.
- Sensor comparisons.
- Seasonal profiles.
- Historical baseline plots.
- Anomaly indicators.
- Data completeness visualization.

Expected output:

Charts that explain actual scientific results rather than decorative statistics.

## SKILL 8: API AND DATABASE ENGINEERING

**Purpose:** Connect all modules.

Required capabilities:

- FastAPI.
- Pydantic.
- REST API design.
- PostgreSQL.
- PostGIS.
- SQLAlchemy.
- Database migrations.
- Caching.
- Pagination.

Expected output:

Reliable backend services.

## SKILL 9: AI/ML INTEGRATION

**Purpose:** Add intelligence where scientifically justified.

Required capabilities:

- Scikit-learn.
- Isolation Forest.
- Clustering.
- Statistical anomaly detection.
- Model evaluation.
- Explainability.
- LLM integration with verified backend results.

Expected output:

Optional research-oriented analytical capabilities.

## SKILL 10: SOFTWARE TESTING AND DEBUGGING

**Purpose:** Ensure reliability.

Required capabilities:

- Pytest.
- API testing.
- Frontend testing.
- Data validation.
- Integration testing.
- Error analysis.
- Performance testing.
- Deployment troubleshooting.

Expected output:

A working and demonstrable product.

## Skill execution priority

| Skill | Priority |
|---|---|
| NASA data research | Critical |
| Data harmonization | Critical |
| Geospatial processing | Critical |
| Backend development | Critical |
| Frontend development | Critical |
| Scientific visualization | High |
| Statistical analysis | High |
| Testing | High |
| Advanced AI/ML | Optional |

---
