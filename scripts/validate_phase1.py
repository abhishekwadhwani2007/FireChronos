import json, sqlite3

cal = json.load(open('data/processed/india_daily_calendar.json'))
grid = json.load(open('data/processed/india_grid_top_hotspots.json'))
baseline = json.load(open('data/processed/india_monthly_baseline.json'))
meta = json.load(open('data/processed/metadata.json'))

issues = []

required = ['date','year','month','day','viirs_count','viirs_frp_sum','viirs_frp_mean',
            'viirs_frp_max','modis_calibrated_count','modis_calibrated_frp','hai',
            'anomaly_score','anomaly_class','anomaly_code','confidence','daynight','top_hotspots']
for d in cal:
    for field in required:
        if field not in d:
            issues.append('Missing field ' + field + ' on ' + d.get('date','?'))

out_range = [d for d in cal if not (0 <= d['hai'] <= 100)]
if out_range:
    issues.append('HAI out of range: ' + str(len(out_range)) + ' days')

dates = [d['date'] for d in cal]
dupes = len(dates) - len(set(dates))
if dupes > 0:
    issues.append(str(dupes) + ' duplicate dates found')

days_with_data = [d for d in cal if d['viirs_count'] > 100]
no_hotspots = [d for d in days_with_data if len(d['top_hotspots']) == 0]
if no_hotspots:
    issues.append(str(len(no_hotspots)) + ' active days with 0 hotspots stored')

if len(grid) == 0:
    issues.append('Empty spatial grid')

db = sqlite3.connect('data/processed/fire_events.db')
cur = db.cursor()
cur.execute('SELECT COUNT(*) FROM daily_hotspots')
db_count = cur.fetchone()[0]
db.close()

years_covered = sorted(set(d['year'] for d in cal))
anomaly_counts = {}
for code in ['HIGH','ELEVATED','NORMAL','LOW']:
    anomaly_counts[code] = sum(1 for d in cal if d['anomaly_code'] == code)

grid_lat_range = (round(min(g['lat'] for g in grid),2), round(max(g['lat'] for g in grid),2))
grid_lon_range = (round(min(g['lon'] for g in grid),2), round(max(g['lon'] for g in grid),2))

print('=== FIRECHRONOS PHASE 1 VALIDATION REPORT ===')
print('Calendar days: ' + str(len(cal)))
print('Date range: ' + cal[0]['date'] + ' to ' + cal[-1]['date'])
print('Years covered: ' + str(years_covered))
print('Total detections: ' + str(meta['total_detections']))
print('HAI range: ' + str(min(d['hai'] for d in cal)) + ' to ' + str(max(d['hai'] for d in cal)))
print('Anomaly distribution: ' + str(anomaly_counts))
print('Duplicate dates: ' + str(dupes))
print('Grid cells: ' + str(len(grid)))
print('Grid lat range: ' + str(grid_lat_range) + ', lon range: ' + str(grid_lon_range))
print('Baseline months: ' + str(len(baseline)))
print('SQLite hotspot records: ' + str(db_count))
print('Sensors documented: ' + str([s['id'] for s in meta['sensors']]))
print('Generated at: ' + meta['generated_at'])
print('')
if issues:
    print('ISSUES FOUND (' + str(len(issues)) + '):')
    for issue in issues:
        print('  - ' + issue)
else:
    print('ALL CHECKS PASSED - Phase 1 is fully validated and complete!')
