# Run this from the repo root after applying requirement-to-job-order-flow.patch.
# Branch: employer-magic-link

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

Write-Host "`n=== Static file checks ===`n"

# Backend: conversion no longer gated on a phantom "approved" status
Check-Pattern "backend\src\services\admin\requirements.ts" "A rejected requirement cannot be converted" "backend allows convert without a prior approve step"

# Frontend api.ts: missing job-order workflow client functions now present
Check-Pattern "src\lib\admin\api.ts" "export async function startAdminReview" "startAdminReview client function added"
Check-Pattern "src\lib\admin\api.ts" "export async function requestJobOrderClarification" "requestJobOrderClarification client function added"
Check-Pattern "src\lib\admin\api.ts" "export async function sendForEmployerApproval" "sendForEmployerApproval client function added"
Check-Pattern "src\lib\admin\api.ts" "export async function startLegalization" "startLegalization client function added"
Check-Pattern "src\lib\admin\api.ts" "export async function approveForRecruitment" "approveForRecruitment client function added"

# Requirement detail page: Approve button gone, Convert routes into the job order
Check-Pattern "src\routes\Admin\requirements\`$id.tsx" "View Job Order" "detail page shows View Job Order once converted"
Check-Pattern "src\routes\Admin\requirements\`$id.tsx" "This requirement is now a Job Order" "detail page has a converted state"

# Requirements list page: same cleanup
Check-Pattern "src\routes\Admin\requirements\index.tsx" "View job order" "list page shows View job order once converted"

if ($script:ErrorCount -gt 0) {
    Write-Host "`n$($script:ErrorCount) static check(s) failed - the patch is not fully applied.`n" -ForegroundColor Red
    exit 1
}

Write-Host "`nAll static checks passed.`n"

Write-Host "--- TypeScript check (frontend) ---`n"
npx tsc --noEmit -p tsconfig.json 2>&1 | Select-String "requirements/index|requirements/\`$id|job-orders/\`$id|lib/admin/api"
Write-Host "`nIf nothing printed above, these files have zero type errors.`n" -ForegroundColor Yellow

Write-Host "--- TypeScript check (backend) ---`n"
Push-Location backend
npx tsc --noEmit 2>&1 | Select-String "requirements.ts"
Pop-Location
Write-Host "`nIf nothing printed above, the backend service has zero type errors.`n" -ForegroundColor Yellow

Write-Host "Restart both your frontend dev server and backend server, then:" -ForegroundColor Green
Write-Host "  1. Go to /Admin/requirements - Approve icon is gone, only Clarify/Convert/Reject remain."
Write-Host "  2. Click Convert on a pending requirement - it should jump straight to the new Job Order detail page."
Write-Host "  3. Use the workflow buttons there (Start Admin Review -> ... -> Approve for Recruitment) to publish it to candidates.`n"
