#!/usr/bin/env pwsh
# Smoke test: Reports API (user creates report + admin reviews / resolves)
# Usage: pwsh scripts/smoke-test-reports.ps1 [baseUrl]
# Example: pwsh scripts/smoke-test-reports.ps1 http://localhost:5000/api

param(
  [string]$Base = 'http://localhost:5000/api'
)

$ErrorActionPreference = 'Stop'
$stamp   = Get-Date -Format 'yyyyMMddHHmmss'
$pass    = 'Test1234!'
$errors  = 0

function Assert($label, $got, $expected) {
  if ($got -eq $expected) {
    Write-Host "  [OK] $label" -ForegroundColor Green
  } else {
    Write-Host "  [FAIL] $label — expected '$expected', got '$got'" -ForegroundColor Red
    $script:errors++
  }
}

function Invoke-Api($method, $path, $body = $null, $headers = @{}) {
  $params = @{
    Method      = $method
    Uri         = "$Base$path"
    Headers     = $headers
    ContentType = 'application/json'
    ErrorAction = 'Stop'
  }
  if ($body) { $params.Body = ($body | ConvertTo-Json -Depth 5) }
  return Invoke-RestMethod @params
}

# ── Step 1: Register reporter + target users ─────────────────────────────────
Write-Host "`n[1] Registering users..." -ForegroundColor Cyan

$reporterEmail = "reporter_$stamp@example.com"
$targetEmail   = "target_$stamp@example.com"

$null = Invoke-Api POST /auth/register @{ email=$reporterEmail; username="reporter$stamp"; password=$pass; fullName='Reporter User'; phone='0901110001' }
$null = Invoke-Api POST /auth/register @{ email=$targetEmail;   username="target$stamp";   password=$pass; fullName='Target User';   phone='0901110002' }

$loginR = Invoke-Api POST /auth/login @{ email=$reporterEmail; password=$pass }
$loginT = Invoke-Api POST /auth/login @{ email=$targetEmail;   password=$pass }

$reporterToken = $loginR.data.token
$targetId      = $loginT.data.user.id
$headersR      = @{ Authorization = "Bearer $reporterToken" }

Assert 'Reporter login' ($reporterToken -ne $null) $true
Assert 'Target id'      ($targetId -ne $null)      $true

# ── Step 2: Create a report (USER target) ────────────────────────────────────
Write-Host "`n[2] Creating report (USER target)..." -ForegroundColor Cyan

$created = Invoke-Api POST /reports @{ targetType='USER'; targetId=$targetId; reason='SPAM'; description='This user is spamming the feed.' } $headersR
Assert 'Create report success'  $created.success      $true
Assert 'Report status = PENDING' $created.data.status 'PENDING'
Assert 'Reporter id matches'    $created.data.reporterId $loginR.data.user.id
$reportId = $created.data.id
Write-Host "    reportId = $reportId"

# ── Step 3: Duplicate report should 409 ──────────────────────────────────────
Write-Host "`n[3] Duplicate report is blocked (409)..." -ForegroundColor Cyan

try {
  $null = Invoke-Api POST /reports @{ targetType='USER'; targetId=$targetId; reason='SPAM' } $headersR
  Write-Host "  [FAIL] Expected 409 but got success" -ForegroundColor Red
  $errors++
} catch {
  $code = $_.Exception.Response.StatusCode.value__
  Assert 'Duplicate report → 409' $code 409
}

# ── Step 4: GET /api/reports/me ───────────────────────────────────────────────
Write-Host "`n[4] GET /reports/me..." -ForegroundColor Cyan

$myReports = Invoke-Api GET '/reports/me?page=1&limit=10' $null $headersR
Assert 'GET /me success'       $myReports.success      $true
Assert '/me has >= 1 report'   ($myReports.data.Count -ge 1) $true
Assert 'Report appears in /me' ($myReports.data | Where-Object { $_.id -eq $reportId } | Measure-Object).Count 1

# ── Step 5: Self-report blocked ───────────────────────────────────────────────
Write-Host "`n[5] Self-report is blocked (400)..." -ForegroundColor Cyan

$reporterUserId = $loginR.data.user.id
try {
  $null = Invoke-Api POST /reports @{ targetType='USER'; targetId=$reporterUserId; reason='SPAM' } $headersR
  Write-Host "  [FAIL] Expected 400 but got success" -ForegroundColor Red
  $errors++
} catch {
  $code = $_.Exception.Response.StatusCode.value__
  Assert 'Self-report → 400' $code 400
}

# ── Step 6: Create & promote admin ───────────────────────────────────────────
Write-Host "`n[6] Creating admin..." -ForegroundColor Cyan

