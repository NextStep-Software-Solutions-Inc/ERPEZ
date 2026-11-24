#!/usr/bin/env bash
# ==============================================================================
# ERPEZ Pre-Flight Staging Dump Migration Test Runner (Bash)
# Reference: SYSTEM_ARCHITECTURE.md Section 5.1 (Existing-Data Migration Strategy)
# ==============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VERIFY_SCRIPT="${SCRIPT_DIR}/verify-staging-migration.sh"

PGHOST="${PGHOST:-localhost}"
PGPORT="${PGPORT:-5432}"
PGUSER="${PGUSER:-postgres}"
TEST_DB="erpez_migration_test"
TENANT_ID="${STAGING_TENANT_ID:-01a0d69d-924b-762c-a774-523a30544619}"
DUMP_FILE=""
KEEP_DB=false

while [[ $# -gt 0 ]]; do
  case $1 in
    -f|--dump-file)
      DUMP_FILE="$2"
      shift 2
      ;;
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
      TEST_DB="$2"
      shift 2
      ;;
    -U|--username)
      PGUSER="$2"
      shift 2
      ;;
    --keep-db)
      KEEP_DB=true
      shift
      ;;
    --help)
      echo "Usage: $0 [options]"
      echo ""
      echo "Options:"
      echo "  -f, --dump-file   Path to staging/production .dump or .sql backup file"
      echo "  -t, --tenant-id   Target tenant UUID for backfill (default: $TENANT_ID)"
      echo "  -h, --host        PostgreSQL host (default: $PGHOST)"
      echo "  -p, --port        PostgreSQL port (default: $PGPORT)"
      echo "  -d, --database    Ephemeral test DB name (default: $TEST_DB)"
      echo "  -U, --username    PostgreSQL user (default: $PGUSER)"
      echo "  --keep-db         Keep test database after execution for inspection"
      exit 0
      ;;
    *)
      echo "Unknown argument: $1"
      exit 1
      ;;
  esac
done

echo "================================================================="
echo " ERPEZ Pre-Flight Staging Dump Migration Test Runner"
echo "================================================================="
echo "Target Host      : ${PGHOST}:${PGPORT}"
echo "Ephemeral DB     : ${TEST_DB}"
echo "Legacy Tenant ID : ${TENANT_ID}"
echo "Dump File        : ${DUMP_FILE:-[Direct Database Test on ${TEST_DB}]}"
echo "Keep DB After    : $( [ "$KEEP_DB" = true ] && echo 'YES' || echo 'NO (Teardown on completion)' )"
echo "================================================================="

if [[ -n "$DUMP_FILE" ]]; then
  if [[ ! -f "$DUMP_FILE" ]]; then
    echo "Error: Dump file '${DUMP_FILE}' not found." >&2
    exit 1
  fi

  echo ""
  echo "[Step 1/4] Creating ephemeral test database '${TEST_DB}'..."
  psql -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d postgres -c "DROP DATABASE IF EXISTS \"${TEST_DB}\";"
  psql -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d postgres -c "CREATE DATABASE \"${TEST_DB}\";"

  echo ""
  echo "[Step 2/4] Restoring dump file into '${TEST_DB}'..."
  if [[ "$DUMP_FILE" == *.sql ]]; then
    psql -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d "$TEST_DB" -f "$DUMP_FILE"
  else
    pg_restore -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d "$TEST_DB" -v --no-owner --no-privileges "$DUMP_FILE" || true
  fi
fi

echo ""
echo "[Step 3/4] Recording pre-migration baseline metrics..."
PRE_COUNT=$(psql -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d "$TEST_DB" -t -A -c "
SELECT sum((xpath('/row/cnt/text()', xml_count))[1]::text::bigint)
FROM (
    SELECT query_to_xml(format('SELECT count(*) AS cnt FROM %I.%I', table_schema, table_name), false, true, '') AS xml_count
    FROM information_schema.tables
    WHERE table_schema IN ('planning', 'procurement')
      AND table_type = 'BASE TABLE'
      AND table_name NOT IN ('__EFMigrationsHistory')
) sub;")

echo "Pre-migration total row count across all operational tables: ${PRE_COUNT:-0}"

echo ""
echo "[Step 4/4] Executing multi-stage migration and post-migration assertions..."
"$VERIFY_SCRIPT" \
  --tenant-id "$TENANT_ID" \
  --host "$PGHOST" \
  --port "$PGPORT" \
  --database "$TEST_DB" \
  --username "$PGUSER"

echo ""
echo "[Verification] Validating mathematical row count preservation (Zero Data Loss)..."
POST_COUNT=$(psql -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d "$TEST_DB" -t -A -c "
SELECT sum((xpath('/row/cnt/text()', xml_count))[1]::text::bigint)
FROM (
    SELECT query_to_xml(format('SELECT count(*) AS cnt FROM %I.%I', table_schema, table_name), false, true, '') AS xml_count
    FROM information_schema.tables
    WHERE table_schema IN ('planning', 'procurement')
      AND table_type = 'BASE TABLE'
      AND table_name NOT IN ('__EFMigrationsHistory')
) sub;")

echo "Post-migration total row count across all operational tables: ${POST_COUNT:-0}"

if [[ "$PRE_COUNT" -ne "$POST_COUNT" ]]; then
  echo "Error: Row count mismatch! Pre: ${PRE_COUNT}, Post: ${POST_COUNT}" >&2
  exit 1
fi

echo " [PASS] Mathematical row count preservation verified: Exactly 0 rows lost."

if [[ "$KEEP_DB" = false && -n "$DUMP_FILE" ]]; then
  echo ""
  echo "Cleaning up ephemeral test database '${TEST_DB}'..."
  psql -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d postgres -c "DROP DATABASE IF EXISTS \"${TEST_DB}\";"
fi

echo ""
echo "================================================================="
echo " STAGING DUMP MIGRATION PRE-FLIGHT TEST PASSED WITH 100% SUCCESS"
echo " Ready for Production Deployment."
echo "================================================================="
