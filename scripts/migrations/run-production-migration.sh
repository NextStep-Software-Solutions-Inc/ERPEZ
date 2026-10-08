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
PGPASSWORD="${PGPASSWORD:-}"
TENANT_ID="${DEFAULT_TENANT_ID:-01a0d69d-924b-762c-a774-523a30544619}"
CONNECTION_STRING="${DB_CONNECTION_STRING:-${CONNECTION_STRING:-}}"

# Parse command line options
while [[ $# -gt 0 ]]; do
  case $1 in
    -t|--tenant-id)
      TENANT_ID="$2"
      shift 2
      ;;
    -c|--connection-string)
      CONNECTION_STRING="$2"
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
      echo "  -t, --tenant-id           Target legacy tenant UUID (default: $TENANT_ID)"
      echo "  -c, --connection-string   PostgreSQL connection string (ADO.NET or URI format)"
      echo "  -h, --host                PostgreSQL host (default: $PGHOST)"
      echo "  -p, --port                PostgreSQL port (default: $PGPORT)"
      echo "  -d, --database            Database name (default: $PGDATABASE)"
      echo "  -U, --username            PostgreSQL user (default: $PGUSER)"
      exit 0
      ;;
    *)
      echo "Unknown argument: $1"
      exit 1
      ;;
  esac
done

# If connection string provided, parse components
if [[ -n "${CONNECTION_STRING:-}" ]]; then
  if [[ "$CONNECTION_STRING" =~ [Hh][Oo][Ss][Tt]=([^;]+) ]]; then
    PGHOST="${BASH_REMATCH[1]}"
  fi
  if [[ "$CONNECTION_STRING" =~ [Pp][Oo][Rr][Tt]=([^;]+) ]]; then
    PGPORT="${BASH_REMATCH[1]}"
  fi
  if [[ "$CONNECTION_STRING" =~ [Dd][Aa][Tt][Aa][Bb][Aa][Ss][Ee]=([^;]+) ]]; then
    PGDATABASE="${BASH_REMATCH[1]}"
  fi
  if [[ "$CONNECTION_STRING" =~ ([Uu][Ss][Ee][Rr][Nn][Aa][Mm][Ee]|[Uu][Ss][Ee][Rr] [Ii][Dd])=([^;]+) ]]; then
    PGUSER="${BASH_REMATCH[2]}"
  fi
  if [[ "$CONNECTION_STRING" =~ [Pp][Aa][Ss][Ss][Ww][Oo][Rr][Dd]=([^;]+) ]]; then
    PGPASSWORD="${BASH_REMATCH[1]}"
    export PGPASSWORD
  fi
fi

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
echo "Fail-Closed Flag : ON_ERROR_STOP=1 (Atomic Rollback on Error)"
echo "================================================================="

if command -v psql &> /dev/null; then
  echo "Starting migration transaction via local psql..."
  PGPASSWORD="${PGPASSWORD:-}" psql \
    -h "$PGHOST" \
    -p "$PGPORT" \
    -U "$PGUSER" \
    -d "$PGDATABASE" \
    -v ON_ERROR_STOP=1 \
    -c "SET erpez.legacy_tenant_id = '${TENANT_ID}';" \
    -f "$SQL_SCRIPT"
elif command -v docker &> /dev/null; then
  echo "psql not found on host. Executing migration transaction via Docker container (postgres:17-alpine)..."
  docker run --rm \
    --network host \
    -e PGPASSWORD="${PGPASSWORD:-}" \
    -v "${SCRIPT_DIR}:/migrations:ro" \
    postgres:17-alpine \
    psql \
      -h "$PGHOST" \
      -p "$PGPORT" \
      -U "$PGUSER" \
      -d "$PGDATABASE" \
      -v ON_ERROR_STOP=1 \
      -c "SET erpez.legacy_tenant_id = '${TENANT_ID}';" \
      -f "/migrations/production-tenant-backfill-and-migration.sql"
else
  echo "Error: Neither 'psql' nor 'docker' could be found in PATH. Please install PostgreSQL client tools or Docker." >&2
  exit 1
fi

echo "================================================================="
echo " Migration completed successfully!"
echo " All 136 tenant operational tables backfilled and enforced NOT NULL."
echo " Composite unique indexes (TenantId, ...) successfully generated."
echo "================================================================="
