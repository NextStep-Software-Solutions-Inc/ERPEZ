# UACS Library Database Schema & Relationships

## Overview

This document explains how the UACS Library tables relate to each other and how data flows through the system.

---

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         UACS LIBRARY ARCHITECTURE                            │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│                      CONFIGURATION LAYER (Meta-data)                         │
└──────────────────────────────────────────────────────────────────────────────┘

    ┌─────────────────────────┐
    │   UACSCodeSegment       │ ← Configuration for each segment type
    │─────────────────────────│
    │ PK: Id                  │
    │ SegmentType (enum 1-5)  │ ← FundSource=1, Org=2, Loc=3, MFO=4, Obj=5
    │ Name                    │
    │ Description             │
    │ DisplayOrder            │
    │ IsRequired              │
    │ MaxLength               │
    │ Pattern (regex)         │
    │ IsActive                │
    └─────────────────────────┘
              │
              │ 1:N (One segment config has many validation rules)
              ↓
    ┌─────────────────────────┐
    │  UACSValidationRule     │ ← Custom validation rules
    │─────────────────────────│
    │ PK: Id                  │
    │ FK: CodeSegmentId       │ ← Optional link to segment
    │ RuleName                │
    │ Description             │
    │ SegmentType (optional)  │
    │ ValidationExpression    │
    │ ErrorMessage            │
    │ Priority                │
    │ IsActive                │
    └─────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│                    DATA LAYER (Actual Code Values)                           │
└──────────────────────────────────────────────────────────────────────────────┘

The 5 Core UACS Segment Entities (Independent hierarchical trees):

┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  FundSource  │    │Organization  │    │  Location    │    │   MFOPAP     │    │   Object     │
│──────────────│    │──────────────│    │──────────────│    │──────────────│    │──────────────│
│ PK: Id       │    │ PK: Id       │    │ PK: Id       │    │ PK: Id       │    │ PK: Id       │
│ FK: ParentId │    │ FK: ParentId │    │ FK: ParentId │    │ FK: ParentId │    │ FK: ParentId │
│ Name         │    │ Name         │    │ Name         │    │ Name         │    │ Name         │
│ Code         │    │ Code         │    │ Code         │    │ Code         │    │ Code         │
│ Type         │    │ Type         │    │ Type         │    │ Type         │    │ IsActive     │
│ IsActive     │    │ IsActive     │    │ IsActive     │    │ IsActive     │    │              │
└──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘
      ↑                   ↑                   ↑                   ↑                   ↑
      │                   │                   │                   │                   │
      └───────────────────┴───────────────────┴───────────────────┴───────────────────┘
                                              │
                                              │ All segments referenced by combinations
                                              ↓

┌──────────────────────────────────────────────────────────────────────────────┐
│                    COMBINATION LAYER (Valid Code Sets)                       │
└──────────────────────────────────────────────────────────────────────────────┘

                        ┌─────────────────────────┐
                        │ UACSCodeCombination     │ ← Approved code combinations
                        │─────────────────────────│
                        │ PK: Id                  │
                        │ FK: FundSourceId        │ ──→ FundSource.Id
                        │ FK: OrganizationId      │ ──→ Organization.Id
                        │ FK: LocationId          │ ──→ Location.Id
                        │ FK: MFOPAPId            │ ──→ MFOPAP.Id
                        │ FK: ObjectId            │ ──→ Object.Id
                        │ FK: FiscalYearId        │ ──→ FiscalYear.Id
                        │ CombinationCode         │ (e.g., "01-101-001-P001-5021401000")
                        │ Description             │
                        │ IsValid                 │
                        │ EffectiveDate           │
                        │ ExpiryDate              │
                        │ IsActive                │
                        └─────────────────────────┘
                                    │
                                    │ 1:N (One combination used in many transactions)
                                    ↓
                        ┌─────────────────────────┐
                        │     Transaction         │ ← Financial transactions
                        │─────────────────────────│
                        │ PK: Id                  │
                        │ FK: CombinationId       │ (if using combinations)
                        │ Amount                  │
                        │ TransactionDate         │
                        │ ...                     │
                        └─────────────────────────┘
