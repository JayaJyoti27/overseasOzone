# Run this from C:\ozone-global-bridge-main
# Checks whether the changes from job-detail-and-search.patch are actually
# present in your working files.

$ErrorActionPreference = "SilentlyContinue"
$pass = 0
$fail = 0

function Check($label, $file, $pattern) {
    if (Test-Path $file) {
        $found = Select-String -Path $file -Pattern $pattern -SimpleMatch -Quiet
    } else {
        $found = $false
    }

    if ($found) {
        Write-Host "[PASS] $label" -ForegroundColor Green
        $script:pass++
    } else {
        Write-Host "[FAIL] $label" -ForegroundColor Red
        Write-Host "       file: $file" -ForegroundColor DarkGray
        $script:fail++
    }
}

Write-Host "`nChecking job detail page ..." -ForegroundColor Cyan

Check "jobs.`$id.tsx uses useJob(id), not the list+find hack" `
    "src\routes\Candidates\jobs.`$id.tsx" `
    "useJob(id)"

Check "JobOverviewCard component exists" `
    "src\components\Candidate\Jobs\details\JobOverviewCard.tsx" `
    "export default function JobOverviewCard"

Write-Host "`nChecking API envelope fixes ..." -ForegroundColor Cyan

Check "getJob unwraps data.data (was returning wrong shape)" `
    "src\lib\candidate\api.ts" `
    "return data.data;"

Write-Host "`nChecking route typo fixes ..." -ForegroundColor Cyan

Check "ApplicationCard uses plural /Candidates/applications/`$id" `
    "src\components\Candidate\applications\ApplicationCard.tsx" `
    '"/Candidates/applications/$id"'

Check "RecentApplications uses plural /Candidates/jobs" `
    "src\components\Candidate\Dashboard\RecentApplications.tsx" `
    '"/Candidates/jobs"'

Write-Host "`nChecking clickable cards ..." -ForegroundColor Cyan

Check "JobCard whole card is clickable (openDetails)" `
    "src\components\Candidate\Jobs\JobCard.tsx" `
    "function openDetails"

Check "ApplicationCard whole card is clickable (openDetails)" `
    "src\components\Candidate\applications\ApplicationCard.tsx" `
    "function openDetails"

Write-Host "`nChecking search/filters are wired up ..." -ForegroundColor Cyan

Check "JobSearch is controlled (accepts value/onChange props)" `
    "src\components\Candidate\Jobs\JobSearch.tsx" `
    "onChange: (value: string) => void"

Check "JobFilters derives options from real job data" `
    "src\components\Candidate\Jobs\JobFilters.tsx" `
    "useJobs()"

Check "jobs.tsx page lifts filter state (useState for search)" `
    "src\routes\Candidates\jobs.tsx" `
    'useState("")'

Write-Host "`n----------------------------------------"
Write-Host "$pass passed, $fail failed" -ForegroundColor $(if ($fail -eq 0) { "Green" } else { "Yellow" })

if ($fail -gt 0) {
    Write-Host "`nThe patch is NOT applied (or only partially). Run:" -ForegroundColor Yellow
    Write-Host '   git log --oneline -3'
    Write-Host '   git status'
    Write-Host '   git apply --check "$env:USERPROFILE\Downloads\job-detail-and-search.patch"'
    Write-Host "and paste me all three outputs."
} else {
    Write-Host "`nPatch is fully applied. If the UI still looks unchanged:" -ForegroundColor Green
    Write-Host " 1. Did you rebuild/restart the FRONTEND dev server (not just backend)?"
    Write-Host "    Stop it (Ctrl+C) and run 'npm run dev' again from the project root."
    Write-Host " 2. Hard-refresh the browser (Ctrl+Shift+R) - Vite can serve stale bundles."
    Write-Host " 3. Make sure you're looking at localhost:8080 (frontend), not just the backend port."
}
