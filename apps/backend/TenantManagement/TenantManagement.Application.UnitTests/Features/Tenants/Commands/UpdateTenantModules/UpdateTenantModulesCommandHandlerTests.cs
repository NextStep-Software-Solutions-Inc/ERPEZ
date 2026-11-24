using System.Linq.Expressions;
using ERPEZ.TenantManagement.Application.Features.Tenants.Commands.UpdateTenantModules;
using ERPEZ.TenantManagement.Domain.Entities;
using ERPEZ.TenantManagement.Domain.Enums;
using ERPEZ.TenantManagement.Domain.Interfaces;
using ERPEZ.TenantManagement.Infrastructure.Persistence;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;

namespace ERPEZ.TenantManagement.Application.UnitTests.Features.Tenants.Commands.UpdateTenantModules;

public class UpdateTenantModulesCommandHandlerTests : IDisposable
{
    private readonly ApplicationDbContext dbContext;
    private readonly Mock<IUnitOfWork> unitOfWorkMock = new();
    private readonly Mock<ITenantRepository> tenantRepoMock = new();
    private readonly Mock<IModuleRepository> moduleRepoMock = new();
    private readonly Mock<ITenantSubscriptionRepository> subRepoMock = new();
    private readonly UpdateTenantModulesCommandHandler handler;

    public UpdateTenantModulesCommandHandlerTests()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        dbContext = new ApplicationDbContext(options);

        unitOfWorkMock.Setup(u => u.TenantRepository).Returns(tenantRepoMock.Object);
        unitOfWorkMock.Setup(u => u.ModuleRepository).Returns(moduleRepoMock.Object);
        unitOfWorkMock.Setup(u => u.TenantSubscriptionRepository).Returns(subRepoMock.Object);
        unitOfWorkMock.Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(1);

        tenantRepoMock.Setup(r => r.Query(It.IsAny<Expression<Func<Tenant, bool>>>(), It.IsAny<bool?>()))
            .Returns<Expression<Func<Tenant, bool>>?, bool?>((pred, _) => pred == null ? dbContext.Tenants! : dbContext.Tenants!.Where(pred));

        moduleRepoMock.Setup(r => r.Query(It.IsAny<Expression<Func<Module, bool>>>(), It.IsAny<bool?>()))
            .Returns<Expression<Func<Module, bool>>?, bool?>((pred, _) => pred == null ? dbContext.Modules! : dbContext.Modules!.Where(pred));

        handler = new UpdateTenantModulesCommandHandler(unitOfWorkMock.Object);
    }

    public void Dispose()
    {
        dbContext.Database.EnsureDeleted();
        dbContext.Dispose();
    }

    [Fact]
    public async Task Handle_WhenStarterPlan_RejectsPMS()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var tenant = new Tenant { Id = tenantId, Name = "Starter Corp" };
        dbContext.Tenants!.Add(tenant);
        await dbContext.SaveChangesAsync();

        var activeSub = new TenantSubscription
        {
            TenantId = tenantId,
            Plan = Plan.Starter,
            Status = Status.Active,
            EndDate = DateTime.UtcNow.AddDays(30)
        };

        subRepoMock.Setup(r => r.FindAsync(It.IsAny<Expression<Func<TenantSubscription, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(activeSub);

        var command = new UpdateTenantModulesCommand
        {
            TenantId = tenantId,
            ModuleKeys = ["ams", "pms"]
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeFalse();
        result.Message.Should().Contain("pms");
        result.Message.Should().Contain("not included in your organization's active Starter plan");
    }

    [Fact]
    public async Task Handle_WhenStarterPlan_AllowsPBMS()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var tenant = new Tenant { Id = tenantId, Name = "Starter Corp" };
        dbContext.Tenants!.Add(tenant);

        var modAms = new Module { Id = Guid.NewGuid(), Key = "ams", Name = "Account Management", IsActive = true };
        var modPbms = new Module { Id = Guid.NewGuid(), Key = "pbms", Name = "Planning & Budget", IsActive = true };
        dbContext.Modules!.AddRange(modAms, modPbms);
        await dbContext.SaveChangesAsync();

        var activeSub = new TenantSubscription
        {
            TenantId = tenantId,
            Plan = Plan.Starter,
            Status = Status.Active,
            EndDate = DateTime.UtcNow.AddDays(30)
        };

        subRepoMock.Setup(r => r.FindAsync(It.IsAny<Expression<Func<TenantSubscription, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(activeSub);

        var command = new UpdateTenantModulesCommand
        {
            TenantId = tenantId,
            ModuleKeys = ["ams", "pbms"]
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_WhenBusinessPlan_AllowsPMS()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var tenant = new Tenant { Id = tenantId, Name = "Business Corp" };
        dbContext.Tenants!.Add(tenant);

        var modAms = new Module { Id = Guid.NewGuid(), Key = "ams", Name = "Account Management", IsActive = true };
        var modPbms = new Module { Id = Guid.NewGuid(), Key = "pbms", Name = "Planning & Budget", IsActive = true };
        var modPms = new Module { Id = Guid.NewGuid(), Key = "pms", Name = "Procurement Management", IsActive = true };
        dbContext.Modules!.AddRange(modAms, modPbms, modPms);
        await dbContext.SaveChangesAsync();

        var activeSub = new TenantSubscription
        {
            TenantId = tenantId,
            Plan = Plan.Professional,
            Status = Status.Active,
            EndDate = DateTime.UtcNow.AddDays(30)
        };

        subRepoMock.Setup(r => r.FindAsync(It.IsAny<Expression<Func<TenantSubscription, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(activeSub);

        var command = new UpdateTenantModulesCommand
        {
            TenantId = tenantId,
            ModuleKeys = ["ams", "pbms", "pms"]
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_WhenAttemptingToActivateSAMS_RejectsAcrossAllPlans()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var tenant = new Tenant { Id = tenantId, Name = "Enterprise Corp" };
        dbContext.Tenants!.Add(tenant);
        await dbContext.SaveChangesAsync();

        var activeSub = new TenantSubscription
        {
            TenantId = tenantId,
            Plan = Plan.Enterprise,
            Status = Status.Active,
            EndDate = DateTime.UtcNow.AddDays(30)
        };

        subRepoMock.Setup(r => r.FindAsync(It.IsAny<Expression<Func<TenantSubscription, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(activeSub);

        var command = new UpdateTenantModulesCommand
        {
            TenantId = tenantId,
            ModuleKeys = ["ams", "sams"]
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeFalse();
        result.Message.Should().Contain("sams");
    }
}