```

---

## Table Relationships Explained

### 1. **Configuration Layer** (UACSCodeSegment ← UACSValidationRule)

**Relationship Type:** One-to-Many (1:N)

**UACSCodeSegment (Parent)** ──1:N──→ **UACSValidationRule (Child)**

- **Purpose:** Defines how each UACS segment type should be structured
- **Example:**
  ```
  UACSCodeSegment (SegmentType = FundSource)
    ├─ ValidationRule 1: "Code must match pattern ^[0-9]{2}-[0-9]{3}$"
    ├─ ValidationRule 2: "Code must not contain special characters"
    └─ ValidationRule 3: "Must have parent for sub-funds"
  ```

**Key Points:**
- Each segment type (1-5) can have ONE configuration record
- Each configuration can have MULTIPLE validation rules
- `UACSValidationRule.CodeSegmentId` is **optional** (nullable) - rules can apply globally

**SQL Relationship:**
```sql
ALTER TABLE UACSValidationRules 
ADD CONSTRAINT FK_ValidationRule_CodeSegment 
FOREIGN KEY (CodeSegmentId) REFERENCES UACSCodeSegments(Id);
```

---

### 2. **Data Layer** (5 Segment Entities - Self-Referencing Hierarchies)

**Relationship Type:** Self-Referencing One-to-Many (Hierarchical)

**Example: FundSource**
```
FundSource (ParentId = NULL)
  ├─ FundSource (ParentId = parent.Id)
  │   └─ FundSource (ParentId = child.Id)
  └─ FundSource (ParentId = parent.Id)
```

**All 5 entities have the same pattern:**
- **FundSource:** `ParentId` → `FundSource.Id`
- **Organization:** `ParentId` → `Organization.Id`
- **Location:** `ParentId` → `Location.Id`
- **MFOPAP:** `ParentId` → `MFOPAP.Id`
- **Object:** `ParentId` → `Object.Id`

**Key Points:**
- Each entity can have a parent of the same type (hierarchical structure)
- Root records have `ParentId = NULL`
- These entities are **independent** - no direct relationship between them
- Configuration layer defines rules, but **NO foreign key** from data to config

**Example Hierarchy:**
```
General Fund (01)
  ├─ Special Education Fund (01-001)
  └─ Health Services Fund (01-002)

Office of the President (100)
  ├─ Executive Department (101)
  │   └─ Budget Office (101-01)
  └─ Legislative Department (102)
```

---

### 3. **Combination Layer** (UACSCodeCombination → 5 Segments)

**Relationship Type:** Many-to-One (N:1) for each segment

**UACSCodeCombination (Child)** ──N:1──→ **Each Segment Entity (Parent)**

**Foreign Keys:**
```
UACSCodeCombination.FundSourceId     → FundSource.Id
UACSCodeCombination.OrganizationId   → Organization.Id
UACSCodeCombination.LocationId       → Location.Id
UACSCodeCombination.MFOPAPId         → MFOPAP.Id
UACSCodeCombination.ObjectId         → Object.Id
UACSCodeCombination.FiscalYearId     → FiscalYear.Id
```

**Key Points:**
- One combination references one instance from each segment (or null)
- At least ONE segment must be populated (validation rule)
- Creates valid "approved" code combinations
- Each segment can be used in MULTIPLE combinations

**Example:**
```
Combination 1: "01-101-001-P001-5021401000"
├─ FundSource: General Fund (01)
├─ Organization: Executive Office (101)
├─ Location: Main Office (001)
├─ MFOPAP: Basic Education Program (P001)
└─ Object: Regular Personnel (5021401000)

Combination 2: "01-102-001-P001-5021401000" (reuses most segments)
├─ FundSource: General Fund (01) ← SAME
├─ Organization: Legislative Office (102) ← DIFFERENT
├─ Location: Main Office (001) ← SAME
├─ MFOPAP: Basic Education Program (P001) ← SAME
└─ Object: Regular Personnel (5021401000) ← SAME
```

**SQL Relationships:**
```sql
ALTER TABLE UACSCodeCombinations
ADD CONSTRAINT FK_Combination_FundSource 
FOREIGN KEY (FundSourceId) REFERENCES FundSources(Id);

ALTER TABLE UACSCodeCombinations
ADD CONSTRAINT FK_Combination_Organization 
FOREIGN KEY (OrganizationId) REFERENCES Organizations(Id);

