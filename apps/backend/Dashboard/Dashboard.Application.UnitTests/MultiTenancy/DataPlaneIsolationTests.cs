using System.Security;
using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Enums;
using ERPEZ.Infrastructure.Persistence;
using ERPEZ.Shared.Interceptors;
using ERPEZ.Shared.Interfaces;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;

namespace Dashboard.Application.UnitTests.MultiTenancy;

public class DataPlaneIsolationTests
{
    private readonly Guid tenantA = Guid.NewGuid();
    private readonly Guid tenantB = Guid.NewGuid();

    private (ApplicationDbContext dbA, ApplicationDbContext dbB, ApplicationDbContext dbUnset) CreateSharedDbContexts()
    {
        var dbName = "DataPlaneIsolationDb_" + Guid.NewGuid();
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
        var dbUnset = new ApplicationDbContext(options, mockRequestCtxUnset.Object);

        return (dbA, dbB, dbUnset);
    }

    [Fact]
    public async Task GlobalQueryFilter_EvaluatedPerContext_StrictlyIsolatesBetweenTenantsOnSharedModel()
    {
        var (dbA, dbB, dbUnset) = CreateSharedDbContexts();

        var prA = new PurchaseRequest
        {
            Id = Guid.NewGuid(),
            PRNumber = "PR-TENANT-A-001",
            TenantId = tenantA,
            Purpose = "Tenant A Purchase",
            Status = StatusEnum.Draft
        };

        var prB = new PurchaseRequest
        {
            Id = Guid.NewGuid(),
            PRNumber = "PR-TENANT-B-001",
            TenantId = tenantB,
            Purpose = "Tenant B Purchase",
            Status = StatusEnum.Draft
        };

        dbA.PurchaseRequests!.Add(prA);
        dbB.PurchaseRequests!.Add(prB);
        await dbA.SaveChangesAsync();
        await dbB.SaveChangesAsync();

        // Context A should ONLY see Tenant A records
        var resultsA = await dbA.PurchaseRequests!.ToListAsync();
        resultsA.Should().ContainSingle();
        resultsA[0].PRNumber.Should().Be("PR-TENANT-A-001");
        resultsA[0].TenantId.Should().Be(tenantA);

        // Context B should ONLY see Tenant B records
        var resultsB = await dbB.PurchaseRequests!.ToListAsync();
        resultsB.Should().ContainSingle();
        resultsB[0].PRNumber.Should().Be("PR-TENANT-B-001");
        resultsB[0].TenantId.Should().Be(tenantB);

        // Context with unresolved tenant context must fail closed (0 records)
        var resultsUnset = await dbUnset.PurchaseRequests!.ToListAsync();
        resultsUnset.Should().BeEmpty();
    }

    [Fact]
    public async Task GlobalQueryFilter_IgnoreQueryFilters_ReturnsAllTenantsRecords()
    {
        var (dbA, _, _) = CreateSharedDbContexts();

        var prA = new PurchaseRequest
        {
            Id = Guid.NewGuid(),
            PRNumber = "PR-GLOBAL-A",
            TenantId = tenantA,
            Purpose = "Tenant A",
            Status = StatusEnum.Draft
        };

        var prB = new PurchaseRequest
        {
            Id = Guid.NewGuid(),
            PRNumber = "PR-GLOBAL-B",
            TenantId = tenantB,
            Purpose = "Tenant B",
            Status = StatusEnum.Draft
        };

        dbA.PurchaseRequests!.AddRange(prA, prB);
        await dbA.SaveChangesAsync();

        var allRecords = await dbA.PurchaseRequests!.IgnoreQueryFilters().ToListAsync();
        allRecords.Should().HaveCountGreaterOrEqualTo(2);
        allRecords.Select(r => r.PRNumber).Should().Contain(new[] { "PR-GLOBAL-A", "PR-GLOBAL-B" });
    }

    [Fact]
    public async Task GlobalReferenceEntities_AreNotTenantFiltered()
    {
        var (dbA, dbB, dbUnset) = CreateSharedDbContexts();

        var holiday = new PublicHoliday
        {
            Id = Guid.NewGuid(),
            Name = "National Heroes Day",
            Date = new DateOnly(2026, 8, 31),
            Type = "regular",
            Year = 2026
        };

        dbA.PublicHolidays!.Add(holiday);
        await dbA.SaveChangesAsync();

        // Visible to Tenant A, Tenant B, and unresolved context
        var holidaysA = await dbA.PublicHolidays!.ToListAsync();
        var holidaysB = await dbB.PublicHolidays!.ToListAsync();
        var holidaysUnset = await dbUnset.PublicHolidays!.ToListAsync();

        holidaysA.Should().ContainSingle(h => h.Name == "National Heroes Day");
        holidaysB.Should().ContainSingle(h => h.Name == "National Heroes Day");
        holidaysUnset.Should().ContainSingle(h => h.Name == "National Heroes Day");
    }

