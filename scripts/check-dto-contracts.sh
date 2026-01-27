#!/bin/bash
# DTO Contract Validation Script
# Purpose: Verify queries/commands return types match controller expectations
# Usage: ./scripts/check-dto-contracts.sh

echo "=========================================="
echo "  API Contract Validation Check"
echo "  Verifying Query/Command ↔ Controller Match"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

# Counters
total_violations=0
total_queries=0
total_commands=0
total_mismatches=0

# Application and API directories
APP_DIRS=("./TenantManagement/ERPEZ.TenantManagement.Application" "./ERPEZ/ERPEZ.Application")
API_DIRS=("./TenantManagement/ERPEZ.TenantManagement.Api/Controllers" "./ERPEZ/ERPEZ.Api/Controllers")

echo "Phase 1: Detecting Domain.Entities in return types..."
echo "------------------------------------------------------------"

for APP_DIR in "${APP_DIRS[@]}"; do
    if [ ! -d "$APP_DIR" ]; then
        echo -e "${YELLOW}Warning: Application directory not found at $APP_DIR - skipping${NC}"
        continue
    fi

    echo ""
    echo -e "${BLUE}Scanning: $APP_DIR${NC}"

    # Check Query files
    while IFS= read -r query_file; do
        total_queries=$((total_queries + 1))
        
        if [[ "$query_file" == *"Validator.cs" ]]; then
            continue
        fi
        
        if grep -q "IRequest<.*Domain\.Entities\." "$query_file" || \
           grep -q "PaginatedQuery<.*Domain\.Entities\." "$query_file"; then
            echo -e "${RED}✗ ENTITY LEAK${NC} - $query_file"
            grep -n "IRequest<.*Domain\.Entities\.\|PaginatedQuery<.*Domain\.Entities\." "$query_file" | while read -r line; do
                echo -e "  ${YELLOW}$line${NC}"
            done
            total_violations=$((total_violations + 1))
        fi
    done < <(find "$APP_DIR/Features" -path "*/Queries/*" -name "*Query.cs" 2>/dev/null)

    # Check Command files
    while IFS= read -r command_file; do
        total_commands=$((total_commands + 1))
        
        if [[ "$command_file" == *"Validator.cs" ]]; then
            continue
        fi
        
        if grep -q "IRequest<.*Domain\.Entities\." "$command_file"; then
            echo -e "${RED}✗ ENTITY LEAK${NC} - $command_file"
            grep -n "IRequest<.*Domain\.Entities\." "$command_file" | while read -r line; do
                echo -e "  ${YELLOW}$line${NC}"
            done
            total_violations=$((total_violations + 1))
        fi
    done < <(find "$APP_DIR/Features" -path "*/Commands/*" -name "*Command.cs" 2>/dev/null)
done

echo ""
echo "Phase 2: Verifying Controller ↔ Query/Command Match..."
echo "------------------------------------------------------------"