-- ... (similar for Location, MFOPAP, Object, FiscalYear)
```

---

### 4. **Transaction Layer** (Transaction → UACSCodeCombination)

**Relationship Type:** Many-to-One (N:1)

**Transaction (Child)** ──N:1──→ **UACSCodeCombination (Parent)**

**Key Points:**
- Many transactions can use the same approved combination
- Ensures all financial transactions use validated UACS codes
- Provides audit trail and reporting capabilities

**Example:**
```
UACSCodeCombination: "01-101-001-P001-5021401000"
  ├─ Transaction 1: PHP 50,000 (Salary Payment)
  ├─ Transaction 2: PHP 45,000 (Salary Payment)
  └─ Transaction 3: PHP 52,000 (Salary Payment)
```

---

## Data Flow & Validation Process

### Step 1: Configuration Setup
```
1. Create UACSCodeSegment for FundSource
   ├─ Pattern: "^[0-9]{2}-[0-9]{3}$"
   ├─ MaxLength: 10
   └─ IsRequired: true

2. Add UACSValidationRules
   ├─ Rule 1: Check pattern match
   ├─ Rule 2: Check duplicate codes
   └─ Rule 3: Validate hierarchy
```

### Step 2: Create Code Data
```
3. Create FundSource codes
   ├─ Code: "01" (General Fund)
   └─ Code: "01-001" (Sub-fund)

4. Create Organization codes
   ├─ Code: "101" (Executive Office)
   └─ Code: "102" (Legislative Office)

5. Create other segment codes (Location, MFOPAP, Object)
```

### Step 3: Define Valid Combinations
```
6. Create UACSCodeCombination
   ├─ Link to: FundSource.Id (01)
   ├─ Link to: Organization.Id (101)
   ├─ Link to: Location.Id (001)
   ├─ Link to: MFOPAP.Id (P001)
   ├─ Link to: Object.Id (5021401000)
   ├─ CombinationCode: "01-101-001-P001-5021401000"
   └─ Validate against rules → IsValid = true
```

### Step 4: Use in Transactions
```
7. Create Transaction
   ├─ Link to: UACSCodeCombination.Id
   ├─ Amount: PHP 50,000
   └─ Automatically inherits all UACS codes
```

---

## Cardinality Summary

| Relationship | Type | Description |
|-------------|------|-------------|
| UACSCodeSegment → UACSValidationRule | 1:N | One config has many rules |
| FundSource → FundSource (self) | 1:N | Parent-child hierarchy |
| Organization → Organization (self) | 1:N | Parent-child hierarchy |
| Location → Location (self) | 1:N | Parent-child hierarchy |
| MFOPAP → MFOPAP (self) | 1:N | Parent-child hierarchy |
| Object → Object (self) | 1:N | Parent-child hierarchy |
| FundSource ← UACSCodeCombination | 1:N | One fund used in many combos |
| Organization ← UACSCodeCombination | 1:N | One org used in many combos |
| Location ← UACSCodeCombination | 1:N | One location used in many combos |
| MFOPAP ← UACSCodeCombination | 1:N | One program used in many combos |
| Object ← UACSCodeCombination | 1:N | One object used in many combos |
| FiscalYear ← UACSCodeCombination | 1:N | One year has many combos |
| UACSCodeCombination ← Transaction | 1:N | One combo used in many transactions |

---

## Key Design Decisions

### ✅ **Separation of Concerns**

**Configuration vs Data:**
- UACSCodeSegment (config) is **separate** from segment entities (data)
- No foreign key from FundSource → UACSCodeSegment
- Configuration can change without affecting existing codes

### ✅ **Flexible Validation**

**Rules are Optional:**
- `UACSValidationRule.CodeSegmentId` is nullable
- Rules can apply to specific segments OR globally
- Multiple rules per segment with priority ordering

### ✅ **Hierarchical Structure**

**Self-Referencing:**
- All 5 segment entities support parent-child relationships
- Enables organizational structures, fund hierarchies, location trees
- `ParentId = NULL` for root nodes

### ✅ **Combination Tracking**

**Approved Code Sets:**
- UACSCodeCombination tracks valid/approved combinations
- Fiscal year scoping with effective/expiry dates
- Pre-validation reduces transaction errors

### ✅ **Transaction Integration**

**Single Source of Truth:**
- Transactions reference combinations (not individual codes)
- Ensures UACS compliance at transaction level
- Simplifies reporting and analysis

---

## Query Examples

### Get all validation rules for FundSource segment:
```sql
SELECT vr.* 
FROM UACSValidationRules vr
JOIN UACSCodeSegments cs ON vr.CodeSegmentId = cs.Id
WHERE cs.SegmentType = 1; -- FundSource
```

### Get all combinations using a specific fund:
```sql
SELECT c.CombinationCode, c.Description
FROM UACSCodeCombinations c
WHERE c.FundSourceId = @fundSourceId
  AND c.IsActive = true
  AND c.IsValid = true;
