using ERPEZ.Domain.Common;
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Infrastructure.Persistence;
using ERPEZ.Shared.Interfaces;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;

namespace Dashboard.Application.UnitTests.MultiTenancy;

public class TenantIndexStrategyAndVerificationTests
{
    private readonly ApplicationDbContext dbContext;

    public TenantIndexStrategyAndVerificationTests()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: "TenantIndexVerificationDb_" + Guid.NewGuid())
            .Options;

        var mockRequestCtx = new Mock<ITenantRequestContext>();
        mockRequestCtx.Setup(c => c.IsResolved).Returns(true);
        mockRequestCtx.Setup(c => c.TenantId).Returns(Guid.NewGuid());

        dbContext = new ApplicationDbContext(options, mockRequestCtx.Object);
    }

    [Fact]
    public void AllTenantScopedEntities_HaveCompositeTenantIdAndIdIndex()
    {
        var model = dbContext.Model;
        var tenantScopedEntityTypes = model.GetEntityTypes()
            .Where(e => typeof(TenantScopedEntity).IsAssignableFrom(e.ClrType) && e.BaseType == null)
            .ToList();

        tenantScopedEntityTypes.Should().NotBeEmpty("there should be tenant-scoped operational entities in the model");

        var missingIndexEntities = new List<string>();

        foreach (var entityType in tenantScopedEntityTypes)
        {
            var indexes = entityType.GetIndexes();
            var hasCompositeTenantIdId = indexes.Any(idx =>
            {
                var props = idx.Properties.Select(p => p.Name).ToList();
                return props.Count >= 2 && props[0] == "TenantId" && props[1] == "Id";
            });

            if (!hasCompositeTenantIdId)
            {
                missingIndexEntities.Add(entityType.ClrType.Name);
            }
        }

        missingIndexEntities.Should().BeEmpty(
            "every TenantScopedEntity must have a composite (TenantId, Id) index to prevent full table scans when global query filters are evaluated");
    }

    [Theory]
    [InlineData(typeof(Office), "TenantId", "Code")]
    [InlineData(typeof(FYActiveKPI), "TenantId", "Code")]
    [InlineData(typeof(KPI), "TenantId", "Code")]
    [InlineData(typeof(OPCR), "TenantId", "Code")]
    [InlineData(typeof(Cluster), "TenantId", "Code")]
    [InlineData(typeof(Position), "TenantId", "Code")]
    [InlineData(typeof(PurchaseOrder), "TenantId", "PONumber")]
    [InlineData(typeof(PurchaseRequest), "TenantId", "PRNumber")]
    [InlineData(typeof(ConsolidatedPR), "TenantId", "CPRNumber")]
    [InlineData(typeof(APP), "TenantId", "APPNumber")]
    [InlineData(typeof(APR), "TenantId", "APRNumber")]
    [InlineData(typeof(RFQ), "TenantId", "RFQNumber")]
    [InlineData(typeof(AOB), "TenantId", "AOBNumber")]
    [InlineData(typeof(BACResolution), "TenantId", "ResolutionNumber")]
    [InlineData(typeof(DirectAcquisition), "TenantId", "DANumber")]
    [InlineData(typeof(DocumentProfile), "TenantId", "Name")]
    [InlineData(typeof(LineItemBudget), "TenantId", "LIBNumber")]
    [InlineData(typeof(PPMP), "TenantId", "PPMPNumber")]
    [InlineData(typeof(RFQSupplier), "TenantId", "RFQId")]
    [InlineData(typeof(BiddingSubmission), "TenantId", "ProcurementProjectId")]
    [InlineData(typeof(BiddingEvaluation), "TenantId", "ProcurementProjectId")]
    [InlineData(typeof(BiddingAwardRecommendation), "TenantId", "ProcurementProjectId")]
    [InlineData(typeof(RatingScaleLevel), "TenantId", "RatingScaleTemplateId")]
    [InlineData(typeof(DUKPITargetAssignment), "TenantId", "DeliveryUnitId")]
    public void OperationalEntities_WithBusinessKeys_HaveCompositeTenantIndex(Type entityType, string key1, string key2)
    {
        var entity = dbContext.Model.FindEntityType(entityType);
        entity.Should().NotBeNull($"entity type {entityType.Name} should exist in model");

        var indexes = entity!.GetIndexes();
        var hasMatchingIndex = indexes.Any(idx =>
        {
            var props = idx.Properties.Select(p => p.Name).ToList();
            return props.Contains(key1) && props.Contains(key2);
        });

        hasMatchingIndex.Should().BeTrue($"entity {entityType.Name} must have a composite index containing ({key1}, {key2})");
    }

    [Fact]
    public void Supplier_HasCompositeTenantIndexes_ForEmailAndPhilGeps()
    {
        var entity = dbContext.Model.FindEntityType(typeof(Supplier));
        entity.Should().NotBeNull();

        var indexes = entity!.GetIndexes();
        
        var hasEmailIndex = indexes.Any(idx =>
        {
            var props = idx.Properties.Select(p => p.Name).ToList();
            return props.SequenceEqual(new[] { "TenantId", "Email" });
        });

        var hasPhilGepsIndex = indexes.Any(idx =>
        {
            var props = idx.Properties.Select(p => p.Name).ToList();
            return props.SequenceEqual(new[] { "TenantId", "PhilGEPSNumber" });
        });

        hasEmailIndex.Should().BeTrue("Supplier should have composite index (TenantId, Email)");
        hasPhilGepsIndex.Should().BeTrue("Supplier should have composite index (TenantId, PhilGEPSNumber)");
    }

    [Fact]
    public void AllTenantScopedEntities_HaveQueryFilterEnforcingTenantId()
    {
        var model = dbContext.Model;
        var tenantScopedEntityTypes = model.GetEntityTypes()
            .Where(e => typeof(TenantScopedEntity).IsAssignableFrom(e.ClrType) && e.BaseType == null)
            .ToList();

        var missingFilterEntities = new List<string>();

        foreach (var entityType in tenantScopedEntityTypes)
        {
            var filter = entityType.GetQueryFilter();
            if (filter == null || !filter.ToString().Contains("CurrentTenantId"))
            {
                missingFilterEntities.Add(entityType.ClrType.Name);
            }
        }

        missingFilterEntities.Should().BeEmpty(
            "every TenantScopedEntity across all domains must have a global query filter enforcing TenantId");
    }

    [Fact]
    public void AllUniqueIndexes_OnTenantScopedEntities_AreCompositeWithTenantId()
    {
        var model = dbContext.Model;
        var tenantScopedEntityTypes = model.GetEntityTypes()
            .Where(e => typeof(TenantScopedEntity).IsAssignableFrom(e.ClrType) && e.BaseType == null)
            .ToList();

        var nonCompositeUniqueIndexes = new List<string>();

        foreach (var entityType in tenantScopedEntityTypes)
        {
            var uniqueIndexes = entityType.GetIndexes().Where(i => i.IsUnique);
            foreach (var index in uniqueIndexes)
            {
                var props = index.Properties.Select(p => p.Name).ToList();
                if (!props.Contains("TenantId"))
                {
                    nonCompositeUniqueIndexes.Add($"{entityType.ClrType.Name}: [{string.Join(", ", props)}]");
                }
            }
        }

        nonCompositeUniqueIndexes.Should().BeEmpty(
            "any unique business key constraint on a TenantScopedEntity must be composite with TenantId to allow multi-tenant isolation");
    }
}