for i in "${!API_DIRS[@]}"; do
    API_DIR="${API_DIRS[$i]}"
    APP_DIR="${APP_DIRS[$i]}"
    
    if [ ! -d "$API_DIR" ] || [ ! -d "$APP_DIR" ]; then
        continue
    fi

    echo ""
    echo -e "${BLUE}Checking: $API_DIR${NC}"

    while IFS= read -r controller_file; do
        controller_content=$(cat "$controller_file")
        
        # Find all action methods with mediator.Send calls
        # We'll process the file line by line to find methods
        current_method_lines=""
        in_method=false
        brace_count=0
        
        while IFS= read -r line; do
            # Detect start of a method (contains public/private and async/Task)
            if [[ "$line" =~ (public|private).*Task.*\( ]]; then
                in_method=true
                current_method_lines="$line"$'\n'
                brace_count=0
            elif [ "$in_method" = true ]; then
                current_method_lines+="$line"$'\n'
                
                # Count braces to detect method end
                brace_count=$((brace_count + $(echo "$line" | grep -o "{" | wc -l)))
                brace_count=$((brace_count - $(echo "$line" | grep -o "}" | wc -l)))
                
                # If braces balanced and we have content, process the method
                if [ $brace_count -eq 0 ] && [[ "$current_method_lines" =~ mediator\.Send ]]; then
                    # Extract query/command name
                    if [[ "$current_method_lines" =~ mediator\.Send\(new[[:space:]]+([A-Za-z0-9]+)(Query|Command) ]]; then
                        query_or_command="${BASH_REMATCH[1]}${BASH_REMATCH[2]}"
                        
                        # Extract all ProducesResponseType attributes from this method
                        # Focus on Status200OK responses (the success case)
                        expected_type=""
                        while IFS= read -r attr_line; do
                            if [[ "$attr_line" =~ ProducesResponseType\(typeof\(([^\)]+)\).*Status200OK ]]; then
                                expected_type="${BASH_REMATCH[1]}"
                                break
                            elif [[ "$attr_line" =~ ProducesResponseType\(typeof\(([^\)]+)\).*StatusCodes\.Status200OK ]]; then
                                expected_type="${BASH_REMATCH[1]}"
                                break
                            elif [[ "$attr_line" =~ ProducesResponseType\(typeof\(([^\)]+)\),[[:space:]]*200 ]]; then
                                expected_type="${BASH_REMATCH[1]}"
                                break
                            fi
                        done <<< "$current_method_lines"
                        
                        # If no explicit 200 OK found, try to find first ProducesResponseType
                        if [ -z "$expected_type" ]; then
                            if [[ "$current_method_lines" =~ ProducesResponseType\(typeof\(([^\)]+)\) ]]; then
                                expected_type="${BASH_REMATCH[1]}"
                            fi
                        fi
                        
                        if [ -n "$expected_type" ]; then
                            # Find the actual query/command file
                            actual_file=$(find "$APP_DIR/Features" -name "${query_or_command}.cs" 2>/dev/null | head -1)
                            
                            if [ -f "$actual_file" ]; then
                                actual_content=$(cat "$actual_file")
                                
                                # Extract actual return type from query/command
                                actual_return_type=""
                                if [[ "$actual_content" =~ (IRequest|PaginatedQuery)\<([^>]+)\> ]]; then
                                    actual_return_type="${BASH_REMATCH[2]}"
                                fi
                                
                                # Check if actual return type contains Domain.Entities but controller expects DTO
                                if [[ "$actual_return_type" =~ Domain\.Entities ]]; then
                                    if [[ ! "$expected_type" =~ Domain\.Entities ]]; then
                                        echo -e "${MAGENTA}✗ MISMATCH${NC} - $query_or_command"
                                        echo -e "  Controller expects: ${GREEN}$expected_type${NC}"
                                        echo -e "  Query/Command returns: ${RED}$actual_return_type${NC}"
                                        echo -e "  File: $actual_file"
                                        total_mismatches=$((total_mismatches + 1))
                                    fi
                                fi
                            fi
                        fi
                    fi
                    
                    # Reset for next method
                    current_method_lines=""
                    in_method=false
                elif [ $brace_count -eq 0 ]; then
                    # Method ended but no mediator.Send found
                    current_method_lines=""
                    in_method=false
                fi
            fi
        done < "$controller_file"
    done < <(find "$API_DIR" -name "*Controller.cs" 2>/dev/null)
done

echo ""
echo "=========================================="
echo "  Validation Summary"
echo "=========================================="
echo -e "Total Queries Scanned:       ${BLUE}$total_queries${NC}"
echo -e "Total Commands Scanned:      ${BLUE}$total_commands${NC}"
echo -e "Domain Entity Leaks Found:   ${RED}$total_violations${NC}"
echo -e "Controller Mismatches Found: ${MAGENTA}$total_mismatches${NC}"
echo -e "Total Issues:                ${RED}$((total_violations + total_mismatches))${NC}"
echo ""

if [ $((total_violations + total_mismatches)) -eq 0 ]; then
    echo -e "${GREEN}✓ SUCCESS${NC} - All queries/commands return proper DTOs matching controller expectations!"
    echo ""
    exit 0
else
    echo -e "${RED}✗ FAILED${NC} - Found $((total_violations + total_mismatches)) contract violations"
    echo ""
    echo "VIOLATION TYPES:"
    echo "-------------------------------------------"
    echo "1. Domain Entity Leaks ($total_violations):"
    echo "   Queries/Commands returning Domain.Entities.* types"
    echo ""
    echo "2. Controller Mismatches ($total_mismatches):"
    echo "   Controller expects DTO but Query/Command returns entity"
    echo ""
    echo "EXAMPLES:"
    echo "-------------------------------------------"
    echo "❌ BAD:  IRequest<ApiResponse<Domain.Entities.Planning.Location>>"
    echo "✅ GOOD: IRequest<ApiResponse<LocationResponse>>"
    echo ""
    echo "❌ BAD:  PaginatedQuery<PaginatedApiResponse<Domain.Entities.Planning.Object>>"
    echo "✅ GOOD: PaginatedQuery<PaginatedApiResponse<ObjectResponse>>"
    echo ""
    echo "Please fix all violations before committing."
    echo ""
    exit 1
fi
