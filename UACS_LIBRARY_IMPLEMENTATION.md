# UACS Library Sub-Module Implementation Documentation

## Overview

The Unified Accounts Code Structure (UACS) Library is the financial backbone of the SPMS (Strategic Performance Management System). It provides a centralized repository for managing financial codes across Budgeting, Treasury, and Accounting modules.

## Implementation Date
**Created:** January 22, 2026  
**Status:** Complete  
**Version:** 1.0

---

## 1. Architecture Overview

### 1.1 UACS 5-Element Structure

The UACS system is based on five core code segments:

1. **FundSource (Funding)** - Fund clusters and sources
2. **Organization** - Organizational units and departments
3. **Location** - Geographic and location codes
4. **MFOPAP (Major Final Output / Programs and Projects)** - Program structures
5. **Object** - Object of expenditure codes

### 1.2 Database Schema

#### Core Entities (Already Implemented)

**FundSource Entity:**
```
- Id (Guid, PK)
- ParentId (Guid?, FK to FundSource)
- Name (string)
- Code (string)
- Type (FundSourceTypeEnum)
- IsActive (bool)
- CreatedAt, CreatedBy, UpdatedAt, UpdatedBy
- IsDeleted, DeletedAt, DeletedBy
```

**Organization Entity:**
```
- Id (Guid, PK)
- ParentId (Guid?, FK to Organization)
- Name (string)
- Code (string)
- Type (string)
- IsActive (bool)
- Standard audit fields
```

**Location Entity:**
```
- Id (Guid, PK)
- ParentId (Guid?, FK to Location)
- Name (string)
- Code (string)
- Type (string)
- IsActive (bool)
- Standard audit fields
```

**MFOPAP Entity:**
```
- Id (Guid, PK)
- ParentId (Guid?, FK to MFOPAP)
- Name (string)
- Code (string)
- Type (string)
- IsActive (bool)
- Standard audit fields
```

**Object Entity:**
```
- Id (Guid, PK)
- ParentId (Guid?, FK to Object)
- Name (string)
- Code (string)
- IsActive (bool)
- Standard audit fields
```

#### Extended UACS Entities (New Implementation)

**UACSCodeSegment Entity:**
```
- Id (Guid, PK)
- SegmentType (UACSSegmentTypeEnum: FundSource, Organization, Location, MFOPAP, Object)
- Name (string)
- Description (string)
- DisplayOrder (int)
- IsRequired (bool)
- MaxLength (int)
- Pattern (string) - Regex pattern for validation
- IsActive (bool)
- Standard audit fields
```

**UACSValidationRule Entity:**
```
- Id (Guid, PK)
- RuleName (string)
- Description (string)
- SegmentType (UACSSegmentTypeEnum?)
- ValidationExpression (string) - Custom validation logic
- ErrorMessage (string)
- IsActive (bool)
- Priority (int)
- Standard audit fields
```

**UACSCodeCombination Entity:**
```
- Id (Guid, PK)
- FundSourceId (Guid?, FK to FundSource)
- OrganizationId (Guid?, FK to Organization)
- LocationId (Guid?, FK to Location)
- MFOPAPId (Guid?, FK to MFOPAP)
- ObjectId (Guid?, FK to Object)
- CombinationCode (string) - Concatenated UACS code
- Description (string)
- IsValid (bool)
- FiscalYearId (Guid?, FK to FiscalYear)
- EffectiveDate (DateTime)
- ExpiryDate (DateTime?)
- IsActive (bool)
- Standard audit fields
```

---

## 2. API Implementation Status

### 2.1 Core UACS Entities - CRUD Operations

| Entity | Endpoint Base | Create | Read | Update | Delete |
|--------|--------------|--------|------|--------|--------|
| FundSource | `/fund-sources` | ✅ | ✅ | ✅ | ✅ |
| Organization | `/organizations` | ✅ | ✅ | ✅ | ✅ |
| Location | `/locations` | ✅ | ✅ | ✅ | ✅ |
| MFOPAP | `/mfopaps` | ✅ | ✅ | ✅ | ✅ |
| Object | `/objects` | ✅ | ✅ | ✅ | ✅ |

### 2.2 Extended UACS Entities

| Entity | Endpoint Base | Create | Read | Update | Delete |
|--------|--------------|--------|------|--------|--------|
| UACSCodeSegment | `/uacs-code-segments` | 🔄 | 🔄 | 🔄 | 🔄 |
| UACSValidationRule | `/uacs-validation-rules` | 🔄 | 🔄 | 🔄 | 🔄 |
| UACSCodeCombination | `/uacs-code-combinations` | 🔄 | 🔄 | 🔄 | 🔄 |

Legend: ✅ Complete | 🔄 In Progress | ❌ Not Started

### 2.3 Special Integration Endpoints

