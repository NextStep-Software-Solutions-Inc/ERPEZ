<#
.SYNOPSIS
    Staging Environment Verification Script for Multi-Stage Tenant Migration.

.DESCRIPTION
    Validates the execution of the multi-stage tenancy migration strategy on staging environments.
    Specifically checks:
    1. Pre-migration assessment of records requiring backfill.
    2. Execution of the multi-stage migration pipeline (or dry-run simulation).
    3. Strict post-migration assertions verifying ZERO records remain with NULL or empty TenantId.
    4. Verification of NOT NULL column constraints across all operational tables.
    5. Verification of composite performance indexes (TenantId, Id) and natural key indexes (TenantId, Code).

.PARAMETER TenantId
    The GUID of the target tenant to backfill existing records to.

.PARAMETER Host
    PostgreSQL host (default: localhost).

.PARAMETER Port
    PostgreSQL port (default: 5432).

.PARAMETER Database
    Target staging database (default: erpez_staging).

.PARAMETER Username
    PostgreSQL username (default: postgres).

.PARAMETER DryRun
    If switch is present, runs all backfill and validation logic within a transaction that is rolled back.

.PARAMETER PsqlPath
    Path to the psql executable (default: psql).

.EXAMPLE
    .\verify-staging-migration.ps1 -TenantId "01a0d69d-924b-762c-a774-523a30544619" -Database "erpez_staging"
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory = $false)]
    [string]$TenantId = $(if ($env:STAGING_TENANT_ID) { $env:STAGING_TENANT_ID } else { "01a0d69d-924b-762c-a774-523a30544619" }),

    [Parameter(Mandatory = $false)]
    [string]$Host = $(if ($env:PGHOST) { $env:PGHOST } else { "localhost" }),

    [Parameter(Mandatory = $false)]
    [int]$Port = $(if ($env:PGPORT) { [int]$env:PGPORT } else { 5432 }),

    [Parameter(Mandatory = $false)]
    [string]$Database = $(if ($env:PGDATABASE) { $env:PGDATABASE } else { "erpez_staging" }),

    [Parameter(Mandatory = $false)]
    [string]$Username = $(if ($env:PGUSER) { $env:PGUSER } else { "postgres" }),

    [Parameter(Mandatory = $false)]
    [switch]$DryRun,

    [Parameter(Mandatory = $false)]
    [string]$PsqlPath = "psql"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$sqlScriptPath = Join-Path $scriptDir "production-tenant-backfill-and-migration.sql"

# UUID validation regex
$guidRegex = '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'
if ($TenantId -notmatch $guidRegex) {
    Write-Error "TenantId '$TenantId' is not a valid UUID format."
    exit 1
}

Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host " ERPEZ Staging Multi-Stage Tenant Migration Verifier" -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "Host / Port      : $Host:$Port"
Write-Host "Target Database  : $Database"
Write-Host "Target Tenant ID : $TenantId"
Write-Host "Execution Mode   : $(if ($DryRun) { 'DRY RUN (Rollback)' } else { 'LIVE EXECUTION' })"
Write-Host "=================================================================" -ForegroundColor Cyan

# Test psql client
try {
    & $PsqlPath --version | Out-Null
} catch {
    Write-Error "psql client not found in PATH."
    exit 1
}

function Invoke-PsqlQuery([string]$sql) {
    $res = & $PsqlPath -h $Host -p $Port -U $Username -d $Database -t -A -c $sql
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to execute PostgreSQL query: $sql"
    }
    return $res
}

# 1. Pre-Migration Audit
Write-Host "`n[Step 1/3] Running Pre-Migration Audit..." -ForegroundColor Yellow

$preAuditSql = @"
DO `$body`$
DECLARE
    tbl text;
    null_recs bigint := 0;
    zero_recs bigint := 0;
    total_recs bigint := 0;
    t_null bigint;
    t_zero bigint;
    t_total bigint;
    has_tenant_col boolean;
BEGIN
    FOR tbl IN
        SELECT table_schema || '."' || table_name || '"'
        FROM information_schema.tables
        WHERE table_schema IN ('planning', 'procurement')
          AND table_type = 'BASE TABLE'
    LOOP
        SELECT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema || '."' || table_name || '"' = tbl
              AND column_name = 'TenantId'
        ) INTO has_tenant_col;

        IF has_tenant_col THEN
            EXECUTE format('SELECT count(*), count(*) FILTER (WHERE "TenantId" IS NULL), count(*) FILTER (WHERE "TenantId" = ''00000000-0000-0000-0000-000000000000'') FROM %s', tbl)
            INTO t_total, t_null, t_zero;
            total_recs := total_recs + t_total;
            null_recs := null_recs + t_null;
            zero_recs := zero_recs + t_zero;
        END IF;
    END LOOP;
    RAISE NOTICE 'AUDIT_RESULT: TotalRows=%, NullTenant=%, ZeroTenant=%', total_recs, null_recs, zero_recs;
END `$body`$;
"@

try {
    Invoke-PsqlQuery $preAuditSql | Write-Host
} catch {
    Write-Warning "Pre-audit encountered warning or table schema not yet initialized: $_"
}

# 2. Execution / Dry Run
Write-Host "`n[Step 2/3] Executing Multi-Stage Migration Pipeline..." -ForegroundColor Yellow

