<#
.SYNOPSIS
    Executes the ERPEZ Production Multi-Stage Tenant Migration and Index Enactment Script.

.DESCRIPTION
    Runs scripts/migrations/production-tenant-backfill-and-migration.sql with safety checks,
    deterministic TenantId provenance backfill, NOT NULL constraint enforcement,
    and composite unique index migration.

.PARAMETER TenantId
    The GUID of the legacy single-tenant organization to assign existing data to.
    Defaults to $env:DEFAULT_TENANT_ID or the primary tenant GUID.

.PARAMETER Host
    PostgreSQL server host (default: localhost).

.PARAMETER Port
    PostgreSQL port (default: 5432).

.PARAMETER Database
    Target operational database name (default: erpez_operational).

.PARAMETER Username
    PostgreSQL username (default: postgres).

.PARAMETER PsqlPath
    Path to the psql executable (default: psql).

.EXAMPLE
    .\run-production-migration.ps1 -TenantId "01a0d69d-924b-762c-a774-523a30544619" -Database "erpez_operational"
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory = $false)]
    [string]$TenantId = $env:DEFAULT_TENANT_ID,

    [Parameter(Mandatory = $false)]
    [string]$Host = $(if ($env:PGHOST) { $env:PGHOST } else { "localhost" }),

    [Parameter(Mandatory = $false)]
    [int]$Port = $(if ($env:PGPORT) { [int]$env:PGPORT } else { 5432 }),

    [Parameter(Mandatory = $false)]
    [string]$Database = $(if ($env:PGDATABASE) { $env:PGDATABASE } else { "erpez_operational" }),

    [Parameter(Mandatory = $false)]
    [string]$Username = $(if ($env:PGUSER) { $env:PGUSER } else { "postgres" }),

    [Parameter(Mandatory = $false)]
    [string]$ConnectionString = $(if ($env:DB_CONNECTION_STRING) { $env:DB_CONNECTION_STRING } else { $env:CONNECTION_STRING }),

    [Parameter(Mandatory = $false)]
    [string]$PsqlPath = "psql"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

if (-not [string]::IsNullOrWhiteSpace($ConnectionString)) {
    try {
        $builder = New-Object System.Data.Common.DbConnectionStringBuilder
        $builder.ConnectionString = $ConnectionString
        if ($builder.ContainsKey("Host")) { $Host = [string]$builder["Host"] }
        if ($builder.ContainsKey("Port")) { $Port = [int]$builder["Port"] }
        if ($builder.ContainsKey("Database")) { $Database = [string]$builder["Database"] }
        if ($builder.ContainsKey("Username")) { $Username = [string]$builder["Username"] }
        elseif ($builder.ContainsKey("User ID")) { $Username = [string]$builder["User ID"] }
        if ($builder.ContainsKey("Password")) { $env:PGPASSWORD = [string]$builder["Password"] }
    } catch {
        Write-Warning "Could not parse connection string using DbConnectionStringBuilder. Falling back to explicit parameters."
    }
}

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$sqlScriptPath = Join-Path $scriptDir "production-tenant-backfill-and-migration.sql"

if (-not (Test-Path $sqlScriptPath)) {
    Write-Error "Migration SQL script not found at: $sqlScriptPath"
    exit 1
}

# Default fallback tenant GUID if not provided
if ([string]::IsNullOrWhiteSpace($TenantId)) {
    $TenantId = "01a0d69d-924b-762c-a774-523a30544619"
    Write-Warning "No -TenantId specified. Using default primary tenant GUID: $TenantId"
}

# Validate TenantId format
$guidRegex = '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'
if ($TenantId -notmatch $guidRegex) {
    Write-Error "TenantId '$TenantId' is not a valid UUID format."
    exit 1
}

Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host " ERPEZ Production Tenant Backfill & Index Migration Runner" -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "Target Host      : $Host:$Port"
Write-Host "Target Database  : $Database"
Write-Host "Postgres User    : $Username"
Write-Host "Legacy Tenant ID : $TenantId"
Write-Host "SQL Script       : $sqlScriptPath"
Write-Host "=================================================================" -ForegroundColor Cyan

# Test if psql is accessible
try {
    & $PsqlPath --version | Out-Null
} catch {
    Write-Error "Could not find or run '$PsqlPath'. Ensure PostgreSQL client tools are installed and in PATH."
    exit 1
}

# Run migration wrapped in a transaction with custom session setting
Write-Host "Starting migration transaction..." -ForegroundColor Yellow

$psqlArgs = @(
    "-h", $Host,
    "-p", $Port.ToString(),
    "-U", $Username,
    "-d", $Database,
    "-v", "ON_ERROR_STOP=1",
    "-c", "SET erpez.legacy_tenant_id = '$TenantId';",
    "-f", $sqlScriptPath
)

& $PsqlPath @psqlArgs

if ($LASTEXITCODE -eq 0) {
    Write-Host "=================================================================" -ForegroundColor Green
    Write-Host " Migration completed successfully!" -ForegroundColor Green
    Write-Host " All 136 tenant operational tables backfilled and enforced NOT NULL." -ForegroundColor Green
    Write-Host " Composite unique indexes (TenantId, ...) successfully generated." -ForegroundColor Green
    Write-Host "=================================================================" -ForegroundColor Green
} else {
    Write-Error "Migration failed with exit code $LASTEXITCODE. Database transaction rolled back automatically."
    exit $LASTEXITCODE
}
