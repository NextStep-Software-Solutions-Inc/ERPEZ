#!/bin/bash
# Validation Coverage Check Script
# Purpose: Automatically detect Commands/Queries without corresponding Validator classes
# Usage: ./check-validators.sh

echo "======================================"
echo "  Validation Coverage Check"
echo "======================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counters
total_commands=0
missing_validators=0
total_queries=0
missing_query_validators=0

# Application directories to scan (relative to repo root)
APP_DIRS=("./TenantManagement/ERPEZ.TenantManagement.Application" "./ERPEZ/ERPEZ.Application")

echo "Scanning application layers for Commands without Validators..."
echo "---------------------------------------------------------------"

# We'll aggregate totals across all application projects
total_commands=0
missing_validators=0
total_queries=0

for APP_DIR in "${APP_DIRS[@]}"; do
    if [ ! -d "$APP_DIR" ]; then
        echo -e "${YELLOW}Warning: Application directory not found at $APP_DIR - skipping${NC}"
        continue
    fi

    echo "Scanning $APP_DIR"
    echo "-------------------------------------------"

    # Find all Command.cs files (excluding Validator files) for this app
    while IFS= read -r command_file; do
        total_commands=$((total_commands + 1))
        
        dir=$(dirname "$command_file")
        filename=$(basename "$command_file")
        
        # Skip if this is a validator file
        if [[ "$filename" == *"Validator.cs" ]]; then
            continue
        fi
        
        # Generate expected validator filename
        validator_file="${filename/.cs/Validator.cs}"
        validator_path="$dir/$validator_file"
        
        # Check if validator exists
        if [ ! -f "$validator_path" ]; then
            echo -e "${RED}✗ MISSING${NC} - $command_file"
            echo -e "  ${YELLOW}Expected: $validator_path${NC}"
            missing_validators=$((missing_validators + 1))
        else
            echo -e "${GREEN}✓ FOUND${NC}    - $command_file"
        fi
    done < <(find "$APP_DIR/Features" -path "*/Commands/*" -name "*Command.cs" 2>/dev/null)

    echo ""
    # Find all Query.cs files for this app
    while IFS= read -r query_file; do
        total_queries=$((total_queries + 1))
        
        dir=$(dirname "$query_file")
        filename=$(basename "$query_file")
        
        # Skip if this is a validator file
        if [[ "$filename" == *"Validator.cs" ]]; then
            continue
        fi
        
        # Generate expected validator filename
        validator_file="${filename/.cs/Validator.cs}"
        validator_path="$dir/$validator_file"
        
        # Check if validator exists
        if [ ! -f "$validator_path" ]; then
            # For queries, we just report but don't count as critical
            echo -e "${YELLOW}⚠ NO VALIDATOR${NC} - $query_file"
        else
            echo -e "${GREEN}✓ FOUND${NC}        - $query_file"
        fi
    done < <(find "$APP_DIR/Features" -path "*/Queries/*" -name "*Query.cs" 2>/dev/null)

    echo ""
done

# Summary
echo ""
echo "======================================"
echo "  Summary"
echo "======================================"
echo ""
echo "Commands:"
echo "  Total: $total_commands"
echo "  With Validators: $((total_commands - missing_validators))"
echo "  Missing Validators: $missing_validators"

if [ $total_commands -gt 0 ]; then
    coverage=$(( (total_commands - missing_validators) * 100 / total_commands ))
    echo -e "  Coverage: ${GREEN}$coverage%${NC}"
fi

echo ""
echo "Queries:"
echo "  Total: $total_queries"
echo ""

# Exit with error if missing validators
if [ $missing_validators -gt 0 ]; then
    echo -e "${RED}❌ Action Required: $missing_validators command(s) need validators!${NC}"
    echo ""
    echo "Next Steps:"
    echo "  1. Review each missing validator"
    echo "  2. Create validator classes following the pattern in VALIDATION_GUIDE.md"
    echo "  3. Run this script again to verify"
    echo ""
    exit 1
else
    echo -e "${GREEN}✅ All commands have validators!${NC}"
    echo ""
    exit 0
fi
