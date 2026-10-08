using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Enums;
using ERPEZ.Infrastructure.Persistence;
using ERPEZ.Shared.Interfaces;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;

namespace Dashboard.Application.UnitTests.MultiTenancy;

/// <summary>
/// Verifies that complex procurement domain workflows, eager-loaded navigation graphs,
/// explicit joins, and financial aggregations remain strictly isolated and regress-free
/// under EF Core Global Query Filters.
/// </summary>
public class ProcurementWorkflowCrossEntityJoinTests
{
    private readonly Guid tenantA = Guid.NewGuid();
    private readonly Guid tenantB = Guid.NewGuid();

    private (ApplicationDbContext dbA, ApplicationDbContext dbB, ApplicationDbContext dbUnresolved) CreateDbContexts()
    {
        var dbName = "ProcurementJoinTests_" + Guid.NewGuid();
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: dbName)
            .Options;

        var mockRequestCtxA = new Mock<ITenantRequestContext>();
        mockRequestCtxA.Setup(c => c.IsResolved).Returns(true);
        mockRequestCtxA.Setup(c => c.TenantId).Returns(tenantA);

        var mockRequestCtxB = new Mock<ITenantRequestContext>();
        mockRequestCtxB.Setup(c => c.IsResolved).Returns(true);
        mockRequestCtxB.Setup(c => c.TenantId).Returns(tenantB);

        var mockRequestCtxUnset = new Mock<ITenantRequestContext>();
        mockRequestCtxUnset.Setup(c => c.IsResolved).Returns(false);
        mockRequestCtxUnset.Setup(c => c.TenantId).Returns((Guid?)null);

        var dbA = new ApplicationDbContext(options, mockRequestCtxA.Object);
        var dbB = new ApplicationDbContext(options, mockRequestCtxB.Object);
        var dbUnresolved = new ApplicationDbContext(options, mockRequestCtxUnset.Object);