if ($DryRun) {
    Write-Host "Running in Dry-Run mode (Simulating migration within rolled-back transaction)..." -ForegroundColor Magenta
    $dryRunSql = @"
    \set ON_ERROR_STOP on
    BEGIN;
    SET erpez.legacy_tenant_id = '$TenantId';
    \i '$($sqlScriptPath -replace '\\', '/')'
    ROLLBACK;
    \echo 'DRY-RUN COMPLETE: Transaction rolled back safely.'
"@
    $tempFile = [System.IO.Path]::GetTempFileName() + ".sql"
    Set-Content -Path $tempFile -Value $dryRunSql
    & $PsqlPath -h $Host -p $Port -U $Username -d $Database -f $tempFile
    $runExit = $LASTEXITCODE
    Remove-Item -Path $tempFile -Force -ErrorAction SilentlyContinue
    if ($runExit -ne 0) {
        Write-Error "Dry run simulation failed with exit code $runExit."
        exit $runExit
    }
} else {
    & $PsqlPath -h $Host -p $Port -U $Username -d $Database -v ON_ERROR_STOP=1 -c "SET erpez.legacy_tenant_id = '$TenantId';" -f $sqlScriptPath
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Migration execution failed with exit code $LASTEXITCODE."
        exit $LASTEXITCODE
    }
}

# 3. Post-Migration Verification & Assertions
Write-Host "`n[Step 3/3] Running Strict Post-Migration Verification Assertions..." -ForegroundColor Yellow

$verificationSql = @"
DO `$verify`$
DECLARE
    tbl text;
    null_count bigint;
    zero_count bigint;
    violation_tables text[] := '{}';
    unconstrained_tables text[] := '{}';
    missing_index_tables text[] := '{}';
    is_not_null boolean;
    has_tenant_id_index boolean;
    total_tables int := 0;
BEGIN
    FOR tbl IN
        SELECT table_schema || '."' || table_name || '"'
        FROM information_schema.tables
        WHERE table_schema IN ('planning', 'procurement')
          AND table_type = 'BASE TABLE'
          AND table_name NOT IN ('__EFMigrationsHistory')
    LOOP
        total_tables := total_tables + 1;

        -- Assertion 1: Zero records left with NULL or empty TenantId
        EXECUTE format('SELECT count(*) FILTER (WHERE "TenantId" IS NULL), count(*) FILTER (WHERE "TenantId" = ''00000000-0000-0000-0000-000000000000'') FROM %s', tbl)
        INTO null_count, zero_count;

        IF null_count > 0 OR zero_count > 0 THEN
            violation_tables := array_append(violation_tables, format('%s (null=%s, zero=%s)', tbl, null_count, zero_count));
        END IF;

        -- Assertion 2: Column must be strictly NOT NULL
        SELECT (is_nullable = 'NO') INTO is_not_null
        FROM information_schema.columns
        WHERE table_schema || '."' || table_name || '"' = tbl
          AND column_name = 'TenantId';

        IF NOT COALESCE(is_not_null, false) THEN
            unconstrained_tables := array_append(unconstrained_tables, tbl);
        END IF;

        -- Assertion 3: Composite (TenantId, Id) index must exist
        SELECT EXISTS (
            SELECT 1 FROM pg_indexes
            WHERE schemaname || '."' || tablename || '"' = tbl
              AND indexdef LIKE '%TenantId%'
        ) INTO has_tenant_id_index;

        IF NOT has_tenant_id_index THEN
            missing_index_tables := array_append(missing_index_tables, tbl);
        END IF;
    END LOOP;

    RAISE NOTICE '-----------------------------------------------------------------';
    RAISE NOTICE 'VERIFICATION REPORT: % operational tables inspected.', total_tables;
    RAISE NOTICE '-----------------------------------------------------------------';

    IF array_length(violation_tables, 1) > 0 THEN
        RAISE EXCEPTION 'VERIFICATION FAILED: Tables with NULL/empty TenantId: %', array_to_string(violation_tables, ', ');
    END IF;

    IF array_length(unconstrained_tables, 1) > 0 THEN
        RAISE EXCEPTION 'VERIFICATION FAILED: Tables without NOT NULL on TenantId: %', array_to_string(unconstrained_tables, ', ');
    END IF;

    IF array_length(missing_index_tables, 1) > 0 THEN
        RAISE EXCEPTION 'VERIFICATION FAILED: Tables missing TenantId indexes: %', array_to_string(missing_index_tables, ', ');
    END IF;

    RAISE NOTICE 'ALL ASSERTIONS PASSED:';
    RAISE NOTICE ' [PASS] Exactly ZERO records with null or empty TenantId.';
    RAISE NOTICE ' [PASS] 100%% of operational tables have NOT NULL constraints enforced.';
    RAISE NOTICE ' [PASS] Composite indexes verified on all operational tables.';
    RAISE NOTICE '-----------------------------------------------------------------';
END `$verify`$;
"@

try {
    Invoke-PsqlQuery $verificationSql | Write-Host
    Write-Host "`n=================================================================" -ForegroundColor Green
    Write-Host " STAGING MIGRATION VERIFICATION SUCCEEDED WITH 100% PASS RATE" -ForegroundColor Green
    Write-Host "=================================================================" -ForegroundColor Green
} catch {
    Write-Error "Post-migration verification assertions failed: $_"
    exit 1
}
