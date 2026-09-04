using System.Security.Claims;
using ERPEZ.Shared.Authorization;
using ERPEZ.Shared.Constants;
using ERPEZ.Shared.Interfaces;
using FluentAssertions;
using Microsoft.AspNetCore.Authorization;
using Moq;
using Xunit;

namespace Dashboard.Application.UnitTests.Authorization;

public class PermissionAuthorizationHandlerTests
{
    private readonly Mock<IUserAuthorizationService> authServiceMock;
    private readonly Mock<ITenantContextService> tenantContextMock;
    private readonly PermissionAuthorizationHandler handler;

    public PermissionAuthorizationHandlerTests()
    {
        authServiceMock = new Mock<IUserAuthorizationService>();
        tenantContextMock = new Mock<ITenantContextService>();
        handler = new PermissionAuthorizationHandler(authServiceMock.Object, tenantContextMock.Object);
    }

    [Fact]
    public async Task HandleAsync_WhenAnonymousUser_ShouldFailClosed()
    {
        // Arrange
        var requirement = new PermissionRequirement(Permissions.Planning.libCreate);
        var principal = new ClaimsPrincipal(new ClaimsIdentity()); // Not authenticated, no sub
        var context = new AuthorizationHandlerContext([requirement], principal, null);

        // Act
        await handler.HandleAsync(context);

        // Assert
        context.HasSucceeded.Should().BeFalse();
    }

    [Fact]
    public async Task HandleAsync_WhenTenantNotResolved_ShouldFailClosed()
    {
        // Arrange
        var requirement = new PermissionRequirement(Permissions.Planning.libCreate);
        var claims = new[] { new Claim("sub", "user-123") };
        var principal = new ClaimsPrincipal(new ClaimsIdentity(claims, "TestAuth"));
        tenantContextMock.Setup(t => t.TenantId).Returns((Guid?)null);

        var context = new AuthorizationHandlerContext([requirement], principal, null);

        // Act
        await handler.HandleAsync(context);

        // Assert
        context.HasSucceeded.Should().BeFalse();
    }

    [Fact]
    public async Task HandleAsync_WhenUserHasPermission_ShouldSucceed()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var requirement = new PermissionRequirement(Permissions.Planning.libCreate);
        var claims = new[] { new Claim("sub", "user-123") };
        var principal = new ClaimsPrincipal(new ClaimsIdentity(claims, "TestAuth"));

        tenantContextMock.Setup(t => t.TenantId).Returns(tenantId);
        authServiceMock.Setup(a => a.HasPermissionAsync("user-123", tenantId, Permissions.Planning.libCreate, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        var context = new AuthorizationHandlerContext([requirement], principal, null);

        // Act
        await handler.HandleAsync(context);

        // Assert
        context.HasSucceeded.Should().BeTrue();
    }

    [Fact]
    public async Task HandleAsync_WhenUserLacksPermission_ShouldFailClosed()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var requirement = new PermissionRequirement(Permissions.Planning.libCreate);
        var claims = new[] { new Claim("sub", "user-123") };
        var principal = new ClaimsPrincipal(new ClaimsIdentity(claims, "TestAuth"));

        tenantContextMock.Setup(t => t.TenantId).Returns(tenantId);
        authServiceMock.Setup(a => a.HasPermissionAsync("user-123", tenantId, Permissions.Planning.libCreate, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        var context = new AuthorizationHandlerContext([requirement], principal, null);

        // Act
        await handler.HandleAsync(context);

        // Assert
        context.HasSucceeded.Should().BeFalse();
    }

    [Fact]
    public async Task HandleAsync_WhenSuperAdmin_ShouldBypassAndSucceed()
    {
        // Arrange
        var requirement = new PermissionRequirement(Permissions.Planning.libCreate);
        var claims = new[]
        {
            new Claim("sub", "superadmin-123"),
            new Claim("is_super_admin", "true")
        };
        var principal = new ClaimsPrincipal(new ClaimsIdentity(claims, "TestAuth"));
        var context = new AuthorizationHandlerContext([requirement], principal, null);

        // Act
        await handler.HandleAsync(context);

        // Assert
        context.HasSucceeded.Should().BeTrue();
    }
}