        return (dbA, dbB, dbUnresolved);
    }

    [Fact]
    public async Task ProcurementChain_EagerLoadingWithInclude_StrictlyFiltersRelatedTenantEntities()
    {
        // Arrange
        var (dbA, dbB, _) = CreateDbContexts();

        // Tenant A: Supplier + PO + Items
        var supplierA = new Supplier
        {
            Id = Guid.NewGuid(),
            TenantId = tenantA,
            Name = "Acme Supplies Corp - Tenant A",
            BusinessPermitNo = "BP-A-100",
            Email = "sales@acme-a.ph",
            TINNumber = "123-456-789-001"
        };
        var poA = new PurchaseOrder
        {
            Id = Guid.NewGuid(),
            TenantId = tenantA,
            PONumber = "PO-2026-A01",
            SupplierId = supplierA.Id,
            Supplier = supplierA,
            TotalAmount = 150000m,
            Status = StatusEnum.Approved
        };
        var poItemA1 = new PurchaseOrderItem
        {
            Id = Guid.NewGuid(),
            TenantId = tenantA,
            PurchaseOrderId = poA.Id,
            Description = "Ergonomic Chairs",
            Quantity = 50,
            UnitPrice = 2000m,
            Amount = 100000m
        };
        var poItemA2 = new PurchaseOrderItem
        {
            Id = Guid.NewGuid(),
            TenantId = tenantA,
            PurchaseOrderId = poA.Id,
            Description = "Filing Cabinets",
            Quantity = 10,
            UnitPrice = 5000m,
            Amount = 50000m
        };
        poA.PurchaseOrderItems = [poItemA1, poItemA2];

        // Tenant B: Supplier + PO + Items
        var supplierB = new Supplier
        {
            Id = Guid.NewGuid(),
            TenantId = tenantB,
            Name = "Global Logistics Ltd - Tenant B",
            BusinessPermitNo = "BP-B-200",
            Email = "orders@global-b.ph",
            TINNumber = "987-654-321-002"
        };
        var poB = new PurchaseOrder
        {
            Id = Guid.NewGuid(),
            TenantId = tenantB,
            PONumber = "PO-2026-B01",
            SupplierId = supplierB.Id,
            Supplier = supplierB,
            TotalAmount = 80000m,
            Status = StatusEnum.Draft
        };
        var poItemB1 = new PurchaseOrderItem
        {
            Id = Guid.NewGuid(),
            TenantId = tenantB,
            PurchaseOrderId = poB.Id,
            Description = "Server Rack",
            Quantity = 1,
            UnitPrice = 80000m,
            Amount = 80000m
        };
        poB.PurchaseOrderItems = [poItemB1];

        // Seed both tenants
        dbA.Suppliers!.Add(supplierA);
        dbA.PurchaseOrders!.Add(poA);
        dbB.Suppliers!.Add(supplierB);
        dbB.PurchaseOrders!.Add(poB);
        await dbA.SaveChangesAsync();
        await dbB.SaveChangesAsync();

        // Act - Query Tenant A with eager loading
        var tenantAPOs = await dbA.PurchaseOrders!
            .Include(po => po.Supplier)
            .Include(po => po.PurchaseOrderItems)
            .ToListAsync();

        // Assert - Tenant A only sees its own PO, supplier, and items
        tenantAPOs.Should().ContainSingle();
        var queriedPoA = tenantAPOs[0];
        queriedPoA.PONumber.Should().Be("PO-2026-A01");
        queriedPoA.Supplier.Should().NotBeNull();
        queriedPoA.Supplier!.Name.Should().Be("Acme Supplies Corp - Tenant A");
        queriedPoA.PurchaseOrderItems.Should().HaveCount(2);
        queriedPoA.PurchaseOrderItems.Select(i => i.Description)
            .Should().BeEquivalentTo(new[] { "Ergonomic Chairs", "Filing Cabinets" });

        // Act - Query Tenant B with eager loading
        var tenantBPOs = await dbB.PurchaseOrders!
            .Include(po => po.Supplier)
            .Include(po => po.PurchaseOrderItems)
            .ToListAsync();

        // Assert - Tenant B only sees its own PO, supplier, and items
        tenantBPOs.Should().ContainSingle();
        var queriedPoB = tenantBPOs[0];
        queriedPoB.PONumber.Should().Be("PO-2026-B01");
        queriedPoB.Supplier.Should().NotBeNull();
        queriedPoB.Supplier!.Name.Should().Be("Global Logistics Ltd - Tenant B");
        queriedPoB.PurchaseOrderItems.Should().ContainSingle();
        queriedPoB.PurchaseOrderItems[0].Description.Should().Be("Server Rack");
    }

    [Fact]
    public async Task CrossTenantEntityJoin_ExplicitJoinQuery_ReturnsOnlyMatchingTenantRecords()
    {
        // Arrange
        var (dbA, dbB, _) = CreateDbContexts();

        var supplierA = new Supplier
        {
            Id = Guid.NewGuid(),
            TenantId = tenantA,
            Name = "Supplier A",
            BusinessPermitNo = "BP-A",
            Email = "a@test.ph",
            TINNumber = "TIN-A"
        };
        var poA = new PurchaseOrder
        {
            Id = Guid.NewGuid(),
            TenantId = tenantA,
            PONumber = "PO-JOIN-A",
            SupplierId = supplierA.Id,
            TotalAmount = 25000m
        };

        var supplierB = new Supplier
        {
            Id = Guid.NewGuid(),
            TenantId = tenantB,
            Name = "Supplier B",
            BusinessPermitNo = "BP-B",
            Email = "b@test.ph",
            TINNumber = "TIN-B"
        };
        var poB = new PurchaseOrder
        {
            Id = Guid.NewGuid(),
            TenantId = tenantB,
            PONumber = "PO-JOIN-B",
            SupplierId = supplierB.Id,
            TotalAmount = 35000m
        };

        dbA.Suppliers!.Add(supplierA);
        dbA.PurchaseOrders!.Add(poA);
        dbB.Suppliers!.Add(supplierB);
        dbB.PurchaseOrders!.Add(poB);
        await dbA.SaveChangesAsync();
        await dbB.SaveChangesAsync();

        // Act - Explicit LINQ join in Tenant A
        var joinedQueryA = await (
            from po in dbA.PurchaseOrders!
            join s in dbA.Suppliers! on po.SupplierId equals s.Id
            select new
            {
                po.PONumber,
                SupplierName = s.Name,
                po.TotalAmount
            }
        ).ToListAsync();

        // Assert - Only Tenant A matched pair is returned
        joinedQueryA.Should().ContainSingle();
        joinedQueryA[0].PONumber.Should().Be("PO-JOIN-A");
        joinedQueryA[0].SupplierName.Should().Be("Supplier A");
    }

    [Fact]
    public async Task CrossTenantForeignLinkAttempt_NavigationResolvesToNullUnderQueryFilter()
    {
        // Arrange
        var (dbA, dbB, _) = CreateDbContexts();

        // Tenant B creates a valid supplier
        var supplierB = new Supplier
        {
            Id = Guid.NewGuid(),
            TenantId = tenantB,
            Name = "Confidential Vendor B",
            BusinessPermitNo = "BP-B-SECRET",
            Email = "secret@vendor-b.com",
            TINNumber = "TIN-B-SECRET"
        };
        dbB.Suppliers!.Add(supplierB);
        await dbB.SaveChangesAsync();

        // Tenant A creates a PO that maliciously references Tenant B's SupplierId
        var poA = new PurchaseOrder
        {
            Id = Guid.NewGuid(),
            TenantId = tenantA,
            PONumber = "PO-INTRUSION-ATTEMPT",
            SupplierId = supplierB.Id, // Malicious reference to Tenant B's entity
            TotalAmount = 50000m
        };
        dbA.PurchaseOrders!.Add(poA);
        await dbA.SaveChangesAsync();

        // Act & Assert 1: Querying PO directly without include succeeds (PO belongs to Tenant A)
        var poDirect = await dbA.PurchaseOrders!.FirstOrDefaultAsync(po => po.Id == poA.Id);
        poDirect.Should().NotBeNull();
        poDirect!.PONumber.Should().Be("PO-INTRUSION-ATTEMPT");

        // Act & Assert 2: Querying with Include of cross-tenant Supplier
        // Because SupplierId is a required FK with an inner join under Global Query Filter (s.TenantId == tenantA),
        // Tenant B's supplier is filtered out, which prevents loading Tenant B's vendor data.
        var resultWithInclude = await dbA.PurchaseOrders!
            .Include(po => po.Supplier)
            .FirstOrDefaultAsync(po => po.Id == poA.Id);

        if (resultWithInclude != null)
        {
            resultWithInclude.Supplier.Should().BeNull("cross-tenant supplier must not be loaded");
        }
        else
        {
            // Inner join filtered out the entire row because the required FK belongs to another tenant
            resultWithInclude.Should().BeNull("required FK belonging to another tenant fails cross-tenant join");
        }
    }

    [Fact]
    public async Task ComplexProcurementAggregation_GroupAndSum_EvaluatesStrictlyWithinTenantBoundary()
    {
        // Arrange
        var (dbA, dbB, _) = CreateDbContexts();

        // Tenant A POs
        dbA.PurchaseOrders!.AddRange(
            new PurchaseOrder { Id = Guid.NewGuid(), TenantId = tenantA, PONumber = "A-1", Status = StatusEnum.Approved, TotalAmount = 10000m },
            new PurchaseOrder { Id = Guid.NewGuid(), TenantId = tenantA, PONumber = "A-2", Status = StatusEnum.Approved, TotalAmount = 20000m },
            new PurchaseOrder { Id = Guid.NewGuid(), TenantId = tenantA, PONumber = "A-3", Status = StatusEnum.Draft, TotalAmount = 5000m }
        );

        // Tenant B POs
        dbB.PurchaseOrders!.AddRange(
            new PurchaseOrder { Id = Guid.NewGuid(), TenantId = tenantB, PONumber = "B-1", Status = StatusEnum.Approved, TotalAmount = 100000m },
            new PurchaseOrder { Id = Guid.NewGuid(), TenantId = tenantB, PONumber = "B-2", Status = StatusEnum.Draft, TotalAmount = 50000m }
        );

        await dbA.SaveChangesAsync();
        await dbB.SaveChangesAsync();

        // Act - Group and aggregate in Tenant A
        var summaryA = await dbA.PurchaseOrders!
            .GroupBy(po => po.Status)
            .Select(g => new
            {
                Status = g.Key,
                Count = g.Count(),
                TotalSum = g.Sum(po => po.TotalAmount)
            })
            .ToListAsync();

        // Assert - Only Tenant A metrics are aggregated
        var approvedA = summaryA.First(s => s.Status == StatusEnum.Approved);
        approvedA.Count.Should().Be(2);
        approvedA.TotalSum.Should().Be(30000m); // 10k + 20k (Tenant B's 100k must NOT be included)

        var draftA = summaryA.First(s => s.Status == StatusEnum.Draft);
        draftA.Count.Should().Be(1);
        draftA.TotalSum.Should().Be(5000m); // Tenant B's 50k must NOT be included
    }

    [Fact]
    public async Task UnresolvedTenantContext_FailsClosedAcrossAllJoins()
    {
        // Arrange
        var (dbA, _, dbUnresolved) = CreateDbContexts();

        var supplier = new Supplier
        {
            Id = Guid.NewGuid(),
            TenantId = tenantA,
            Name = "Supplier A",
            BusinessPermitNo = "BP-A",
            Email = "a@test.ph",
            TINNumber = "TIN-A"
        };
        var po = new PurchaseOrder
        {
            Id = Guid.NewGuid(),
            TenantId = tenantA,
            PONumber = "PO-FAIL-CLOSED",
            SupplierId = supplier.Id,
            TotalAmount = 10000m
        };

        dbA.Suppliers!.Add(supplier);
        dbA.PurchaseOrders!.Add(po);
        await dbA.SaveChangesAsync();

        // Act & Assert - Unresolved context querying joins returns empty
        var results = await dbUnresolved.PurchaseOrders!
            .Include(p => p.Supplier)
            .ToListAsync();

        results.Should().BeEmpty("unresolved tenant context must fail closed and yield zero records");
    }
}
