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

## Intent Search

```powershell
curl.exe "http://localhost:38191/places/search?query=quiet%20cafe%20with%20strong%20wifi&lat=12.9352&lng=77.6245&radius_m=2500"
```

Returns seeded places ranked by explicit keyword intent scoring plus distance, with a short `reason` for each match.

## Place Detail

```powershell
curl.exe http://localhost:38191/places/kissa-focus
```

Returns the place profile, summary, signal averages, and recent vibe checks.

## Local Dev Login

```powershell
$login = Invoke-RestMethod `
  -Uri http://localhost:38191/auth/dev-login `
  -Method Post `
  -ContentType "application/json" `
  -Body '{"handle":"priya"}'

$token = $login.data.access_token
```

Returns a local-only bearer token and the seeded user profile. This is a development adapter, not production OTP/auth.

## Current User

```powershell
Invoke-RestMethod `
  -Uri http://localhost:38191/auth/me `
  -Headers @{ Authorization = "Bearer $token" }
```

## My Profile

```powershell
Invoke-RestMethod `
  -Uri http://localhost:38191/profiles/me `
  -Headers @{ Authorization = "Bearer $token" }
```

Returns the current user, contribution counts, taste tags, and recent drops.

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
  -Headers @{ Authorization = "Bearer $token" } `
  -Body $payload
```

Without an authorization header, local submissions still fall back to the seeded `priya` demo user.
