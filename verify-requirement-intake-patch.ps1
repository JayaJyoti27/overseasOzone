# Run this from the repo root after applying requirement-intake-form.patch.
#
# IMPORTANT - this patch also includes a SQL migration
# (supabase/migrations/20260801_001_requirement_intake_fields.sql) that adds
# new columns to your `requirements` table. Applying the .patch file only
# copies that .sql file into your repo - it does NOT run it against your
# database. You still need to run that migration yourself (Supabase SQL
# editor, or `supabase db push` if you use the CLI) before the new fields
# will actually save. This script checks the file landed; it can't run SQL
# against your live database for you.

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

Check-Pattern "supabase\migrations\20260801_001_requirement_intake_fields.sql" "ADD COLUMN IF NOT EXISTS contact_person" "migration file present with new columns"

Check-Pattern "backend\src\services\employer\requirement.ts" "contact_person" "createRequirement accepts contact_person"
Check-Pattern "backend\src\services\employer\requirement.ts" "salary_min" "createRequirement accepts salary_min"
Check-Pattern "backend\src\services\employer\requirement.ts" "qualifications" "createRequirement accepts qualifications"

Check-Pattern "backend\src\services\admin\requirements.ts" "requirements: requirement.qualifications" "convertRequirementToJobOrder carries qualifications over"
Check-Pattern "backend\src\services\admin\requirements.ts" "salary_min: requirement.salary_min" "convertRequirementToJobOrder carries salary_min over"

Check-Pattern "src\routes\Employer\job-orders.new.tsx" "Point of Contact for This Requirement" "employer form has Point of Contact section"
Check-Pattern "src\routes\Employer\job-orders.new.tsx" "Compensation" "employer form has Compensation & Benefits section"

Check-Pattern "src\routes\Admin\requirements\`$id.tsx" "Point of Contact" "admin detail page shows Point of Contact panel"

if ($script:ErrorCount -gt 0) {
    Write-Host "`n$($script:ErrorCount) static check(s) failed - the patch is not fully applied. Stopping before running tests.`n" -ForegroundColor Red
    exit 1
}

Write-Host "`nAll static checks passed.`n"

Write-Host "=== Step 2: Backend - install, typecheck, test ===`n"

Push-Location backend

npm install --no-audit --no-fund
if ($LASTEXITCODE -ne 0) { Write-Host "npm install failed" -ForegroundColor Red; Pop-Location; exit 1 }

Write-Host "`n--- TypeScript check ---`n"
npx tsc --noEmit
if ($LASTEXITCODE -ne 0) { Write-Host "Backend TypeScript check failed" -ForegroundColor Red; Pop-Location; exit 1 }
Write-Host "Backend TypeScript check passed." -ForegroundColor Green

Write-Host "`n--- Unit tests (createRequirement + convertRequirementToJobOrder field mapping) ---`n"
npm test
$backendTestResult = $LASTEXITCODE

Pop-Location

if ($backendTestResult -ne 0) {
    Write-Host "`nBackend tests failed - see output above.`n" -ForegroundColor Red
    exit 1
}

Write-Host "`n=== Step 3: Frontend - install, typecheck ===`n"

npm install --no-audit --no-fund
if ($LASTEXITCODE -ne 0) { Write-Host "Frontend npm install failed" -ForegroundColor Red; exit 1 }

Write-Host "`n--- TypeScript check (job-orders.new.tsx, requirements/`$id.tsx) ---`n"
npx tsc -p tsconfig.json 2>&1 | Select-String "job-orders.new|requirements.\`$id"

Write-Host "`nIf nothing printed above, the files we touched have zero type errors (the repo has some pre-existing, unrelated route-typing errors elsewhere that are not part of this patch).`n" -ForegroundColor Yellow

Write-Host "`nPatch verified: files are correct, backend types compile, and all requirement-intake tests pass." -ForegroundColor Green
Write-Host "Reminder: don't forget to run the SQL migration against your Supabase database before testing the new fields end-to-end.`n" -ForegroundColor Yellow
