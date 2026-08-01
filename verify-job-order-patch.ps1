# Run this from the repo root (C:\ozone-global-bridge-main or wherever it lives)
# after applying job-order-workflow-transitions.patch.
#
# It does two things:
#   1. Static check - confirms the 5 new transition functions/routes actually
#      landed in the files (catches a partially-applied or reverted patch).
#   2. Real check - installs deps and runs the vitest suite that exercises
#      every transition's guard logic against a mocked Supabase client.

$ErrorActionCount = 0

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

Check-Pattern "backend\src\services\admin\jobOrders.ts" "export async function startAdminReview" "startAdminReview() exists in jobOrders.ts"
Check-Pattern "backend\src\services\admin\jobOrders.ts" "export async function requestJobOrderClarification" "requestJobOrderClarification() exists"
Check-Pattern "backend\src\services\admin\jobOrders.ts" "export async function sendForEmployerApproval" "sendForEmployerApproval() exists"
Check-Pattern "backend\src\services\admin\jobOrders.ts" "export async function startLegalization" "startLegalization() exists"
Check-Pattern "backend\src\services\admin\jobOrders.ts" "export async function approveForRecruitment" "approveForRecruitment() exists"
Check-Pattern "backend\src\services\admin\jobOrders.ts" "async function transitionJobOrderStatus" "shared transitionJobOrderStatus() guard exists"
Check-Pattern "backend\src\services\admin\jobOrders.ts" "openRecruitment(jobOrderId: string, adminId: string)" "openRecruitment() now requires adminId (guarded)"

Check-Pattern "backend\src\routes\admin.ts" "/job-orders/:id/review" "route: PATCH /job-orders/:id/review"
Check-Pattern "backend\src\routes\admin.ts" "/job-orders/:id/clarification" "route: PATCH /job-orders/:id/clarification"
Check-Pattern "backend\src\routes\admin.ts" "/job-orders/:id/send-for-approval" "route: PATCH /job-orders/:id/send-for-approval"
Check-Pattern "backend\src\routes\admin.ts" "/job-orders/:id/start-legalization" "route: PATCH /job-orders/:id/start-legalization"
Check-Pattern "backend\src\routes\admin.ts" "/job-orders/:id/approve-for-recruitment" "route: PATCH /job-orders/:id/approve-for-recruitment"

Check-Pattern "backend\src\controllers\admin.ts" "export async function startAdminReview" "controller: startAdminReview"
Check-Pattern "backend\src\controllers\admin.ts" "export async function approveForRecruitment" "controller: approveForRecruitment"

Check-Pattern "backend\src\services\admin\__tests__\jobOrders.test.ts" "describe(`"full happy-path chain`"" "test file present with full happy-path chain test"

if ($script:ErrorCount -gt 0) {
    Write-Host "`n$($script:ErrorCount) static check(s) failed - the patch is not fully applied. Stopping before running tests.`n" -ForegroundColor Red
    exit 1
}

Write-Host "`nAll static checks passed.`n"

Write-Host "=== Step 2: Install deps + run the real test suite ===`n"

Push-Location backend

npm install --no-audit --no-fund
if ($LASTEXITCODE -ne 0) { Write-Host "npm install failed" -ForegroundColor Red; Pop-Location; exit 1 }

npm install -D vitest --no-audit --no-fund
if ($LASTEXITCODE -ne 0) { Write-Host "vitest install failed" -ForegroundColor Red; Pop-Location; exit 1 }

Write-Host "`n--- TypeScript check ---`n"
npx tsc --noEmit
if ($LASTEXITCODE -ne 0) { Write-Host "TypeScript check failed" -ForegroundColor Red; Pop-Location; exit 1 }
Write-Host "TypeScript check passed." -ForegroundColor Green

Write-Host "`n--- Unit tests (mocked Supabase, exercises every status transition) ---`n"
npm test
$testResult = $LASTEXITCODE

Pop-Location

if ($testResult -eq 0) {
    Write-Host "`nPatch verified: files are correct, types compile, and all transition tests pass.`n" -ForegroundColor Green
} else {
    Write-Host "`nTests failed - see output above.`n" -ForegroundColor Red
    exit 1
}