```

### Get full UACS details for a combination:
```sql
SELECT 
    c.CombinationCode,
    f.Code as FundCode, f.Name as FundName,
    o.Code as OrgCode, o.Name as OrgName,
    l.Code as LocCode, l.Name as LocName,
    m.Code as MFOCode, m.Name as MFOName,
    obj.Code as ObjectCode, obj.Name as ObjectName
FROM UACSCodeCombinations c
LEFT JOIN FundSources f ON c.FundSourceId = f.Id
LEFT JOIN Organizations o ON c.OrganizationId = o.Id
LEFT JOIN Locations l ON c.LocationId = l.Id
LEFT JOIN MFOPAPs m ON c.MFOPAPId = m.Id
LEFT JOIN Objects obj ON c.ObjectId = obj.Id
WHERE c.Id = @combinationId;
```

### Get hierarchy for FundSource:
```sql
WITH RECURSIVE FundHierarchy AS (
    -- Root funds
    SELECT Id, ParentId, Code, Name, 0 as Level
    FROM FundSources
    WHERE ParentId IS NULL
    
    UNION ALL
    
    -- Child funds
    SELECT f.Id, f.ParentId, f.Code, f.Name, h.Level + 1
    FROM FundSources f
    JOIN FundHierarchy h ON f.ParentId = h.Id
)
SELECT * FROM FundHierarchy ORDER BY Level, Code;
```

---

## Database Indexes (Recommended)

```sql
-- UACSCodeSegment
CREATE UNIQUE INDEX IX_UACSCodeSegment_SegmentType ON UACSCodeSegments(SegmentType) WHERE IsDeleted = 0;

-- UACSValidationRule
CREATE INDEX IX_ValidationRule_CodeSegmentId ON UACSValidationRules(CodeSegmentId);
CREATE INDEX IX_ValidationRule_Priority ON UACSValidationRules(Priority, IsActive);

-- UACSCodeCombination
CREATE INDEX IX_Combination_FundSourceId ON UACSCodeCombinations(FundSourceId);
CREATE INDEX IX_Combination_OrganizationId ON UACSCodeCombinations(OrganizationId);
CREATE INDEX IX_Combination_LocationId ON UACSCodeCombinations(LocationId);
CREATE INDEX IX_Combination_MFOPAPId ON UACSCodeCombinations(MFOPAPId);
CREATE INDEX IX_Combination_ObjectId ON UACSCodeCombinations(ObjectId);
CREATE INDEX IX_Combination_FiscalYearId ON UACSCodeCombinations(FiscalYearId);
CREATE INDEX IX_Combination_Code ON UACSCodeCombinations(CombinationCode);

-- All Segment Entities
CREATE INDEX IX_FundSource_ParentId ON FundSources(ParentId);
CREATE INDEX IX_FundSource_Code ON FundSources(Code);
-- (repeat for Organization, Location, MFOPAP, Object)
```

---

## Summary

The UACS Library uses a **3-tier architecture**:

1. **Configuration Tier** - Defines rules and structure (UACSCodeSegment, UACSValidationRule)
2. **Data Tier** - Stores actual codes (FundSource, Organization, Location, MFOPAP, Object)
3. **Combination Tier** - Tracks valid combinations (UACSCodeCombination)

**Key Benefits:**
- ✅ Flexible configuration without data migration
- ✅ Independent hierarchical structures for each segment
- ✅ Pre-validated code combinations reduce errors
- ✅ Single source of truth for financial transactions
- ✅ Supports fiscal year scoping and date ranges
- ✅ Comprehensive audit trail

**Last Updated:** January 23, 2026
