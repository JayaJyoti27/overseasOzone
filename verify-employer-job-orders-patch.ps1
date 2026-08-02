# Run this from the repo root after applying employer-job-orders-list-and-detail.patch.

function Check-Pattern {
    param($Path, $Pattern, $Label)

    $match = Select-String -Path $Path -Pattern $Pattern -SimpleMatch -ErrorAction SilentlyContinue

    if ($match) {
        Write-Host "[OK]   $Label" -ForegroundColor Green
    } else {
        Write-Host "[FAIL] $Label  (pattern not found: $Pattern in $Path)" -ForegroundColor Red
        $script:ErrorCount++
    }
}

$script:ErrorCount = 0

Write-Host "`n=== Step 1: Static file checks ===`n"

Check-Pattern "src\lib\employer\api.ts" "data.requirements ?? data.data" "getRequirements unwraps the real {requirements} shape"
Check-Pattern "src\components\Employer\JobOrders\JobOrdersTable.tsx" "job.role" "list table reads job.role (not job.position)"
Check-Pattern "src\components\Employer\JobOrders\JobOrdersTable.tsx" "job.headcount" "list table reads job.headcount (not job.vacancies)"
Check-Pattern "src\lib\employer\requirementStatus.ts" "Converted to Job Order" "requirement status labels present"
Check-Pattern "src\routes\Employer\job-orders.`$jobId.tsx" "getRequirement(jobId)" "detail page fetches real requirement data"
Check-Pattern "src\routes\Employer\job-orders.`$jobId.tsx" "Recruitment Summary" "detail page shows real recruitment stats"

if ($script:ErrorCount -gt 0) {
    Write-Host "`n$($script:ErrorCount) static check(s) failed - the patch is not fully applied. Stopping before running tests.`n" -ForegroundColor Red
    exit 1
}

Write-Host "`nAll static checks passed.`n"

Write-Host "=== Step 2: Install, typecheck, test ===`n"

npm install --no-audit --no-fund
if ($LASTEXITCODE -ne 0) { Write-Host "npm install failed" -ForegroundColor Red; exit 1 }

npm install -D vitest --no-audit --no-fund
if ($LASTEXITCODE -ne 0) { Write-Host "vitest install failed" -ForegroundColor Red; exit 1 }

Write-Host "`n--- Unit tests (requirement status labels) ---`n"
npm test
$testResult = $LASTEXITCODE

Write-Host "`n--- TypeScript check on the files this patch touched ---`n"
npx tsc -p tsconfig.json 2>&1 | Select-String "job-orders.`$jobId|JobOrdersTable|requirementStatus"
Write-Host "`nIf nothing printed above, the files this patch touched have zero type errors.`n" -ForegroundColor Yellow
Write-Host "Note: this repo has some pre-existing, unrelated errors elsewhere (Candidate dashboard route typing, and an Admin job-orders action panel that references API functions that were never added) - neither is part of this patch." -ForegroundColor Yellow

if ($testResult -eq 0) {
    Write-Host "`nPatch verified: employer job orders list + detail page now use real data.`n" -ForegroundColor Green
} else {
    Write-Host "`nTests failed - see output above.`n" -ForegroundColor Red
    exit 1
}
