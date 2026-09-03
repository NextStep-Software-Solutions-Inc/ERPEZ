using System.Security.Claims;
using ERPEZ.Shared.Authorization;
using ERPEZ.Shared.Constants;
using ERPEZ.Shared.Interfaces;
using FluentAssertions;
using Microsoft.AspNetCore.Authorization;
using Moq;
using Xunit;

namespace Dashboard.Application.UnitTests.Authorization;

public class SecuredEndpointsAuthorizationTests
{
    [Theory]
    // Procurement endpoints
    [InlineData("dev_procurement", Permissions.Procurement.prCreate, true)]
    [InlineData("dev_procurement", Permissions.Procurement.prManage, true)]
    [InlineData("dev_procurement", Permissions.Procurement.bacManage, true)]
    [InlineData("dev_procurement", Permissions.Procurement.aobManage, true)]
    [InlineData("dev_viewonly", Permissions.Procurement.prCreate, false)]
    [InlineData("dev_viewonly", Permissions.Procurement.bacManage, false)]
    [InlineData("dev_planner", Permissions.Procurement.bacManage, false)]
    // Finance / UACS endpoints
    [InlineData("dev_admin", Permissions.Finance.uacsView, true)]
    [InlineData("dev_admin", Permissions.Finance.uacsManage, true)]
    [InlineData("dev_procurement", Permissions.Finance.uacsManage, false)]
    // Admin & Org Structure endpoints
    [InlineData("dev_admin", Permissions.Admin.orgStructureManage, true)]
    [InlineData("dev_planner", Permissions.Admin.orgStructureManage, false)]
    [InlineData("dev_viewonly", Permissions.Admin.orgStructureManage, false)]
    public async Task PermissionAuthorizationHandler_ShouldEnforceSecuredEndpointsPersonaMatrix(
        string userId,
        string requiredPermission,
        bool shouldSucceed)
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var authServiceMock = new Mock<IUserAuthorizationService>();
        var tenantContextMock = new Mock<ITenantContextService>();
        tenantContextMock.Setup(t => t.TenantId).Returns(tenantId);

        var grantedPermissions = userId switch
        {
            "dev_procurement" => new HashSet<string>
            {
                Permissions.Procurement.prCreate,
                Permissions.Procurement.prManage,
                Permissions.Procurement.bacManage,
                Permissions.Procurement.aobManage,
                Permissions.Procurement.appManage,
                Permissions.Finance.uacsView,
            },
            "dev_planner" => new HashSet<string>
            {
                Permissions.Planning.budgetCallView,
                Permissions.Planning.budgetCallManage,
                Permissions.Planning.libCreate,
                Permissions.Planning.libUpdate,
                Permissions.Planning.libApprove,
                Permissions.Finance.uacsView,
            },
            "dev_admin" => new HashSet<string>
            {
                Permissions.Admin.orgStructureView,
                Permissions.Admin.orgStructureManage,
                Permissions.Admin.usersManage,
                Permissions.Finance.uacsView,
                Permissions.Finance.uacsManage,
            },
            "dev_viewonly" => new HashSet<string>
            {
                Permissions.Planning.budgetCallView,
                Permissions.Finance.uacsView,
            },
            _ => new HashSet<string>()
        };

        authServiceMock.Setup(a => a.HasPermissionAsync(userId, tenantId, requiredPermission, It.IsAny<CancellationToken>()))
            .ReturnsAsync(grantedPermissions.Contains(requiredPermission));

        var handler = new PermissionAuthorizationHandler(authServiceMock.Object, tenantContextMock.Object);
        var requirement = new PermissionRequirement(requiredPermission);
        var claims = new[] { new Claim(ClaimTypes.NameIdentifier, userId) };
        var principal = new ClaimsPrincipal(new ClaimsIdentity(claims, "TestAuth"));
        var context = new AuthorizationHandlerContext([requirement], principal, null);

        // Act
        await handler.HandleAsync(context);

        // Assert
        context.HasSucceeded.Should().Be(shouldSucceed);
    }
}
