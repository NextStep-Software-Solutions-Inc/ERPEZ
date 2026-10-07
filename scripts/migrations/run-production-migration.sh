#!/usr/bin/env bash
# ==============================================================================
# ERPEZ Production Multi-Stage Tenant Migration Runner (Bash)
# Reference: SYSTEM_ARCHITECTURE.md Section 5.1 (Existing-Data Migration Strategy)
# ==============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SQL_SCRIPT="${SCRIPT_DIR}/production-tenant-backfill-and-migration.sql"

# Parameters with defaults or environment overrides
PGHOST="${PGHOST:-localhost}"
PGPORT="${PGPORT:-5432}"
PGDATABASE="${PGDATABASE:-erpez_operational}"
PGUSER="${PGUSER:-postgres}"
TENANT_ID="${DEFAULT_TENANT_ID:-01a0d69d-924b-762c-a774-523a30544619}"

# Parse command line options
while [[ $# -gt 0 ]]; do
  case $1 in
    -t|--tenant-id)
      TENANT_ID="$2"
      shift 2
      ;;
    -h|--host)
      PGHOST="$2"
      shift 2
      ;;
    -p|--port)
      PGPORT="$2"
      shift 2
      ;;
    -d|--database)
      PGDATABASE="$2"
      shift 2
      ;;
    -U|--username)
      PGUSER="$2"
      shift 2
      ;;
    --help)
      echo "Usage: $0 [options]"
      echo ""
      echo "Options:"
      echo "  -t, --tenant-id   Target legacy tenant UUID (default: $TENANT_ID)"
      echo "  -h, --host        PostgreSQL host (default: $PGHOST)"
      echo "  -p, --port        PostgreSQL port (default: $PGPORT)"
      echo "  -d, --database    Database name (default: $PGDATABASE)"
      echo "  -U, --username    PostgreSQL user (default: $PGUSER)"
      exit 0
      ;;
    *)
      echo "Unknown argument: $1"
      exit 1
      ;;
  esac
done

if [[ ! -f "$SQL_SCRIPT" ]]; then
  echo "Error: Migration SQL script not found at ${SQL_SCRIPT}" >&2
  exit 1
fi

# UUID validation regex
GUID_REGEX='^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'
if [[ ! "$TENANT_ID" =~ $GUID_REGEX ]]; then
  echo "Error: Target TenantId '${TENANT_ID}' is not a valid UUID format." >&2
  exit 1
fi

echo "================================================================="
echo " ERPEZ Production Tenant Backfill & Index Migration Runner"
echo "================================================================="
echo "Target Host      : ${PGHOST}:${PGPORT}"
echo "Target Database  : ${PGDATABASE}"
echo "Postgres User    : ${PGUSER}"
echo "Legacy Tenant ID : ${TENANT_ID}"
echo "SQL Script       : ${SQL_SCRIPT}"
echo "================================================================="

if ! command -v psql &> /dev/null; then
  echo "Error: 'psql' could not be found in PATH. Please install PostgreSQL client tools." >&2
  exit 1
fi

echo "Starting migration transaction..."
psql \
  -h "$PGHOST" \
  -p "$PGPORT" \
  -U "$PGUSER" \
  -d "$PGDATABASE" \
  -v ON_ERROR_STOP=1 \
  -c "SET erpez.legacy_tenant_id = '${TENANT_ID}';" \
  -f "$SQL_SCRIPT"

echo "================================================================="
echo " Migration completed successfully!"
echo " All 136 tenant operational tables backfilled and enforced NOT NULL."
echo " Composite unique indexes (TenantId, ...) successfully generated."
echo "================================================================="
