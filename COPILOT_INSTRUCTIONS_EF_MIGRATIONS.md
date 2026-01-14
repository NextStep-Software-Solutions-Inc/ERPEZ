# Copilot Instructions Update - Entity Framework Core Migrations

## New Requirement Added: January 14, 2026

### Always Use EF Core for Database Migrations

When making changes to domain entities or database schema, **ALWAYS** use Entity Framework Core tools to create and manage migrations.

### Key Guidelines

#### 1. When to Create Migrations
Create a migration whenever you:
- Add new domain entities
- Modify existing entity properties
- Change entity relationships (navigation properties, foreign keys)
- Update EF Core configurations
- Add or modify indexes, constraints, or database-specific features

#### 2. How to Create Migrations

**Step 1: Ensure EF Tools are Installed**
```bash
dotnet tool install --global dotnet-ef
```

**Step 2: Generate Migration**
```bash
cd /path/to/solution/root
dotnet ef migrations add MigrationName \
  --project ERPEZ/ERPEZ.Infrastructure \
  --startup-project ERPEZ/ERPEZ.Api \
  --context ApplicationDbContext
```

**Step 3: Review Migration**
- Check generated migration file in `ERPEZ.Infrastructure/Migrations/`
- Verify Up() and Down() methods
- Ensure all entity changes are captured

**Step 4: Apply Migration (when ready)**
```bash
dotnet ef database update \
  --project ERPEZ/ERPEZ.Infrastructure \
  --startup-project ERPEZ/ERPEZ.Api \
  --context ApplicationDbContext
```

#### 3. Migration Naming Conventions
Use descriptive names that clearly indicate what the migration does:
- ✅ `Add16NewERDEntitiesWithNavigation`
- ✅ `UpdateUserTableAddEmailVerification`
- ✅ `CreateIndexOnProductName`
- ❌ `Migration1`
- ❌ `Update`
- ❌ `Changes`

#### 4. Handling Migration Errors

**Connection String Required:**
If you get "connection string not found" error, set a temporary connection string:
```bash
cd ERPEZ/ERPEZ.Api
dotnet user-secrets set "ConnectionStrings:DefaultConnection" \
  "Host=localhost;Database=ERPEZ_Db;Username=postgres;Password=postgres"
```

**Build Errors:**
Always fix all build errors before generating migrations:
```bash
dotnet build --configuration Release
```

**Removing Last Migration (before applying):**
```bash
dotnet ef migrations remove \
  --project ERPEZ/ERPEZ.Infrastructure \
  --startup-project ERPEZ/ERPEZ.Api \
  --context ApplicationDbContext
```

Or manually delete migration files if database connection fails:
```bash
rm -f ERPEZ/ERPEZ.Infrastructure/Migrations/TIMESTAMP_MigrationName*
```

#### 5. Implicit Navigation Properties

When creating entities with relationships, **ALWAYS** add navigation properties:

```csharp
public class LineItemBudget : ApprovableEntity
{
    public Guid DeliveryUnitId { get; set; }
    
    // ✅ ALWAYS add navigation properties
    public virtual DeliveryUnit DeliveryUnit { get; set; } = null!;
    public virtual List<LineItemBudgetDetail> LineItemBudgetDetails { get; set; } = [];
}
```

**Navigation Property Rules:**
- Use `virtual` keyword (enables lazy loading)
- Required relationships: `= null!`
- Optional relationships: nullable type
- Collections: `= []` (empty list initialization)

#### 6. Best Practices

**Before Creating Migration:**
1. ✅ Build solution successfully (no warnings, no errors)
2. ✅ Add all navigation properties
3. ✅ Create EF Core configurations for new entities
4. ✅ Apply configurations in DbContext

**After Creating Migration:**
1. ✅ Review generated migration file
2. ✅ Verify schema changes match intent
3. ✅ Check for any data migration needs
4. ✅ Commit migration files with descriptive message
5. ✅ Document any special considerations

**Configuration Auto-Discovery:**
Use assembly scanning to apply all configurations:
```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.ConfigureDefaultEntityConventions();
    modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);
    // ... other configurations
}
```

#### 7. Integration with Copilot Workflow

When implementing new entities:
1. Create domain entities with navigation properties
2. Create EF Core configurations
3. Update ApplicationDbContext (add DbSets)
4. **Generate EF Core migration** ← CRITICAL STEP
5. Build and test
6. Commit all changes including migration files

#### 8. Migration File Locations

All migrations are stored in:
```
ERPEZ/ERPEZ.Infrastructure/Migrations/
├── TIMESTAMP_MigrationName.cs           # Migration code
├── TIMESTAMP_MigrationName.Designer.cs  # Migration metadata
└── ApplicationDbContextModelSnapshot.cs # Current model snapshot
```

**NEVER edit these files manually** - always use EF Core tools.

#### 9. Database Schemas

The ERPEZ project uses multiple schemas:
- `planning` - Planning entities (existing)
- `performance` - Performance entities (new)
- `budget` - Budget entities (new)
- `procurement` - Procurement entities (new)
- `other` - Other/linking entities (new)

Schemas are configured in entity configurations or via `ToTable()`:
```csharp
builder.ToTable("TableName", "schema_name");
```

#### 10. Troubleshooting

**Issue: Migration not capturing changes**
- Solution: Rebuild solution, ensure DbSet is added to DbContext

**Issue: Ambiguous reference errors**
- Solution: Use type aliases (e.g., `using PlanningObject = ERPEZ.Domain.Entities.Planning.Object;`)

**Issue: Foreign key conflicts**
- Solution: Review navigation properties and ensure both sides of relationship are configured

## Reference Implementation

See commit: `eabf726` for complete example of:
- 16 new entities with navigation properties
- 16 EF Core configurations
- Migration generation and validation
- Zero breaking changes

## Documentation

See `IMPLEMENTATION_SUMMARY_16_NEW_ENTITIES.md` for detailed implementation example.

---

**Last Updated:** January 14, 2026
**Status:** Active Requirement
**Priority:** Critical - Must be followed for all schema changes