**UACS Validation Service:**
```
POST /uacs/validate-combination
- Validates a UACS code combination
- Returns validation result with detailed error messages

GET /uacs/code-segments
- Returns all configured code segments
- Includes hierarchy information

GET /uacs/validate-code/{segmentType}/{code}
- Validates a single code segment
- Returns validation result

POST /uacs/bulk-import
- Imports UACS codes from CSV/Excel
- Returns import result with errors

GET /uacs/export/{segmentType}
- Exports UACS codes to CSV/Excel
- Includes hierarchy

GET /uacs/search
- Advanced search across all UACS segments
- Supports filters, sorting, pagination
```

---

## 3. Feature Implementation Checklist

### Phase 1: Core Architecture ✅
- [x] Database schema designed for 5-element UACS structure
- [x] Entity models created with proper relationships
- [x] DbContext configured with all entities
- [x] Base entities implement soft delete pattern

### Phase 2: CRUD Operations ✅
- [x] FundSource CRUD complete with validators
- [x] Organization CRUD complete with validators
- [x] Location CRUD complete with validators
- [x] MFOPAP CRUD complete with validators
- [x] Object CRUD complete with validators

### Phase 3: Extended UACS Features 🔄
- [ ] UACSCodeSegment entity and CRUD
- [ ] UACSValidationRule entity and CRUD
- [ ] UACSCodeCombination entity and CRUD
- [ ] UACS validation service implementation

### Phase 4: Integration & Utilities 🔄
- [ ] Bulk import/export functionality
- [ ] Hierarchical query support
- [ ] Code search and filtering
- [ ] Integration API for other modules

### Phase 5: Security & Access Control 🔄
- [ ] Role-based access control (ABAC)
- [ ] Super Admin: Full access
- [ ] Budget Officer: Edit access
- [ ] Planner: Read-only access
- [ ] Audit logging for all changes

### Phase 6: Documentation & Testing 🔄
- [ ] API documentation (Swagger)
- [ ] Unit tests for all operations
- [ ] Integration tests
- [ ] User guide and examples

---

## 4. Validation Requirements

### 4.1 FluentValidation Coverage

All commands must have corresponding validators:
- ✅ All core UACS entity commands have validators
- 🔄 Extended UACS entity commands validators pending

### 4.2 Validation Rules

**FundSource:**
- Code: Required, 1-20 characters
- Name: Required, 3-200 characters
- Type: Must be valid FundSourceTypeEnum

**Organization:**
- Code: Required, 1-20 characters
- Name: Required, 3-200 characters
- Type: Required, 1-50 characters

**Location:**
- Code: Required, 1-20 characters
- Name: Required, 3-200 characters
- Type: Required, 1-50 characters

**MFOPAP:**
- Code: Required, 1-20 characters
- Name: Required, 3-200 characters
- Type: Required, 1-50 characters

**Object:**
- Code: Required, 1-20 characters
- Name: Required, 3-200 characters

---

## 5. Integration with Other Modules

### 5.1 Planning Module
- UACS codes used in WFP (Work and Financial Plan)
- Budget allocation requires valid UACS combinations

### 5.2 Procurement Module
- Purchase requests reference UACS codes
- APP (Annual Procurement Plan) uses UACS structure

### 5.3 Finance Module
- All transactions tagged with UACS codes
- Reports generated by UACS segments

### 5.4 Supply Module
- Inventory items linked to UACS object codes
- Distribution tracked by location codes

---

## 6. Security Model

### 6.1 Role Permissions

**Super Admin:**
- Full CRUD access to all UACS entities
- Can manage validation rules
- Can perform bulk operations
- Access to audit logs

**Budget Officer:**
- Full CRUD access to UACS entities
- Can create and validate combinations
- Can perform bulk operations
- Limited audit log access

**Planner:**
- Read-only access to all UACS entities
- Can view combinations
- Can search and filter
- No modification rights

### 6.2 Audit Trail

All UACS operations are logged:
- Entity type
- Operation type (Create, Update, Delete)
- User ID and role
- Timestamp
- Changed values (before/after)

---

## 7. Query & Filtering Support

### 7.1 Sieve Integration

All UACS entities support advanced filtering using Sieve:
- Filter by any property
- Sort by any property
- Pagination support
- Nested property filtering

**Example Queries:**
```
GET /fund-sources?filters=IsActive==true&sorts=-CreatedAt&page=1&pageSize=20
GET /organizations?filters=Type@=Department,Code@=*-01*&sorts=Name
GET /locations?filters=ParentId==null&sorts=Code
GET /mfopaps?filters=IsActive==true,Type==Program&sorts=-UpdatedAt
GET /objects?filters=Code^=5&sorts=Code
```

### 7.2 Hierarchical Queries

