using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Infrastructure.Persistence;
using ERPEZ.Shared.Interfaces;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;

namespace Dashboard.Application.UnitTests.MultiTenancy;

/// <summary>
/// Unit tests simulating the execution of the multi-stage transactional migration pipeline
/// against legacy single-tenant staging datasets.
/// Validates:
/// 1. Deterministic provenance backfill of legacy single-tenant data to target tenant ID.
/// 2. Zero-null / zero-empty TenantId integrity post-migration.
/// 3. Immediate visibility restoration under EF Core Global Query Filters.
/// 4. Isolation against cross-tenant data leakage.
/// 5. Preservation of relational integrity and foreign keys across procurement and planning entities.
/// 6. Multi-tenant composite natural key collision prevention.
/// </summary>
public class LegacyStagingDataMigrationSimulationTests
{
    private readonly Guid legacyTenantId = Guid.Parse("01a0d69d-924b-762c-a774-523a30544619");
    private readonly Guid otherTenantId = Guid.Parse("02b1e70e-135c-873d-b885-634b41655720");

    private ApplicationDbContext CreateDbContext(Guid currentTenantId, string dbName)
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: dbName)
            .Options;

        var mockRequestCtx = new Mock<ITenantRequestContext>();
        mockRequestCtx.Setup(c => c.IsResolved).Returns(true);
        mockRequestCtx.Setup(c => c.TenantId).Returns(currentTenantId);

        return new ApplicationDbContext(options, mockRequestCtx.Object);
    }

    [Fact]
    public async Task StagingLegacyData_WhenBackfilled_RestoresVisibilityUnderGlobalQueryFilters()
    {
        var dbName = "LegacyStagingMigration_" + Guid.NewGuid();

        // 1. Arrange: Simulate legacy single-tenant data state prior to multi-tenant backfill
        // Under legacy single-tenant operation, entities existed without valid tenant attribution (Guid.Empty)
        using (var setupContext = CreateDbContext(Guid.Empty, dbName))
        {
            var office = new Office
            {
                Id = Guid.NewGuid(),
                Code = "OFF-001",
                Name = "Office of the Secretary",
                TenantId = Guid.Empty
            };

            var pr = new PurchaseRequest
            {
                Id = Guid.NewGuid(),
                PRNumber = "PR-2026-001",
                OfficeId = office.Id,
                TenantId = Guid.Empty
            };

            var item1 = new PRItem
            {
                Id = Guid.NewGuid(),
                PurchaseRequestId = pr.Id,
                Name = "Laptop Workstation",
                Description = "Core i7 Laptop",
                RequestedQuantity = 5,
                UnitCost = 45000,
                Amount = 225000,
                TenantId = Guid.Empty
            };

            var po = new PurchaseOrder
            {
                Id = Guid.NewGuid(),
                PONumber = "PO-2026-001",
                TenantId = Guid.Empty
            };

            setupContext.Offices!.Add(office);
            setupContext.PurchaseRequests!.Add(pr);
            setupContext.PRItems!.Add(item1);
            setupContext.PurchaseOrders!.Add(po);
            await setupContext.SaveChangesAsync();
        }

        // Verify: Before backfill, tenant querying with their assigned ID sees 0 records due to global query filter
        using (var preContext = CreateDbContext(legacyTenantId, dbName))
        {
            var visiblePRs = await preContext.PurchaseRequests!.ToListAsync();
            visiblePRs.Should().BeEmpty("un-backfilled legacy records with Guid.Empty must not be visible to the tenant");
        }

        // 2. Act: Simulate Stage 2 & 3 of production-tenant-backfill-and-migration.sql
        // (Deterministic Provenance Backfill & Assertion)
        using (var migrationContext = CreateDbContext(Guid.Empty, dbName))
        {
            var offices = await migrationContext.Offices!.IgnoreQueryFilters().ToListAsync();
            foreach (var o in offices) o.TenantId = legacyTenantId;

            var prs = await migrationContext.PurchaseRequests!.IgnoreQueryFilters().ToListAsync();
            foreach (var p in prs) p.TenantId = legacyTenantId;

            var prItems = await migrationContext.PRItems!.IgnoreQueryFilters().ToListAsync();
            foreach (var pi in prItems) pi.TenantId = legacyTenantId;

            var pos = await migrationContext.PurchaseOrders!.IgnoreQueryFilters().ToListAsync();
            foreach (var po in pos) po.TenantId = legacyTenantId;

            await migrationContext.SaveChangesAsync();

            // Stage 3 Integrity Assertions: Assert ZERO records remain with Guid.Empty
            var remainingEmptyPRs = await migrationContext.PurchaseRequests!
                .IgnoreQueryFilters()
                .CountAsync(p => p.TenantId == Guid.Empty);
            remainingEmptyPRs.Should().Be(0, "Stage 3 assertion guarantees 0 empty TenantIds remain");
        }

        // 3. Assert: After backfill, tenant querying with their assigned ID sees all restored records
        using (var postContext = CreateDbContext(legacyTenantId, dbName))
        {
            var restoredPRs = await postContext.PurchaseRequests!
                .Include(p => p.PRItems)
                .Include(p => p.Office)
                .ToListAsync();

            restoredPRs.Should().HaveCount(1);
            restoredPRs[0].PRNumber.Should().Be("PR-2026-001");
            restoredPRs[0].Office.Should().NotBeNull();
            restoredPRs[0].Office!.Code.Should().Be("OFF-001");
            restoredPRs[0].PRItems.Should().HaveCount(1);
            restoredPRs[0].PRItems[0].Name.Should().Be("Laptop Workstation");

            var restoredPOs = await postContext.PurchaseOrders!.ToListAsync();
            restoredPOs.Should().HaveCount(1);
            restoredPOs[0].PONumber.Should().Be("PO-2026-001");
        }

        // 4. Assert: Cross-tenant isolation prevents other tenants from seeing the backfilled data
        using (var otherContext = CreateDbContext(otherTenantId, dbName))
        {
            var otherPRs = await otherContext.PurchaseRequests!.ToListAsync();
            otherPRs.Should().BeEmpty("other tenants must not see backfilled records of the legacy tenant");

            var otherOffices = await otherContext.Offices!.ToListAsync();
            otherOffices.Should().BeEmpty();
        }
    }

    [Fact]
    public async Task MultiTenantCompositeKeys_AllowSameBusinessKeysAcrossDifferentTenants()
    {
        var dbName = "CompositeKeyCollisionTest_" + Guid.NewGuid();

        // Tenant 1 (Migrated legacy tenant)
        using (var context1 = CreateDbContext(legacyTenantId, dbName))
        {
            var office1 = new Office
            {
                Id = Guid.NewGuid(),
                Code = "ADMIN-01",
                Name = "Administrative Division",
                TenantId = legacyTenantId
            };

            var po1 = new PurchaseOrder
            {
                Id = Guid.NewGuid(),
                PONumber = "PO-2026-GLOBAL-001",
                TenantId = legacyTenantId
            };

            context1.Offices!.Add(office1);
            context1.PurchaseOrders!.Add(po1);
            await context1.SaveChangesAsync();
        }

        // Tenant 2 (New SaaS tenant onboarded post-migration)
        // With composite indexes ("TenantId", "Code") and ("TenantId", "PONumber"),
        // Tenant 2 can use the identical business code without unique constraint collisions.
        using (var context2 = CreateDbContext(otherTenantId, dbName))
        {
            var office2 = new Office
            {
                Id = Guid.NewGuid(),
                Code = "ADMIN-01", // Identical business code
                Name = "Regional Admin Division",
                TenantId = otherTenantId
            };

            var po2 = new PurchaseOrder
            {
                Id = Guid.NewGuid(),
                PONumber = "PO-2026-GLOBAL-001", // Identical PO number
                TenantId = otherTenantId
            };

            context2.Offices!.Add(office2);
            context2.PurchaseOrders!.Add(po2);
            await context2.SaveChangesAsync();
        }

        // Verify each tenant retrieves only their own instance of the duplicate business key
        using (var verifyContext1 = CreateDbContext(legacyTenantId, dbName))
        {
            var office = await verifyContext1.Offices!.FirstOrDefaultAsync(o => o.Code == "ADMIN-01");
            office.Should().NotBeNull();
            office!.Name.Should().Be("Administrative Division");
            office.TenantId.Should().Be(legacyTenantId);
        }

        using (var verifyContext2 = CreateDbContext(otherTenantId, dbName))
        {
            var office = await verifyContext2.Offices!.FirstOrDefaultAsync(o => o.Code == "ADMIN-01");
            office.Should().NotBeNull();
            office!.Name.Should().Be("Regional Admin Division");
            office.TenantId.Should().Be(otherTenantId);
        }
    }
}
