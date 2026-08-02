# Run this from the repo root after applying job-order-visibility-fixes.patch.
# Branch: employer-magic-link (requires commit a71ddee "wip: clarification flow updates"
# already applied - i.e. the requirement-to-job-order-flow patch you applied earlier).

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

Check-Pattern "src\lib\admin\api.ts" "http://localhost:3001/api" "admin API client no longer falls back to the stale hotspot IP"
Check-Pattern "src\routes\Admin\job-orders\`$id.tsx" "loadError" "job order page has real error state instead of infinite spinner"
Check-Pattern "src\routes\Admin\job-orders\`$id.tsx" "Try again" "job order page shows a retry button on failure"
Check-Pattern "backend\src\services\admin\requirements.ts" "is_deleted: false" "converted job orders are explicitly marked not deleted"
Check-Pattern "backend\src\services\jobs.ts" "role," "employer-facing job order query no longer joins the non-existent title column"
Check-Pattern "backend\src\services\jobs.ts" "sector" "employer-facing job order query no longer joins the non-existent category column"
Check-Pattern "backend\src\services\jobs.ts" "is_deleted.is.null,is_deleted.eq.false" "employer-facing job order query no longer excludes NULL is_deleted rows"

if ($script:ErrorCount -gt 0) {
    Write-Host "`n$($script:ErrorCount) static check(s) failed - the patch is not fully applied.`n" -ForegroundColor Red
    exit 1
}

Write-Host "`nAll static checks passed.`n"

Write-Host "--- TypeScript check (frontend) ---`n"
npx tsc --noEmit -p tsconfig.json 2>&1 | Select-String "job-orders/\`$id|lib/admin/api"
Write-Host "`nIf nothing printed above, these files have zero type errors.`n" -ForegroundColor Yellow

Write-Host "--- TypeScript check (backend) ---`n"
Push-Location backend
npx tsc --noEmit 2>&1 | Select-String "requirements.ts|jobs.ts"
Pop-Location
Write-Host "`nIf nothing printed above, these backend files have zero type errors.`n" -ForegroundColor Yellow

Write-Host "Now restart BOTH servers (frontend AND backend - the backend changes need a restart" -ForegroundColor Green
Write-Host "too, not just a browser refresh), then:" -ForegroundColor Green
Write-Host "  1. Go to /Admin/requirements, click Convert on a pending row."
Write-Host "  2. It should land on the Job Order detail page and actually load the data."
Write-Host "  3. If it still fails, it will now show a real error message instead of spinning -"
Write-Host "     copy that message back so we can trace the actual cause.`n"