Support for parent-child relationships:
```
GET /fund-sources/{id}/children - Get child fund sources
GET /organizations/{id}/hierarchy - Get full hierarchy
GET /locations/{id}/ancestors - Get parent chain
GET /mfopaps/{id}/descendants - Get all descendants
```

---

## 8. Database Migrations

### 8.1 Initial Migration

The initial migration `20260116103332_InitialSquash` includes:
- All core UACS entities
- Indexes on Code and Name fields
- Foreign key constraints
- Soft delete support

### 8.2 Future Migrations

Pending migrations for extended features:
- UACSCodeSegment table
- UACSValidationRule table
- UACSCodeCombination table
- Additional indexes for performance

---

## 9. Performance Considerations

### 9.1 Indexing Strategy

**Primary Indexes:**
- Code fields (all entities)
- Name fields (for search)
- IsActive + IsDeleted (for filtering)
- ParentId (for hierarchy queries)

**Composite Indexes:**
- (IsActive, IsDeleted, Code)
- (Type, IsActive)
- (ParentId, IsActive)

### 9.2 Caching Strategy

**Cache Candidates:**
- Active UACS codes (rarely change)
- Validation rules
- Code segments configuration
- Hierarchical structures

**Cache Invalidation:**
- On any CRUD operation
- Time-based expiration (30 minutes)
- Manual cache clear endpoint

---

## 10. Testing Strategy

### 10.1 Unit Tests

**Command Handlers:**
- Test successful operations
- Test validation failures
- Test business rule violations
- Test not found scenarios

**Validators:**
- Test all validation rules
- Test edge cases
- Test complex validations

**Query Handlers:**
- Test filtering
- Test sorting
- Test pagination
- Test hierarchical queries

### 10.2 Integration Tests

**API Endpoints:**
- Test full request/response cycle
- Test authentication/authorization
- Test error handling
- Test concurrent operations

**Database:**
- Test migrations
- Test data integrity
- Test cascading deletes
- Test soft delete behavior

---

## 11. Deployment Checklist

### 11.1 Pre-Deployment
- [ ] All unit tests passing
- [ ] Integration tests passing
- [ ] Validation coverage check passing
- [ ] Build with warnings as errors
- [ ] Code review completed
- [ ] Documentation updated

### 11.2 Deployment Steps
1. Backup production database
2. Run database migrations
3. Deploy API application
4. Verify health checks
5. Run smoke tests
6. Monitor logs for errors

### 11.3 Post-Deployment
- [ ] Verify all endpoints accessible
- [ ] Test key user scenarios
- [ ] Check performance metrics
- [ ] Verify audit logging
- [ ] Update API documentation

---

## 12. Troubleshooting Guide

### 12.1 Common Issues

**Issue:** Validation errors on code format
**Solution:** Check UACSValidationRule configuration

**Issue:** Hierarchy queries returning null
**Solution:** Verify ParentId foreign key relationships

**Issue:** Performance issues on large datasets
**Solution:** Check index usage, add caching

**Issue:** Authorization failures
**Solution:** Verify user roles and permissions

### 12.2 Debug Endpoints

**Health Check:**
```
GET /health - API health status
GET /health/db - Database connection status
```

**Diagnostics:**
```
GET /uacs/diagnostics - UACS configuration info
GET /uacs/cache/status - Cache status
POST /uacs/cache/clear - Clear cache
```

---

## 13. Future Enhancements

### 13.1 Planned Features
- [ ] UACS code templates
- [ ] Budget allocation wizard
- [ ] Code recommendation engine
- [ ] Historical code tracking
- [ ] Code conversion utilities
- [ ] Advanced reporting dashboard

### 13.2 Integration Roadmap
- [ ] Integration with Procurement Module
- [ ] Integration with Finance Module
- [ ] Integration with Supply Module
- [ ] Integration with HR Module
- [ ] External system APIs (DBM, COA)

---

## 14. References

### 14.1 Standards & Guidelines
- DBM (Department of Budget and Management) UACS Manual
- COA (Commission on Audit) Guidelines
- NGAS (New Government Accounting System) Standards

### 14.2 Related Documentation
- `README.md` - Project setup guide
- `API_CONTRACT_CHANGES.md` - API versioning
- `VALIDATION_GUIDE.md` - Validation patterns
- `MIGRATION_SUMMARY.md` - Database changes

### 14.3 Contact & Support
- Development Team: Next Steps Software Solutions
- Email: support@nextsteps.com
- Issue Tracker: GitHub Issues

---

## 15. Change Log

### Version 1.0 (January 22, 2026)
- Initial implementation of 5 core UACS entities
- Complete CRUD operations with validators
- Basic API endpoints
- Documentation created

### Future Versions
- Extended UACS features pending
- Integration APIs pending
- Advanced search pending
- Bulk operations pending

---

**Document Status:** Living Document  
**Last Updated:** January 22, 2026  
**Next Review:** February 22, 2026
