using ERPEZ.Shared.Constants;
using ERPEZ.Shared.Exceptions;
using ERPEZ.Shared.Interfaces;
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
    public async Task ValidateRoleAssignments_WhenRoleIsOperational_AndExpectedScopeIsTenantManagement_ThrowsForbiddenException()
    {
        // Arrange: Operational role (e.g. LIB Approver)
        var operationalRole = new Role
        {
            Id = Guid.NewGuid(),
            Name = "LIB Approver",
            Scope = RoleScope.Operational,
            IsSystemRole = true,
            IsAssignableToTenant = true
        };

        dbContext.Roles!.Add(operationalRole);
        await dbContext.SaveChangesAsync();

        // Actor has admin.members.manage
        authServiceMock.Setup(a => a.GetPermissionsAsync(actorId, tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new HashSet<string>(StringComparer.OrdinalIgnoreCase) { Permissions.Admin.membersManage });

        var validator = new RoleAssignmentValidator(dbContext, authServiceMock.Object);

        // Act & Assert: Attempting to assign operational role in tenant management portal must fail closed with 403 Forbidden
        var act = () => validator.ValidateRoleAssignmentsAsync(
            tenantId,
            actorId,
            targetMemberId: null,
            [operationalRole.Id],
            expectedScope: RoleScope.TenantManagement);

        await act.Should().ThrowAsync<ForbiddenException>()
            .WithMessage("*Domain isolation violation: Cannot assign role 'LIB Approver' (Scope: Operational) via an endpoint expecting Scope: TenantManagement*");
    }

    [Fact]
    public async Task ValidateRoleAssignments_WhenRoleIsTenantManagement_AndExpectedScopeIsOperational_ThrowsForbiddenException()
    {
        // Arrange: TenantManagement role (e.g. Tenant Administrator)
        var governanceRole = new Role
        {
            Id = Guid.NewGuid(),
            Name = "Tenant Administrator",
            Scope = RoleScope.TenantManagement,
            IsSystemRole = true,
            IsAssignableToTenant = true
        };

        dbContext.Roles!.Add(governanceRole);
        await dbContext.SaveChangesAsync();

        // Actor has admin.operational_roles.manage
        authServiceMock.Setup(a => a.GetPermissionsAsync(actorId, tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new HashSet<string>(StringComparer.OrdinalIgnoreCase) { Permissions.Admin.operationalRolesManage });

        var validator = new RoleAssignmentValidator(dbContext, authServiceMock.Object);

        // Act & Assert: Attempting to assign governance role in operational workspace must fail closed with 403 Forbidden
        var act = () => validator.ValidateRoleAssignmentsAsync(
            tenantId,
            actorId,
            targetMemberId: null,
            [governanceRole.Id],
            expectedScope: RoleScope.Operational);

        await act.Should().ThrowAsync<ForbiddenException>()
            .WithMessage("*Domain isolation violation: Cannot assign role 'Tenant Administrator' (Scope: TenantManagement) via an endpoint expecting Scope: Operational*");
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
            .ReturnsAsync(new HashSet<string>(StringComparer.OrdinalIgnoreCase) { Permissions.Admin.membersManage });

        var validator = new RoleAssignmentValidator(dbContext, authServiceMock.Object);

        // Act & Assert
        var act = () => validator.ValidateRoleAssignmentsAsync(
            tenantId,
            actorId,
            targetMemberId: null,
            [unknownRole.Id],
            expectedScope: RoleScope.TenantManagement);

        await act.Should().ThrowAsync<ForbiddenException>()
            .WithMessage("*Domain isolation violation: Cannot assign role 'Legacy Custom Role' (Scope: Unknown) via an endpoint expecting Scope: TenantManagement*");
    }

    [Fact]
    public async Task ValidateRoleAssignments_WhenActorLacksOperationalManagePermission_ThrowsForbiddenException()
    {
        // Arrange
        var operationalRole = new Role
        {
            Id = Guid.NewGuid(),
            Name = "Planning Officer",
            Scope = RoleScope.Operational,
            IsSystemRole = true,
            IsAssignableToTenant = true
        };

        dbContext.Roles!.Add(operationalRole);
        await dbContext.SaveChangesAsync();

        // Actor does NOT have operationalRolesManage
        authServiceMock.Setup(a => a.GetPermissionsAsync(actorId, tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new HashSet<string>(StringComparer.OrdinalIgnoreCase));

        var validator = new RoleAssignmentValidator(dbContext, authServiceMock.Object);

        // Act & Assert
        var act = () => validator.ValidateRoleAssignmentsAsync(
            tenantId,
            actorId,
            targetMemberId: null,
            [operationalRole.Id],
            expectedScope: RoleScope.Operational);

        await act.Should().ThrowAsync<ForbiddenException>()
            .WithMessage("*You do not have permission to manage ERP operational roles*");
    }

    [Fact]
    public async Task ValidateRoleAssignments_WhenActorLacksMembersManagePermission_ThrowsForbiddenException()
    {
        // Arrange
        var governanceRole = new Role
        {
            Id = Guid.NewGuid(),
            Name = "Billing Administrator",
            Scope = RoleScope.TenantManagement,
            IsSystemRole = true,
            IsAssignableToTenant = true
        };

        dbContext.Roles!.Add(governanceRole);
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
            [governanceRole.Id],
            expectedScope: RoleScope.TenantManagement);

        await act.Should().ThrowAsync<ForbiddenException>()
            .WithMessage("*You do not have permission to manage tenant governance roles*");
    }

    [Fact]
    public async Task GetAssignableRolesQuery_WhenFilteredByTenantManagement_ExcludesOperationalAndExternalRoles()
    {
        // Arrange
        var governanceRole = new Role
        {
            Id = Guid.NewGuid(),
            Name = "Organization Admin",
            Scope = RoleScope.TenantManagement,
            IsSystemRole = true,
            IsAssignableToTenant = true
        };
        var operationalRole = new Role
        {
            Id = Guid.NewGuid(),
            Name = "LIB Approver",
            Scope = RoleScope.Operational,
            IsSystemRole = true,
            IsAssignableToTenant = true
        };
        var externalRole = new Role
        {
            Id = Guid.NewGuid(),
            Name = "Supplier",
            Scope = RoleScope.ExternalPortal,
            IsSystemRole = true,
            IsAssignableToTenant = true
        };

        dbContext.Roles!.AddRange(governanceRole, operationalRole, externalRole);
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
            new ERPEZ.TenantManagement.Application.Features.Roles.Queries.GetAssignableRolesQuery.GetAssignableRolesQuery(RoleScope.TenantManagement),
            CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        result.Data.Should().ContainSingle(r => r.Name == "Organization Admin");
        result.Data.Should().NotContain(r => r.Name == "LIB Approver");
        result.Data.Should().NotContain(r => r.Name == "Supplier");
    }

    [Fact]
    public async Task GetAssignableRolesQuery_WhenFilteredByOperational_ExcludesGovernanceAndExternalRoles()
    {
        // Arrange
        var governanceRole = new Role
        {
            Id = Guid.NewGuid(),
            Name = "Organization Admin 2",
            Scope = RoleScope.TenantManagement,
            IsSystemRole = true,
            IsAssignableToTenant = true
        };
        var operationalRole = new Role
        {
            Id = Guid.NewGuid(),
            Name = "Planning Officer 2",
            Scope = RoleScope.Operational,
            IsSystemRole = true,
            IsAssignableToTenant = true
        };

        dbContext.Roles!.AddRange(governanceRole, operationalRole);
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
            new ERPEZ.TenantManagement.Application.Features.Roles.Queries.GetAssignableRolesQuery.GetAssignableRolesQuery(RoleScope.Operational),
            CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        result.Data.Should().ContainSingle(r => r.Name == "Planning Officer 2");
        result.Data.Should().NotContain(r => r.Name == "Organization Admin 2");
    }
}
