# Run this from the repo root after applying employer-job-orders-ui-redesign.patch.
# Requires employer-job-orders-list-and-detail.patch to already be applied first.

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

Check-Pattern "src\components\Employer\JobOrders\JobOrdersTable.tsx" "shadow-card" "table uses the brand shadow-card style"
Check-Pattern "src\components\Employer\JobOrders\JobOrdersTable.tsx" "capitalize text-navy" "position text is capitalized and styled"
Check-Pattern "src\components\Employer\JobOrders\JobOrdersTable.tsx" "No job orders yet" "improved empty state present"
Check-Pattern "src\routes\Employer\job-orders.index.tsx" "font-display text-3xl font-bold text-navy" "page header uses brand typography"

if ($script:ErrorCount -gt 0) {
    Write-Host "`n$($script:ErrorCount) static check(s) failed - the patch is not fully applied.`n" -ForegroundColor Red
    exit 1
}

Write-Host "`nAll static checks passed.`n"

Write-Host "--- TypeScript check ---`n"
npx tsc -p tsconfig.json 2>&1 | Select-String "job-orders.index|JobOrdersTable"
Write-Host "`nIf nothing printed above, these files have zero type errors.`n" -ForegroundColor Yellow

Write-Host "Restart your dev server and hard-refresh (Ctrl+Shift+R) on /Employer/job-orders to see the new design.`n" -ForegroundColor Green
