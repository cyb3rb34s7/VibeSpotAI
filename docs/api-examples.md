# API Examples

All API responses use:

```json
{
  "success": true,
  "data": {},
  "trace_id": "73DhiAULMA"
}
```

Errors use the same envelope:

```json
{
  "success": false,
  "error": {
    "code": "not_found",
    "message": "Not Found",
    "details": {}
  },
  "trace_id": "73DhiAULMA"
}
```

## Health

```powershell
curl.exe http://localhost:38191/health
```

## Nearby Places

```powershell
curl.exe "http://localhost:38191/places/nearby?lat=12.9352&lng=77.6245&radius_m=2500"
```

Returns seeded Koramangala places ordered by PostGIS distance.

## Place Detail

```powershell
curl.exe http://localhost:38191/places/kissa-focus
```

Returns the place profile, summary, signal averages, and recent vibe checks.

## Submit Vibe Check

```powershell
$payload = @{
  visit_intent = "deep_work"
  noise_score = 18
  wifi_score = 5
  crowd_level = "low"
  best_use_case = "Deep Work"
  recommend_mode = "yes"
  short_note = "calm corner table, excellent wifi"
  location_confidence = 0.9
} | ConvertTo-Json -Compress

Invoke-RestMethod `
  -Uri http://localhost:38191/places/kissa-focus/vibe-checks `
  -Method Post `
  -ContentType "application/json" `
  -Body $payload
```

Local submissions use the seeded `priya` demo user until auth is designed.
