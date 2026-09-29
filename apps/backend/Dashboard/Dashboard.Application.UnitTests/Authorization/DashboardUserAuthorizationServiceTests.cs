using ERPEZ.Domain.Entities.AMS;
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Infrastructure.Persistence;
using ERPEZ.Infrastructure.Services;
using ERPEZ.Shared.Constants;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Xunit;

namespace Dashboard.Application.UnitTests.Authorization;

public class DashboardUserAuthorizationServiceTests
{
    private static ApplicationDbContext CreateDbContext()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        return new ApplicationDbContext(options);
    }

    [Fact]
    public async Task GetPermissionsAsync_WhenUserHasRoleAssigned_ReturnsAllRolePermissions()
    {
        // Arrange
        using var dbContext = CreateDbContext();
        var memoryCache = new MemoryCache(new MemoryCacheOptions());
        var service = new DashboardUserAuthorizationService(dbContext, memoryCache);

        var user = new User
        {
            Id = Guid.NewGuid(),
            ExternalIdentityId = "kc-user-001",
            Username = "planner_test",
            Email = "planner@test.com",
            IsActive = true
        };
        await dbContext.Users!.AddAsync(user);

        var role = new AmsRole
        {
            Id = Guid.NewGuid(),
            Name = "Custom Planning Role",
            IsActive = true
        };
        await dbContext.AmsRoles!.AddAsync(role);

        await dbContext.AmsRolePermissions!.AddRangeAsync(
            new AmsRolePermission { Id = Guid.NewGuid(), RoleId = role.Id, PermissionKey = Permissions.Planning.wfpCreate },
            new AmsRolePermission { Id = Guid.NewGuid(), RoleId = role.Id, PermissionKey = Permissions.Planning.wfpView }
        );

        await dbContext.UserRoleAssignments!.AddAsync(new UserRoleAssignment
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            RoleId = role.Id
        });

        await dbContext.SaveChangesAsync();

        // Act
        var permissions = await service.GetPermissionsAsync("kc-user-001", null);

        // Assert
        permissions.Should().Contain(Permissions.Planning.wfpCreate);
        permissions.Should().Contain(Permissions.Planning.wfpView);
        permissions.Should().NotContain(Permissions.Procurement.prCreate);
    }

    [Fact]
    public async Task GetPermissionsAsync_WhenExternalIdentityIdIsNull_FailsClosedWithEmptySet()
    {
        // Arrange
        using var dbContext = CreateDbContext();
        var memoryCache = new MemoryCache(new MemoryCacheOptions());
        var service = new DashboardUserAuthorizationService(dbContext, memoryCache);

        // Act
        var permissions = await service.GetPermissionsAsync(string.Empty, null);

        // Assert
        permissions.Should().BeEmpty();
    }

    [Fact]
    public async Task GetPermissionsAsync_CachesPermissions_AndInvalidateEvictsCache()
    {
        // Arrange
        using var dbContext = CreateDbContext();
        var memoryCache = new MemoryCache(new MemoryCacheOptions());
        var service = new DashboardUserAuthorizationService(dbContext, memoryCache);

        var user = new User
        {
            Id = Guid.NewGuid(),
            ExternalIdentityId = "kc-user-cache",
            Username = "cache_test",
            Email = "cache@test.com",
            IsActive = true
        };
        await dbContext.Users!.AddAsync(user);

        var role = new AmsRole
        {
            Id = Guid.NewGuid(),
            Name = "Buyer Role",
            IsActive = true
        };
        await dbContext.AmsRoles!.AddAsync(role);

        await dbContext.AmsRolePermissions!.AddAsync(
            new AmsRolePermission { Id = Guid.NewGuid(), RoleId = role.Id, PermissionKey = Permissions.Procurement.prCreate }
        );

        await dbContext.UserRoleAssignments!.AddAsync(new UserRoleAssignment
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            RoleId = role.Id
        });

        await dbContext.SaveChangesAsync();

        // First call caches result
        var perms1 = await service.GetPermissionsAsync("kc-user-cache", null);
        perms1.Should().Contain(Permissions.Procurement.prCreate);

        // Add permission directly in DB
        await dbContext.AmsRolePermissions!.AddAsync(
            new AmsRolePermission { Id = Guid.NewGuid(), RoleId = role.Id, PermissionKey = Permissions.Procurement.poManage }
        );
        await dbContext.SaveChangesAsync();

        // Second call without invalidation should still return cached perms (no poManage)
        var permsCached = await service.GetPermissionsAsync("kc-user-cache", null);
        permsCached.Should().NotContain(Permissions.Procurement.poManage);

        // Invalidate cache
        service.InvalidateUserPermissions("kc-user-cache", null);

        // Third call after invalidation should fetch updated perms
        var permsUpdated = await service.GetPermissionsAsync("kc-user-cache", null);
        permsUpdated.Should().Contain(Permissions.Procurement.poManage);
    }

    [Fact]
    public async Task HasPermissionAsync_ReturnsCorrectBoolean()
    {
        // Arrange
        using var dbContext = CreateDbContext();
        var memoryCache = new MemoryCache(new MemoryCacheOptions());
        var service = new DashboardUserAuthorizationService(dbContext, memoryCache);

        var user = new User
        {
            Id = Guid.NewGuid(),
            ExternalIdentityId = "kc-user-check",
            Username = "check_test",
            Email = "check@test.com",
            IsActive = true
        };
        await dbContext.Users!.AddAsync(user);

        var role = new AmsRole
        {
            Id = Guid.NewGuid(),
            Name = "Approver Role",
            IsActive = true
        };
        await dbContext.AmsRoles!.AddAsync(role);

        await dbContext.AmsRolePermissions!.AddAsync(
            new AmsRolePermission { Id = Guid.NewGuid(), RoleId = role.Id, PermissionKey = Permissions.Planning.wfpApprove }
        );

        await dbContext.UserRoleAssignments!.AddAsync(new UserRoleAssignment
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            RoleId = role.Id
        });

        await dbContext.SaveChangesAsync();

        // Act & Assert
        var hasApprove = await service.HasPermissionAsync("kc-user-check", null, Permissions.Planning.wfpApprove);
        var hasDelete = await service.HasPermissionAsync("kc-user-check", null, Permissions.Planning.wfpDelete);

        hasApprove.Should().BeTrue();
        hasDelete.Should().BeFalse();
    }
}
