using System.Security.Claims;
using ERPEZ.Shared.Authorization;
using ERPEZ.Shared.Constants;
using ERPEZ.Shared.Interfaces;
using FluentAssertions;
using Microsoft.AspNetCore.Authorization;
using Moq;
using Xunit;

namespace Dashboard.Application.UnitTests.Authorization;

public class BudgetCallAuthorizationTests
{
    [Theory]
    [InlineData("dev_planner", Permissions.Planning.budgetCallView, true)]
    [InlineData("dev_planner", Permissions.Planning.budgetCallManage, true)]
    [InlineData("dev_admin", Permissions.Planning.budgetCallView, true)]
    [InlineData("dev_admin", Permissions.Planning.budgetCallManage, true)]
    [InlineData("dev_viewonly", Permissions.Planning.budgetCallView, true)]
    [InlineData("dev_viewonly", Permissions.Planning.budgetCallManage, false)]
    [InlineData("dev_procurement", Permissions.Planning.budgetCallView, false)]
    [InlineData("dev_procurement", Permissions.Planning.budgetCallManage, false)]
    public async Task PermissionAuthorizationHandler_ShouldEnforceBudgetCallPersonaMatrix(string userId, string requiredPermission, bool shouldSucceed)
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var authServiceMock = new Mock<IUserAuthorizationService>();
        var tenantContextMock = new Mock<ITenantContextService>();
        tenantContextMock.Setup(t => t.TenantId).Returns(tenantId);

        var grantedPermissions = userId switch
        {
            "dev_planner" => new HashSet<string> { Permissions.Planning.budgetCallView, Permissions.Planning.budgetCallManage },
            "dev_admin" => new HashSet<string> { Permissions.Planning.budgetCallView, Permissions.Planning.budgetCallManage },
            "dev_viewonly" => new HashSet<string> { Permissions.Planning.budgetCallView },
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
