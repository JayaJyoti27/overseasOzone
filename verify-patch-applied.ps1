# Run this from C:\ozone-global-bridge-main
# Checks whether the key changes from publish-fix-real-schema.patch
# (and the earlier publish-at-approval.patch) are actually present in
# your working files - not just that "git apply" succeeded.

$ErrorActionPreference = "SilentlyContinue"
$root = Get-Location
$pass = 0
$fail = 0

function Check($label, $file, $pattern, $shouldExist = $true) {
    $script:count = 0
    if (Test-Path $file) {
        $found = Select-String -Path $file -Pattern $pattern -SimpleMatch -Quiet
    } else {
        $found = $false
    }

    if ($found -eq $shouldExist) {
        Write-Host "[PASS] $label" -ForegroundColor Green
        $script:pass++
    } else {
        Write-Host "[FAIL] $label" -ForegroundColor Red
        Write-Host "       file: $file" -ForegroundColor DarkGray
        $script:fail++
    }
}

Write-Host "`nChecking backend/src/services/admin/jobOrders.ts ..." -ForegroundColor Cyan

Check "approveForRecruitment() publishes to candidates" `
    "backend\src\services\admin\jobOrders.ts" `
    "await publishJobOrderToCandidates(jobOrderId);"

Check "publish payload uses real column 'sector' (not 'category')" `
    "backend\src\services\admin\jobOrders.ts" `
    "sector: jobOrder.category"

Check "publish payload no longer references nonexistent 'company' field" `
    "backend\src\services\admin\jobOrders.ts" `
    "company: jobOrder.employer" `
    $false

Check "publish payload no longer references nonexistent 'salary' field" `
    "backend\src\services\admin\jobOrders.ts" `
    "salary: jobOrder.salary_min" `
    $false

Check "self-heal covers approved_for_recruitment too" `
    "backend\src\services\admin\jobOrders.ts" `
    'data.status === "approved_for_recruitment"'

Write-Host "`nChecking backend/src/services/candidates/jobs.ts ..." -ForegroundColor Cyan

Check "attachCompanyNames() join helper exists" `
    "backend\src\services\candidates\jobs.ts" `
    "async function attachCompanyNames"

Check "sector filter fixed (was querying nonexistent 'category' column)" `
    "backend\src\services\candidates\jobs.ts" `
    'query.eq("sector", filters.category)'

Write-Host "`nChecking frontend types + components ..." -ForegroundColor Cyan

Check "CandidateJob type uses salary_min/salary_max" `
    "src\lib\candidate\types.ts" `
    "salary_min?: number | null;"

Check "formatJobSalary helper exists" `
    "src\lib\candidate\formatJobSalary.ts" `
    "export function formatJobSalary"

Check "JobCard uses formatJobSalary" `
    "src\components\Candidate\Jobs\JobCard.tsx" `
    "formatJobSalary"

Write-Host "`n----------------------------------------"
Write-Host "$pass passed, $fail failed" -ForegroundColor $(if ($fail -eq 0) { "Green" } else { "Yellow" })

if ($fail -eq 0) {
    Write-Host "`nEverything from the patch looks applied. If jobs still aren't showing:" -ForegroundColor Green
    Write-Host " 1. Make sure you FULLY restarted the backend (stop + npm run dev again)."
    Write-Host " 2. Re-open the admin job order detail page to trigger self-heal publish."
    Write-Host " 3. Check the backend terminal for 'Unable to publish job order...' errors."
} else {
    Write-Host "`nSome expected changes are missing. Re-run:" -ForegroundColor Yellow
    Write-Host '   git apply --check "$env:USERPROFILE\Downloads\publish-fix-real-schema.patch"'
    Write-Host "and paste me the output."
}