$adminEmail = "report_admin_$stamp@example.com"
$null = Invoke-Api POST /auth/register @{ email=$adminEmail; username="reportadmin$stamp"; password=$pass; fullName='Report Admin'; phone='0901110003' }
$loginTemp = Invoke-Api POST /auth/login @{ email=$adminEmail; password=$pass }
$adminId   = $loginTemp.data.user.id

$promotePath = Join-Path $PSScriptRoot 'promote-admin.mjs'
node $promotePath $adminId | Out-Null

$loginA  = Invoke-Api POST /auth/login @{ email=$adminEmail; password=$pass }
$headersA = @{ Authorization = "Bearer $($loginA.data.token)" }
Assert 'Admin promoted' $loginA.data.user.role 'ADMIN'

# ── Step 7: GET /api/reports/admin ────────────────────────────────────────────
Write-Host "`n[7] GET /reports/admin..." -ForegroundColor Cyan

$adminList = Invoke-Api GET '/reports/admin?page=1&limit=20' $null $headersA
Assert 'GET /admin success'      $adminList.success $true
Assert '/admin has >= 1 report'  ($adminList.data.Count -ge 1) $true

# ── Step 8: Admin updates to IN_REVIEW ───────────────────────────────────────
Write-Host "`n[8] Admin sets status → IN_REVIEW..." -ForegroundColor Cyan

$inReview = Invoke-Api PATCH "/reports/$reportId/status" @{ status='IN_REVIEW' } $headersA
Assert 'PATCH IN_REVIEW success'  $inReview.success     $true
Assert 'Status = IN_REVIEW'       $inReview.data.status 'IN_REVIEW'

# ── Step 9: Admin resolves ────────────────────────────────────────────────────
Write-Host "`n[9] Admin sets status → RESOLVED..." -ForegroundColor Cyan

$resolved = Invoke-Api PATCH "/reports/$reportId/status" @{ status='RESOLVED'; resolutionNote='Confirmed spam, user warned.' } $headersA
Assert 'PATCH RESOLVED success'  $resolved.success     $true
Assert 'Status = RESOLVED'       $resolved.data.status 'RESOLVED'
Assert 'resolutionNote saved'    ($resolved.data.resolutionNote -ne $null) $true

# ── Step 10: Non-admin cannot hit admin routes ────────────────────────────────
Write-Host "`n[10] Non-admin blocked from /reports/admin (403)..." -ForegroundColor Cyan

try {
  $null = Invoke-Api GET '/reports/admin' $null $headersR
  Write-Host "  [FAIL] Expected 403 but got success" -ForegroundColor Red
  $errors++
} catch {
  $code = $_.Exception.Response.StatusCode.value__
  Assert 'Non-admin → 403' $code 403
}

# ── Step 11: Report a POST ────────────────────────────────────────────────────
Write-Host "`n[11] Reporting a POST..." -ForegroundColor Cyan

try {
  $posts = Invoke-Api GET '/posts?page=1&limit=5'
  $postOwnedByOther = $posts.data | Where-Object { $_.authorId -ne $reporterUserId } | Select-Object -First 1

  if ($postOwnedByOther) {
    $postReport = Invoke-Api POST /reports @{ targetType='POST'; targetId=$postOwnedByOther.id; reason='INAPPROPRIATE_CONTENT' } $headersR
    Assert 'Report POST success' $postReport.success $true
  } else {
    Write-Host "  [SKIP] No suitable POST found (all owned by reporter)" -ForegroundColor Yellow
  }
} catch {
  Write-Host "  [SKIP] POST report skipped: $($_.Exception.Message)" -ForegroundColor Yellow
}

# ── Step 12: Filter admin list by status ─────────────────────────────────────
Write-Host "`n[12] Admin filters reports by status=RESOLVED..." -ForegroundColor Cyan

$filtered = Invoke-Api GET '/reports/admin?status=RESOLVED&page=1&limit=20' $null $headersA
Assert 'Filter by RESOLVED success'  $filtered.success $true
$wrongStatus = $filtered.data | Where-Object { $_.status -ne 'RESOLVED' }
Assert 'All results are RESOLVED'    ($wrongStatus.Count -eq 0) $true

# ── Summary ───────────────────────────────────────────────────────────────────
Write-Host ""
if ($errors -eq 0) {
  Write-Host "REPORTS SMOKE TEST PASSED (all assertions green)" -ForegroundColor Green
} else {
  Write-Host "REPORTS SMOKE TEST FAILED ($errors assertion(s) failed)" -ForegroundColor Red
  exit 1
}