    [Fact]
    public async Task AuditingInterceptor_Added_UnconditionallyOverwritesTenantIdWithActiveTenant()
    {
        var mockCurrentUser = new Mock<ICurrentUserService>();
        mockCurrentUser.Setup(u => u.UserId).Returns("user-1");

        var mockRequestCtx = new Mock<ITenantRequestContext>();
        mockRequestCtx.Setup(c => c.IsResolved).Returns(true);
        mockRequestCtx.Setup(c => c.TenantId).Returns(tenantA);

        var interceptor = new AuditingInterceptor(mockCurrentUser.Object, mockRequestCtx.Object);

        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .AddInterceptors(interceptor)
            .Options;

        using var db = new ApplicationDbContext(options, mockRequestCtx.Object);

        // Caller attempts to spoof or set a different TenantId
        var pr = new PurchaseRequest
        {
            Id = Guid.NewGuid(),
            PRNumber = "PR-SPOOF-TEST",
            TenantId = Guid.NewGuid(), // Spoofed TenantId
            Purpose = "Spoof Test",
            Status = StatusEnum.Draft
        };

        db.PurchaseRequests!.Add(pr);
        await db.SaveChangesAsync();

        // Verified: TenantId was unconditionally overwritten with tenantA
        pr.TenantId.Should().Be(tenantA);
    }

    [Fact]
    public async Task AuditingInterceptor_Added_WhenNoTenantContextAndTenantIdEmpty_ThrowsSecurityException()
    {
        var mockCurrentUser = new Mock<ICurrentUserService>();
        var mockRequestCtx = new Mock<ITenantRequestContext>();
        mockRequestCtx.Setup(c => c.IsResolved).Returns(false);
        mockRequestCtx.Setup(c => c.TenantId).Returns((Guid?)null);

        var interceptor = new AuditingInterceptor(mockCurrentUser.Object, mockRequestCtx.Object);

        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .AddInterceptors(interceptor)
            .Options;

        using var db = new ApplicationDbContext(options, mockRequestCtx.Object);

        var pr = new PurchaseRequest
        {
            Id = Guid.NewGuid(),
            PRNumber = "PR-FAIL-CLOSED",
            TenantId = Guid.Empty,
            Purpose = "Fail closed",
            Status = StatusEnum.Draft
        };

        db.PurchaseRequests!.Add(pr);

        var act = async () => await db.SaveChangesAsync();
        await act.Should().ThrowAsync<SecurityException>()
            .WithMessage("*without an established tenant context*");
    }

    [Fact]
    public async Task AuditingInterceptor_Modified_WhenTenantIdChanged_ThrowsSecurityException()
    {
        var mockCurrentUser = new Mock<ICurrentUserService>();
        var mockRequestCtx = new Mock<ITenantRequestContext>();
        mockRequestCtx.Setup(c => c.IsResolved).Returns(true);
        mockRequestCtx.Setup(c => c.TenantId).Returns(tenantA);

        var interceptor = new AuditingInterceptor(mockCurrentUser.Object, mockRequestCtx.Object);

        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .AddInterceptors(interceptor)
            .Options;

        using var db = new ApplicationDbContext(options, mockRequestCtx.Object);

        var pr = new PurchaseRequest
        {
            Id = Guid.NewGuid(),
            PRNumber = "PR-IMMUTABLE-TEST",
            TenantId = tenantA,
            Purpose = "Immutable test",
            Status = StatusEnum.Draft
        };

        db.PurchaseRequests!.Add(pr);
        await db.SaveChangesAsync();

        // Attempt to modify TenantId
        pr.TenantId = tenantB;

        var act = async () => await db.SaveChangesAsync();
        await act.Should().ThrowAsync<SecurityException>()
            .WithMessage("*immutable and cannot be modified*");
    }

