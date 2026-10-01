using ERPEZ.Shared.Constants;
using ERPEZ.Shared.Exceptions;
using ERPEZ.Shared.Interfaces;
using ERPEZ.TenantManagement.Domain.Constants;
using ERPEZ.TenantManagement.Domain.Entities;
using ERPEZ.TenantManagement.Domain.Enums;
using ERPEZ.TenantManagement.Domain.Interfaces;
using ERPEZ.TenantManagement.Infrastructure.Persistence;
using ERPEZ.TenantManagement.Infrastructure.Services;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;

namespace TenantManagement.Application.UnitTests.Security;

public class RoleScopeEnforcementTests : IDisposable
{
    private readonly Guid tenantId = Guid.NewGuid();
    private readonly string actorId = "user_actor_123";
    private readonly ApplicationDbContext dbContext;
    private readonly Mock<IUserAuthorizationService> authServiceMock = new();

    public RoleScopeEnforcementTests()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        dbContext = new ApplicationDbContext(options);
    }

    public void Dispose()
    {
        dbContext.Database.EnsureDeleted();
        dbContext.Dispose();
    }

    [Fact]
    public async Task ValidateRoleAssignments_WhenRoleIsPlatform_AndExpectedScopeIsTenant_ThrowsForbiddenException()
    {
        // Arrange: Platform role (e.g. Platform Administrator)
        var platformRole = new Role
        {
            Id = Guid.NewGuid(),
            Name = "Platform Administrator",
            Scope = RoleScope.Platform,
            IsSystemRole = true,
            IsAssignableToTenant = true
        };

        dbContext.Roles!.Add(platformRole);
        await dbContext.SaveChangesAsync();

        authServiceMock.Setup(a => a.GetPermissionsAsync(actorId, tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new HashSet<string>(StringComparer.OrdinalIgnoreCase) { TenantPermissions.membersManage });

        var validator = new RoleAssignmentValidator(dbContext, authServiceMock.Object);

        // Act & Assert: Attempting to assign platform role via tenant endpoint must fail closed
        var act = () => validator.ValidateRoleAssignmentsAsync(
            tenantId,
            actorId,
            targetMemberId: null,
            [platformRole.Id],
            expectedScope: RoleScope.Tenant);

        await act.Should().ThrowAsync<ForbiddenException>()
            .WithMessage("*Domain isolation violation: Cannot assign role 'Platform Administrator' (Scope: Platform) via an endpoint expecting Scope: Tenant*");
    }

    [Fact]
    public async Task ValidateRoleAssignments_WhenRoleIsTenant_AndExpectedScopeIsPlatform_ThrowsForbiddenException()
    {
        // Arrange: Tenant role (e.g. Tenant Administrator)
        var tenantRole = new Role
        {
            Id = Guid.NewGuid(),
            Name = "Tenant Administrator",
            Scope = RoleScope.Tenant,
            IsSystemRole = true,
            IsAssignableToTenant = true
        };

        dbContext.Roles!.Add(tenantRole);
        await dbContext.SaveChangesAsync();

        authServiceMock.Setup(a => a.GetPermissionsAsync(actorId, tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new HashSet<string>(StringComparer.OrdinalIgnoreCase) { PlatformPermissions.usersManage });

        var validator = new RoleAssignmentValidator(dbContext, authServiceMock.Object);

        // Act & Assert: Attempting to assign tenant role in platform context must fail closed
        var act = () => validator.ValidateRoleAssignmentsAsync(
            tenantId,
            actorId,
            targetMemberId: null,
            [tenantRole.Id],
            expectedScope: RoleScope.Platform);

        await act.Should().ThrowAsync<ForbiddenException>()
            .WithMessage("*Domain isolation violation: Cannot assign role 'Tenant Administrator' (Scope: Tenant) via an endpoint expecting Scope: Platform*");
    }

    [Fact]
    public async Task ValidateRoleAssignments_WhenRoleHasUnknownScope_FailsClosed()
    {
        // Arrange: Role with Scope = Unknown
        var unknownRole = new Role
        {
            Id = Guid.NewGuid(),
            Name = "Legacy Custom Role",
            Scope = RoleScope.Unknown,
            IsSystemRole = false,
            TenantId = tenantId,
            IsAssignableToTenant = true
        };

        dbContext.Roles!.Add(unknownRole);
        await dbContext.SaveChangesAsync();

        authServiceMock.Setup(a => a.GetPermissionsAsync(actorId, tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new HashSet<string>(StringComparer.OrdinalIgnoreCase) { TenantPermissions.membersManage });

        var validator = new RoleAssignmentValidator(dbContext, authServiceMock.Object);

        // Act & Assert
        var act = () => validator.ValidateRoleAssignmentsAsync(
            tenantId,
            actorId,
            targetMemberId: null,
            [unknownRole.Id],
            expectedScope: RoleScope.Tenant);

        await act.Should().ThrowAsync<ForbiddenException>()
            .WithMessage("*Domain isolation violation: Cannot assign role 'Legacy Custom Role' (Scope: Unknown) via an endpoint expecting Scope: Tenant*");
    }

    [Fact]
    public async Task ValidateRoleAssignments_WhenActorLacksMembersManagePermission_ThrowsForbiddenException()
    {
        // Arrange
        var tenantRole = new Role
        {
            Id = Guid.NewGuid(),
            Name = "Billing Administrator",
            Scope = RoleScope.Tenant,
            IsSystemRole = true,
            IsAssignableToTenant = true
        };

        dbContext.Roles!.Add(tenantRole);
        await dbContext.SaveChangesAsync();

        // Actor does NOT have membersManage
        authServiceMock.Setup(a => a.GetPermissionsAsync(actorId, tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new HashSet<string>(StringComparer.OrdinalIgnoreCase));

        var validator = new RoleAssignmentValidator(dbContext, authServiceMock.Object);

        // Act & Assert
        var act = () => validator.ValidateRoleAssignmentsAsync(
            tenantId,
            actorId,
            targetMemberId: null,
            [tenantRole.Id],
            expectedScope: RoleScope.Tenant);

        await act.Should().ThrowAsync<ForbiddenException>()
            .WithMessage("*You do not have permission to manage tenant members and roles*");
    }

    [Fact]
    public async Task GetAssignableRolesQuery_WhenFilteredByTenant_ExcludesPlatformRoles()
    {
        // Arrange
        var tenantRole = new Role
        {
            Id = Guid.NewGuid(),
            Name = "Tenant Administrator",
            Scope = RoleScope.Tenant,
            IsSystemRole = true,
            IsAssignableToTenant = true
        };
        var platformRole = new Role
        {
            Id = Guid.NewGuid(),
            Name = "Platform Administrator",
            Scope = RoleScope.Platform,
            IsSystemRole = true,
            IsAssignableToTenant = false
        };

        dbContext.Roles!.AddRange(tenantRole, platformRole);
        await dbContext.SaveChangesAsync();

        var unitOfWorkMock = new Mock<IUnitOfWork>();
        var roleRepoMock = new Mock<IRoleRepository>();
        roleRepoMock.Setup(r => r.Query()).Returns(dbContext.Roles!);
        unitOfWorkMock.Setup(u => u.RoleRepository).Returns(roleRepoMock.Object);

        var tenantContextMock = new Mock<ITenantContextService>();
        tenantContextMock.Setup(t => t.TenantId).Returns(tenantId);

        var handler = new ERPEZ.TenantManagement.Application.Features.Roles.Queries.GetAssignableRolesQuery.GetAssignableRolesQueryHandler(
            unitOfWorkMock.Object,
            tenantContextMock.Object);

        // Act
        var result = await handler.Handle(
            new ERPEZ.TenantManagement.Application.Features.Roles.Queries.GetAssignableRolesQuery.GetAssignableRolesQuery(RoleScope.Tenant),
            CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        result.Data.Should().ContainSingle(r => r.Name == "Tenant Administrator");
        result.Data.Should().NotContain(r => r.Name == "Platform Administrator");
    }

    [Theory]
    [InlineData("TenantManagement", RoleScope.Tenant)]
    [InlineData("Operational", RoleScope.Tenant)]
    [InlineData("Tenant", RoleScope.Tenant)]
    [InlineData("Platform", RoleScope.Platform)]
    [InlineData("ExternalPortal", RoleScope.Unknown)]
    [InlineData("Unknown", RoleScope.Unknown)]
    [InlineData("NonExistentScope", RoleScope.Unknown)]
    public void RoleScopeConverter_ConvertsLegacyAndCurrentScopes_Correctly(string rawDbValue, RoleScope expectedScope)
    {
        // Arrange
        var roleProperty = dbContext.Model.FindEntityType(typeof(Role))?.FindProperty(nameof(Role.Scope));
        var converter = roleProperty?.GetValueConverter();

        // Assert
        converter.Should().NotBeNull();
        var convertedFromDb = converter!.ConvertFromProvider(rawDbValue);
        convertedFromDb.Should().Be(expectedScope);
    }

    [Fact]
    public void RoleScopeConverter_ConvertsEnumToString_ForPersistence()
    {
        // Arrange
        var roleProperty = dbContext.Model.FindEntityType(typeof(Role))?.FindProperty(nameof(Role.Scope));
        var converter = roleProperty?.GetValueConverter();

        // Assert
        converter.Should().NotBeNull();
        converter!.ConvertToProvider(RoleScope.Tenant).Should().Be("Tenant");
        converter.ConvertToProvider(RoleScope.Platform).Should().Be("Platform");
        converter.ConvertToProvider(RoleScope.Unknown).Should().Be("Unknown");
    }
}
