param(
    [string]$ApiBaseUrl = "http://localhost:38191",
    [switch]$IncludeDocker,
    [switch]$IncludeExpoWebBundle,
    [switch]$IncludeAndroidBundle,
    [string]$ExpoWebBundleUrl = "http://localhost:38201/index.ts.bundle?platform=web&dev=true&hot=false&transform.engine=hermes&transform.routerRoot=app&unstable_transformProfile=hermes-stable",
    [string]$AndroidBundleUrl = "http://localhost:8081/index.bundle?platform=android&dev=true&hot=false&lazy=true&transform.engine=hermes&transform.bytecode=1&transform.routerRoot=app&unstable_transformProfile=hermes-stable"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Write-Step {
    param([string]$Message)
    Write-Host "[smoke] $Message"
}

function Assert-True {
    param(
        [bool]$Condition,
        [string]$Message
    )

    if (-not $Condition) {
        throw $Message
    }
}

function Invoke-Json {
    param([string]$Uri)
    Invoke-RestMethod -Uri $Uri -Method Get
}

function Test-Bundle {
    param(
        [string]$Name,
        [string]$Uri
    )

    Write-Step "Checking $Name bundle"
    $response = Invoke-WebRequest -UseBasicParsing $Uri
    Assert-True ($response.StatusCode -eq 200) "$Name bundle returned status $($response.StatusCode)"
    Assert-True ($response.Content.Length -gt 100000) "$Name bundle was unexpectedly small: $($response.Content.Length) bytes"
    Write-Step "$Name bundle OK ($($response.Content.Length) bytes)"
}

if ($IncludeDocker) {
    Write-Step "Checking Docker containers"
    $requiredContainers = @(
        "vibespot-postgres",
        "vibespot-redis",
        "vibespot-minio",
        "vibespot-api",
        "vibespot-worker"
    )
    $containerRows = docker ps --format "{{.Names}}|{{.Status}}"
    foreach ($containerName in $requiredContainers) {
        $row = $containerRows | Where-Object { $_ -like "$containerName|*" } | Select-Object -First 1
        Assert-True ($null -ne $row) "Missing running container: $containerName"
        Assert-True ($row -match "\|Up ") "Container is not up: $row"
    }
}

Write-Step "Checking API health"
$health = Invoke-Json "$ApiBaseUrl/health"
Assert-True ($health.success -eq $true) "Health response did not use a success envelope"
Assert-True ($health.data.status -eq "ok") "Health status was not ok"
Assert-True ($health.data.service -eq "vibespot-api") "Unexpected health service name"
Assert-True (-not [string]::IsNullOrWhiteSpace($health.trace_id)) "Health response did not include trace_id"

Write-Step "Checking nearby places"
$nearby = Invoke-Json "$ApiBaseUrl/places/nearby?lat=12.9352&lng=77.6245&radius_m=2500"
Assert-True ($nearby.success -eq $true) "Nearby response did not use a success envelope"
Assert-True ($nearby.data.Count -ge 3) "Nearby response returned fewer than 3 places"
Assert-True ($nearby.data[0].slug -eq "kissa-focus") "Expected kissa-focus to be the closest seeded place"
Assert-True ($nearby.data[0].distance_m -le 20) "Closest seeded place distance looked wrong"

Write-Step "Checking intent search"
$searchQuery = [System.Uri]::EscapeDataString("quiet cafe with strong wifi")
$search = Invoke-Json "$ApiBaseUrl/places/search?query=$searchQuery&lat=12.9352&lng=77.6245&radius_m=2500"
Assert-True ($search.success -eq $true) "Search response did not use a success envelope"
Assert-True ($search.data.Count -ge 1) "Search response returned no places"
Assert-True ($search.data[0].slug -eq "kissa-focus") "Search did not rank kissa-focus first for quiet wifi"
Assert-True (-not [string]::IsNullOrWhiteSpace($search.data[0].reason)) "Search result did not include a reason"

Write-Step "Checking place detail"
$detail = Invoke-Json "$ApiBaseUrl/places/kissa-focus"
Assert-True ($detail.success -eq $true) "Place detail response did not use a success envelope"
Assert-True ($detail.data.slug -eq "kissa-focus") "Place detail returned the wrong slug"
Assert-True ($detail.data.recent_vibe_checks.Count -ge 1) "Place detail returned no recent vibe checks"

Write-Step "Checking OTP auth and profile"
$authStart = Invoke-RestMethod -Uri "$ApiBaseUrl/auth/start" -Method Post -ContentType "application/json" -Body '{"email":"priya@vibespot.local"}'
Assert-True ($authStart.success -eq $true) "Auth start response did not use a success envelope"
Assert-True ($authStart.data.delivery -eq "local_response") "Auth start did not use local response delivery"
Assert-True ($authStart.data.otp_code.Length -eq 6) "Auth start did not return a six-digit local OTP"

$login = Invoke-RestMethod -Uri "$ApiBaseUrl/auth/verify" -Method Post -ContentType "application/json" -Body (@{
    email = "priya@vibespot.local"
    otp_code = $authStart.data.otp_code
} | ConvertTo-Json -Compress)
Assert-True ($login.success -eq $true) "Auth verify response did not use a success envelope"
Assert-True ($login.data.access_token.Length -ge 32) "Auth verify did not return a session token"
Assert-True ($login.data.user.handle -eq "priya") "Auth verify returned the wrong user"

$authHeaders = @{ Authorization = "Bearer $($login.data.access_token)" }
$me = Invoke-RestMethod -Uri "$ApiBaseUrl/auth/me" -Headers $authHeaders
Assert-True ($me.success -eq $true) "Auth me response did not use a success envelope"
Assert-True ($me.data.handle -eq "priya") "Auth me returned the wrong user"

$profile = Invoke-RestMethod -Uri "$ApiBaseUrl/profiles/me" -Headers $authHeaders
Assert-True ($profile.success -eq $true) "Profile response did not use a success envelope"
Assert-True ($profile.data.stats.vibe_checks_count -ge 1) "Profile returned no seeded vibe checks"
Assert-True ($profile.data.recent_drops.Count -ge 1) "Profile returned no recent drops"

Write-Step "Checking error envelope"
try {
    Invoke-Json "$ApiBaseUrl/places/not-a-real-place" | Out-Null
    throw "Expected missing place request to fail"
}
catch {
    $webResponse = $_.Exception.Response
    Assert-True ($null -ne $webResponse) "Missing place request did not include an HTTP response"
    Assert-True ([int]$webResponse.StatusCode -eq 404) "Missing place returned status $([int]$webResponse.StatusCode), expected 404"

    $rawBody = $_.ErrorDetails.Message
    if ([string]::IsNullOrWhiteSpace($rawBody)) {
        $stream = $webResponse.GetResponseStream()
        $reader = [System.IO.StreamReader]::new($stream)
        $rawBody = $reader.ReadToEnd()
    }

    $body = $rawBody | ConvertFrom-Json
    Assert-True ($body.success -eq $false) "Error response did not use a failure envelope"
    Assert-True ($body.error.code -eq "not_found") "Error code was not not_found"
    Assert-True (-not [string]::IsNullOrWhiteSpace($body.trace_id)) "Error response did not include trace_id"
}

if ($IncludeExpoWebBundle) {
    Test-Bundle "Expo web" $ExpoWebBundleUrl
}

if ($IncludeAndroidBundle) {
    Test-Bundle "Android" $AndroidBundleUrl
}

Write-Step "Local smoke checks passed"