    [Fact]
    public async Task AuditingInterceptor_Modified_WhenCrossTenantModificationAttempted_ThrowsSecurityException()
    {
        var mockCurrentUser = new Mock<ICurrentUserService>();
        var mockRequestCtxA = new Mock<ITenantRequestContext>();
        mockRequestCtxA.Setup(c => c.IsResolved).Returns(true);
        mockRequestCtxA.Setup(c => c.TenantId).Returns(tenantA);

        var interceptorA = new AuditingInterceptor(mockCurrentUser.Object, mockRequestCtxA.Object);

        var dbName = "CrossTenantModDb_" + Guid.NewGuid();
        var optionsA = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: dbName)
            .AddInterceptors(interceptorA)
            .Options;

        var prId = Guid.NewGuid();
        using (var dbA = new ApplicationDbContext(optionsA, mockRequestCtxA.Object))
        {
            var pr = new PurchaseRequest
            {
                Id = prId,
                PRNumber = "PR-TENANT-A-MOD",
                TenantId = tenantA,
                Purpose = "Original purpose",
                Status = StatusEnum.Draft
            };
            dbA.PurchaseRequests!.Add(pr);
            await dbA.SaveChangesAsync();
        }

        // Now Tenant B attempts to load and modify Tenant A's record via bypassed filters
        var mockRequestCtxB = new Mock<ITenantRequestContext>();
        mockRequestCtxB.Setup(c => c.IsResolved).Returns(true);
        mockRequestCtxB.Setup(c => c.TenantId).Returns(tenantB);

        var interceptorB = new AuditingInterceptor(mockCurrentUser.Object, mockRequestCtxB.Object);
        var optionsB = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: dbName)
            .AddInterceptors(interceptorB)
            .Options;

        using (var dbB = new ApplicationDbContext(optionsB, mockRequestCtxB.Object))
        {
            var targetPr = await dbB.PurchaseRequests!.IgnoreQueryFilters().FirstAsync(p => p.Id == prId);
            targetPr.Purpose = "Malicious update by Tenant B";

            var act = async () => await dbB.SaveChangesAsync();
            await act.Should().ThrowAsync<SecurityException>()
                .WithMessage("*Unauthorized cross-tenant modification attempt*");
        }
    }

    [Fact]
    public async Task AuditingInterceptor_Deleted_WhenCrossTenantDeletionAttempted_ThrowsSecurityException()
    {
        var mockCurrentUser = new Mock<ICurrentUserService>();
        var mockRequestCtxA = new Mock<ITenantRequestContext>();
        mockRequestCtxA.Setup(c => c.IsResolved).Returns(true);
        mockRequestCtxA.Setup(c => c.TenantId).Returns(tenantA);

        var interceptorA = new AuditingInterceptor(mockCurrentUser.Object, mockRequestCtxA.Object);

        var dbName = "CrossTenantDelDb_" + Guid.NewGuid();
        var optionsA = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: dbName)
            .AddInterceptors(interceptorA)
            .Options;

        var prId = Guid.NewGuid();
        using (var dbA = new ApplicationDbContext(optionsA, mockRequestCtxA.Object))
        {
            var pr = new PurchaseRequest
            {
                Id = prId,
                PRNumber = "PR-TENANT-A-DEL",
                TenantId = tenantA,
                Purpose = "To be deleted",
                Status = StatusEnum.Draft
            };
            dbA.PurchaseRequests!.Add(pr);
            await dbA.SaveChangesAsync();
        }

        // Now Tenant B attempts to delete Tenant A's record
        var mockRequestCtxB = new Mock<ITenantRequestContext>();
        mockRequestCtxB.Setup(c => c.IsResolved).Returns(true);
        mockRequestCtxB.Setup(c => c.TenantId).Returns(tenantB);

        var interceptorB = new AuditingInterceptor(mockCurrentUser.Object, mockRequestCtxB.Object);
        var optionsB = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: dbName)
            .AddInterceptors(interceptorB)
            .Options;

        using (var dbB = new ApplicationDbContext(optionsB, mockRequestCtxB.Object))
        {
            var targetPr = await dbB.PurchaseRequests!.IgnoreQueryFilters().FirstAsync(p => p.Id == prId);
            dbB.PurchaseRequests!.Remove(targetPr);

            var act = async () => await dbB.SaveChangesAsync();
            await act.Should().ThrowAsync<SecurityException>()
                .WithMessage("*Unauthorized cross-tenant deletion attempt*");
        }
    }
}
