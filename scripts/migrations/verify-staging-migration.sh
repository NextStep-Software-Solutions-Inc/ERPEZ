#!/usr/bin/env bash
# ==============================================================================
# ERPEZ Staging Environment Multi-Stage Tenant Migration Verifier (Bash)
# Reference: SYSTEM_ARCHITECTURE.md Section 5.1 (Existing-Data Migration Strategy)
# ==============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SQL_SCRIPT="${SCRIPT_DIR}/production-tenant-backfill-and-migration.sql"

PGHOST="${PGHOST:-localhost}"
PGPORT="${PGPORT:-5432}"
PGDATABASE="${PGDATABASE:-erpez_staging}"
PGUSER="${PGUSER:-postgres}"
TENANT_ID="${STAGING_TENANT_ID:-01a0d69d-924b-762c-a774-523a30544619}"
DRY_RUN=false

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
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    --help)
      echo "Usage: $0 [options]"
      echo ""
      echo "Options:"
      echo "  -t, --tenant-id   Target staging tenant UUID (default: $TENANT_ID)"
      echo "  -h, --host        PostgreSQL host (default: $PGHOST)"
      echo "  -p, --port        PostgreSQL port (default: $PGPORT)"
      echo "  -d, --database    Staging database name (default: $PGDATABASE)"
      echo "  -U, --username    PostgreSQL user (default: $PGUSER)"
      echo "  --dry-run         Run migration simulation and rollback"
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

GUID_REGEX='^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'
if [[ ! "$TENANT_ID" =~ $GUID_REGEX ]]; then
  echo "Error: Target TenantId '${TENANT_ID}' is not a valid UUID format." >&2
  exit 1
fi

echo "================================================================="
echo " ERPEZ Staging Multi-Stage Tenant Migration Verifier"
echo "================================================================="
echo "Host / Port      : ${PGHOST}:${PGPORT}"
echo "Target Database  : ${PGDATABASE}"
echo "Target Tenant ID : ${TENANT_ID}"
echo "Execution Mode   : $( [ "$DRY_RUN" = true ] && echo 'DRY RUN (Rollback)' || echo 'LIVE EXECUTION' )"
echo "================================================================="

if ! command -v psql &> /dev/null; then
  echo "Error: 'psql' could not be found in PATH. Please install PostgreSQL client tools." >&2
  exit 1
fi

# 1. Pre-Migration Audit
echo ""
echo "[Step 1/3] Running Pre-Migration Audit..."
psql -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d "$PGDATABASE" -v ON_ERROR_STOP=0 << 'EOF' || true
DO $$
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
    RAISE NOTICE 'PRE-AUDIT: TotalRows=%, NullTenant=%, ZeroTenant=%', total_recs, null_recs, zero_recs;
END $$;
EOF

# 2. Execution / Dry Run
echo ""
echo "[Step 2/3] Executing Multi-Stage Migration Pipeline..."
if [ "$DRY_RUN" = true ]; then
  echo "Running simulation in transaction and rolling back..."
  psql -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d "$PGDATABASE" -v ON_ERROR_STOP=1 << EOF
BEGIN;
SET erpez.legacy_tenant_id = '${TENANT_ID}';
\i '${SQL_SCRIPT}'
ROLLBACK;
\echo 'DRY-RUN SIMULATION COMPLETE: Transaction safely rolled back.'
EOF
else
  psql -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d "$PGDATABASE" -v ON_ERROR_STOP=1 \
    -c "SET erpez.legacy_tenant_id = '${TENANT_ID}';" \
    -f "$SQL_SCRIPT"
fi

# 3. Post-Migration Verification & Assertions
echo ""
echo "[Step 3/3] Running Strict Post-Migration Verification Assertions..."
psql -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d "$PGDATABASE" -v ON_ERROR_STOP=1 << 'EOF'
DO $$
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

        -- Assertion 3: Composite index containing TenantId must exist
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
END $$;
EOF

echo ""
echo "================================================================="
echo " STAGING MIGRATION VERIFICATION SUCCEEDED WITH 100% PASS RATE"
echo "================================================================="
