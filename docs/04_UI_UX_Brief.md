# FIRECHRONOS — UI/UX Brief

## Design Principles

1. **Scientific clarity first** — never hide the sensor origin.
2. **Calendar is the hero** — it must feel like the central product, not a side widget.
3. **Progressive disclosure** — global overview → region → day detail.
4. **Dark / data-dense friendly** — many users will be scientists working late.
5. **Fast perceived performance** — skeleton loaders, optimistic UI.

## Visual Language

- **Primary palette:** Deep space navy (#0B1120) + ember orange (#F97316) + cool cyan (#22D3EE)
- **Typography:** Inter / Geist for UI, JetBrains Mono for data values
- **Map style:** Dark basemap (Carto Dark or MapLibre dark) with glowing fire points
- **Calendar:** GitHub-style contribution heatmap but with dual-sensor coloring + harmonized mode

## Key Screens

### 1. Landing
- Full-viewport dark map
- Floating search + “Try India demo” button
- Minimal chrome

### 2. Regional View (most important)
```
┌────────────────────────────────────────────────────────────┐
│  FIRECHRONOS  |  India  |  2020–2026  |  [MODIS] [VIIRS] [Harmonized] │
├──────────────────────────────┬─────────────────────────────┤
│                              │  Summary Metrics            │
│     CALENDAR HEATMAP         │  • Total detections         │
│     (year / month / day)     │  • Peak day                 │
│                              │  • Anomaly score            │
│                              │  • Sensor split pie         │
│                              ├─────────────────────────────┤
│                              │  Mini map of region         │
└──────────────────────────────┴─────────────────────────────┘
│  Tabs: Overview | Sensor Lab | Trends | Methodology        │
└────────────────────────────────────────────────────────────┘
```

### 3. Day Detail Drawer
- List of individual hotspots with confidence & FRP
- Small map centered on the day
- Sensor badges

### 4. Sensor Lab
- Dual line charts
- Agreement scatter
- Normalization equation shown in plain language

## Interaction Notes

- Sensor toggle immediately recolors the calendar.
- Hovering a calendar cell shows a rich tooltip (never just a number).
- All charts must have clear axis labels and units.
- Mobile: calendar becomes scrollable; map becomes secondary.

## Accessibility

- Sufficient contrast
- Keyboard navigation for calendar
- Screen-reader labels for sensor layers

---

**Document Owner:** Design Lead  
**Last Updated:** 13 November 2026  
