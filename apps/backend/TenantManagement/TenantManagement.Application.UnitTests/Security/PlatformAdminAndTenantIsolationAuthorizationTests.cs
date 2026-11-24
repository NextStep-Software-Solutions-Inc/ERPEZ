using System.Security.Claims;
using ERPEZ.Shared.Authorization;
using ERPEZ.Shared.Constants;
using ERPEZ.Shared.Interfaces;
using ERPEZ.Shared.Security;
using ERPEZ.TenantManagement.Domain.Constants;
using ERPEZ.TenantManagement.Domain.Entities;
using ERPEZ.TenantManagement.Domain.Enums;
using ERPEZ.TenantManagement.Infrastructure.Persistence;
using ERPEZ.TenantManagement.Infrastructure.Services;
using FluentAssertions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using Moq;
using Xunit;

namespace ERPEZ.TenantManagement.Application.UnitTests.Security;

/// <summary>
/// Unit tests for Platform Admin authorization, Clerk JWT publicMetadata normalization,
/// cross-tenant isolation, break-glass configuration fallback, and rejection of spoofed headers.
/// </summary>
public class PlatformAdminAndTenantIsolationAuthorizationTests : IDisposable
{
    private readonly ApplicationDbContext dbContext;
    private readonly IMemoryCache memoryCache;
    private readonly ClerkIdentityNormalizer clerkNormalizer;
    private readonly Mock<IUserAuthorizationService> authServiceMock;
    private readonly Mock<ITenantContextService> tenantContextMock;

    public PlatformAdminAndTenantIsolationAuthorizationTests()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        dbContext = new ApplicationDbContext(options);
        memoryCache = new MemoryCache(new MemoryCacheOptions());
        clerkNormalizer = new ClerkIdentityNormalizer();
        authServiceMock = new Mock<IUserAuthorizationService>();
        tenantContextMock = new Mock<ITenantContextService>();
    }

    public void Dispose()
    {
        dbContext.Database.EnsureDeleted();
        dbContext.Dispose();
        memoryCache.Dispose();
    }

    // =========================================================================
    // 1. Direct Verified Clerk JWT Claims & Authorization Tests
    // =========================================================================

    [Fact]
    public void ClerkNormalizer_ShouldExtractAndStampCoreIdentityClaims()
    {
        // Arrange: Verified Clerk JWT containing standard sub and org_id
        var principal = new ClaimsPrincipal(new ClaimsIdentity(
        [
            new Claim("sub", "user_clerk_admin_123"),
            new Claim("org_id", "org_clerk_alpha_001")
        ], "ClerkJwt"));

        // Act: Normalize and stamp core identity claims
        clerkNormalizer.NormalizeAndStamp(principal);

        // Assert: Cryptographically verified core claims stamped onto ClaimsPrincipal
        principal.FindFirstValue(CustomClaims.ExternalIdentityId).Should().Be("user_clerk_admin_123");
        principal.FindFirstValue(CustomClaims.ExternalOrganizationId).Should().Be("org_clerk_alpha_001");
        principal.FindFirstValue(CustomClaims.IdentityProvider).Should().Be("Clerk");
    }

    [Fact]
    public async Task PermissionHandler_WithDirectVerifiedSuperAdminClaim_ShouldSucceed()
    {
        // Arrange: Verified Clerk token with direct is_super_admin claim
        var handler = new PermissionAuthorizationHandler(authServiceMock.Object, tenantContextMock.Object);
        var requirement = new PermissionRequirement(PlatformPermissions.inquiriesView);
        var principal = new ClaimsPrincipal(new ClaimsIdentity(
        [
            new Claim("sub", "user_clerk_super_direct"),
            new Claim("is_super_admin", "true")
        ], "ClerkJwt"));

        var context = new AuthorizationHandlerContext([requirement], principal, null);

        // Act
        await handler.HandleAsync(context);

        // Assert: Direct verified claim grants platform access
        context.HasSucceeded.Should().BeTrue();
    }

    [Fact]
    public async Task PermissionHandler_TenantUserWithTenantRole_ShouldNotHavePlatformPrivileges()
    {
        // Arrange: Tenant user with Tenant Administrator role in their token
        var handler = new PermissionAuthorizationHandler(authServiceMock.Object, tenantContextMock.Object);
        var requirement = new PermissionRequirement(PlatformPermissions.inquiriesView);
        var principal = new ClaimsPrincipal(new ClaimsIdentity(
        [
            new Claim("sub", "user_tenant_admin_direct"),
            new Claim(ClaimTypes.Role, "Tenant Administrator")
        ], "ClerkJwt"));

        authServiceMock.Setup(a => a.HasPermissionAsync("user_tenant_admin_direct", It.IsAny<Guid?>(), PlatformPermissions.inquiriesView, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        var context = new AuthorizationHandlerContext([requirement], principal, null);

        // Act
        await handler.HandleAsync(context);

        // Assert: Tenant Administrator role does NOT confer platform permissions
        context.HasSucceeded.Should().BeFalse();
    }

    // =========================================================================
    // 2. Tenant User vs Platform Admin Authorization (Positive & Negative)
    // =========================================================================

    [Fact]
    public async Task PermissionHandler_PlatformAdminWithVerifiedClaim_ShouldSucceedForPlatformInquiries()
    {
        // Arrange: Verified Platform Admin with is_super_admin claim
        var handler = new PermissionAuthorizationHandler(authServiceMock.Object, tenantContextMock.Object);
        var requirement = new PermissionRequirement(PlatformPermissions.inquiriesView);
        var principal = new ClaimsPrincipal(new ClaimsIdentity(
        [
            new Claim("sub", "super_admin_user_01"),
            new Claim("is_super_admin", "true")
        ], "TestAuth"));
        var context = new AuthorizationHandlerContext([requirement], principal, null);

        // Act
        await handler.HandleAsync(context);

        // Assert: Platform admin succeeds without needing tenant context or tenant membership
        context.HasSucceeded.Should().BeTrue();
    }

    [Fact]
    public async Task PermissionHandler_PlatformAdminWithRoleClaim_ShouldSucceedForPlatformInquiries()
    {
        // Arrange: Verified Platform Admin with Role claim
        var handler = new PermissionAuthorizationHandler(authServiceMock.Object, tenantContextMock.Object);
        var requirement = new PermissionRequirement(PlatformPermissions.inquiriesManage);
        var principal = new ClaimsPrincipal(new ClaimsIdentity(
        [
            new Claim("sub", "super_admin_user_02"),
            new Claim(ClaimTypes.Role, "Platform Administrator")
        ], "TestAuth"));
        var context = new AuthorizationHandlerContext([requirement], principal, null);

        // Act
        await handler.HandleAsync(context);

        // Assert
        context.HasSucceeded.Should().BeTrue();
    }

    [Fact]
    public async Task PermissionHandler_TenantUser_ShouldFailClosedForPlatformInquiries()
    {
        // Arrange: Regular tenant user attempts to access platform-level inquiries
        var handler = new PermissionAuthorizationHandler(authServiceMock.Object, tenantContextMock.Object);
        var requirement = new PermissionRequirement(PlatformPermissions.inquiriesView);
        var principal = new ClaimsPrincipal(new ClaimsIdentity(
        [
            new Claim("sub", "tenant_user_01"),
            new Claim("email", "user@tenant-alpha.com")
        ], "TestAuth"));

        // User authorization service returns false for platform permissions
        authServiceMock.Setup(a => a.HasPermissionAsync("tenant_user_01", It.IsAny<Guid?>(), PlatformPermissions.inquiriesView, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        var context = new AuthorizationHandlerContext([requirement], principal, null);

        // Act
        await handler.HandleAsync(context);

        // Assert: Fail-closed; regular tenant user is strictly forbidden from accessing platform inquiries
        context.HasSucceeded.Should().BeFalse();
    }

    // =========================================================================
    // 3. Cross-Tenant Access Isolation Tests
    // =========================================================================

    [Fact]
    public async Task TenantIsolation_TenantUserCannotAccessDifferentTenantResources()
    {
        // Arrange: Real UserAuthorizationService with in-memory database
        var tenantAId = Guid.NewGuid();
        var tenantBId = Guid.NewGuid();
        var userExternalId = "user_alpha_only";

        var tenantA = new Tenant { Id = tenantAId, Name = "Tenant Alpha" };
        var tenantB = new Tenant { Id = tenantBId, Name = "Tenant Beta" };
        dbContext.Tenants!.AddRange(tenantA, tenantB);

        var tenantAdminRole = new Role
        {
            Id = Guid.NewGuid(),
            Name = "Tenant Administrator",
            Scope = RoleScope.Tenant,
            IsSystemRole = true,
            IsAssignableToTenant = true
        };
        dbContext.Roles!.Add(tenantAdminRole);

        var tenantAMember = new TenantMember
        {
            Id = Guid.NewGuid(),
            TenantId = tenantAId,
            ExternalIdentityId = userExternalId,
            UserId = userExternalId,
            Email = "admin@alpha.com",
            Status = Status.Active,
            RoleAssignments =
            [
                new TenantMemberRoleAssignment { RoleId = tenantAdminRole.Id }
            ]
        };
        dbContext.TenantMembers!.Add(tenantAMember);
        await dbContext.SaveChangesAsync();

        var authService = new UserAuthorizationService(dbContext, memoryCache);

        // Act: User checks permissions in Tenant A vs Tenant B
        var hasTenantAPermission = await authService.HasPermissionAsync(userExternalId, tenantAId, TenantPermissions.membersView);
        var hasTenantBPermission = await authService.HasPermissionAsync(userExternalId, tenantBId, TenantPermissions.membersView);

        // Assert: User has permissions in Tenant A, but is strictly isolated and forbidden in Tenant B
        hasTenantAPermission.Should().BeTrue("User is an active Tenant Administrator in Tenant Alpha");
        hasTenantBPermission.Should().BeFalse("User has no membership or role assignments in Tenant Beta");
    }

    [Fact]
    public async Task PermissionHandler_TenantUserCannotAccessOtherTenantEndpoint()
    {
        // Arrange: Tenant user from Tenant A requests an endpoint operating in Tenant B context
        var tenantBId = Guid.NewGuid();
        tenantContextMock.Setup(t => t.TenantId).Returns(tenantBId);

        authServiceMock.Setup(a => a.HasPermissionAsync("user_alpha_only", tenantBId, TenantPermissions.membersView, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        var handler = new PermissionAuthorizationHandler(authServiceMock.Object, tenantContextMock.Object);
        var requirement = new PermissionRequirement(TenantPermissions.membersView);
        var principal = new ClaimsPrincipal(new ClaimsIdentity(
        [
            new Claim("sub", "user_alpha_only")
        ], "TestAuth"));
        var context = new AuthorizationHandlerContext([requirement], principal, null);

        // Act
        await handler.HandleAsync(context);

        // Assert: Fail-closed; cross-tenant access denied
        context.HasSucceeded.Should().BeFalse();
    }

    [Fact]
    public async Task PermissionHandler_PlatformAdmin_CanSpectateAnyTenant()
    {
        // Arrange: Platform Admin accesses a tenant workspace endpoint (spectate mode)
        var tenantBId = Guid.NewGuid();
        tenantContextMock.Setup(t => t.TenantId).Returns(tenantBId);

        var handler = new PermissionAuthorizationHandler(authServiceMock.Object, tenantContextMock.Object);
        var requirement = new PermissionRequirement(TenantPermissions.membersView);
        var principal = new ClaimsPrincipal(new ClaimsIdentity(
        [
            new Claim("sub", "platform_admin_spectator"),
            new Claim("is_super_admin", "true")
        ], "TestAuth"));
        var context = new AuthorizationHandlerContext([requirement], principal, null);

        // Act
        await handler.HandleAsync(context);

        // Assert: Platform Administrator can spectate any tenant workspace
        context.HasSucceeded.Should().BeTrue();
    }

    // =========================================================================
    // 4. Header Spoofing Rejection Tests (Fail-Closed)
    // =========================================================================

    [Fact]
    public async Task PermissionHandler_SpoofedHeadersWithoutVerifiedClaims_ShouldFailClosed()
    {
        // Arrange: Attacker sends forgeable headers like X-Super-Admin: true, but their
        // JWT claims do not contain any verified platform admin claims.
        var handler = new PermissionAuthorizationHandler(authServiceMock.Object, tenantContextMock.Object);
        var requirement = new PermissionRequirement(PlatformPermissions.inquiriesView);

        // ClaimsPrincipal strictly reflects cryptographically verified token claims, NOT request headers
        var principal = new ClaimsPrincipal(new ClaimsIdentity(
        [
            new Claim("sub", "attacker_user_999"),
            new Claim("email", "attacker@spoof.com")
        ], "TestAuth"));

        authServiceMock.Setup(a => a.HasPermissionAsync("attacker_user_999", It.IsAny<Guid?>(), PlatformPermissions.inquiriesView, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        var context = new AuthorizationHandlerContext([requirement], principal, null);

        // Act
        await handler.HandleAsync(context);

        // Assert: Backend authorization ignores request headers and fails closed
        context.HasSucceeded.Should().BeFalse();
    }

    // =========================================================================
    // 5. Break-Glass Configuration Fallback Tests (PLATFORM_ADMIN_EMAILS)
    // =========================================================================

    [Fact]
    public async Task PermissionHandler_BreakGlassEmailFallback_ShouldSucceedOnlyWithVerifiedEmailClaim()
    {
        // Arrange: Break-glass email configured in appsettings/env
        var breakGlassEmail = "emergency.superadmin@erpez.dev";
        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                { "PlatformAdmin:Emails", $"other@erpez.dev,{breakGlassEmail}" }
            })
            .Build();

        var handler = new PermissionAuthorizationHandler(authServiceMock.Object, tenantContextMock.Object, configuration: config);
        var requirement = new PermissionRequirement(PlatformPermissions.inquiriesView);

        // Principal has cryptographically verified email claim matching break-glass email
        var principal = new ClaimsPrincipal(new ClaimsIdentity(
        [
            new Claim("sub", "break_glass_user_id"),
            new Claim(ClaimTypes.Email, breakGlassEmail)
        ], "TestAuth"));

        var context = new AuthorizationHandlerContext([requirement], principal, null);

        // Act
        await handler.HandleAsync(context);

        // Assert: Break-glass succeeds when JWT email claim matches configured break-glass list
        context.HasSucceeded.Should().BeTrue();
    }

    [Fact]
    public async Task PermissionHandler_BreakGlassEmailFallback_ShouldFailClosedForNonMatchingEmail()
    {
        // Arrange: Break-glass configured for emergency.superadmin@erpez.dev
        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                { "PlatformAdmin:Emails", "emergency.superadmin@erpez.dev" }
            })
            .Build();

        var handler = new PermissionAuthorizationHandler(authServiceMock.Object, tenantContextMock.Object, configuration: config);
        var requirement = new PermissionRequirement(PlatformPermissions.inquiriesView);

        // Authenticated user with non-matching verified email
        var principal = new ClaimsPrincipal(new ClaimsIdentity(
        [
            new Claim("sub", "regular_user_id"),
            new Claim(ClaimTypes.Email, "regular.user@example.com")
        ], "TestAuth"));

        authServiceMock.Setup(a => a.HasPermissionAsync("regular_user_id", It.IsAny<Guid?>(), PlatformPermissions.inquiriesView, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        var context = new AuthorizationHandlerContext([requirement], principal, null);

        // Act
        await handler.HandleAsync(context);

        // Assert: Fails closed
        context.HasSucceeded.Should().BeFalse();
    }

    [Fact]
    public async Task PermissionHandler_BreakGlassEmailFallback_ShouldFailClosedWhenNoEmailClaimPresent()
    {
        // Arrange
        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                { "PlatformAdmin:Emails", "emergency.superadmin@erpez.dev" }
            })
            .Build();

        var handler = new PermissionAuthorizationHandler(authServiceMock.Object, tenantContextMock.Object, configuration: config);
        var requirement = new PermissionRequirement(PlatformPermissions.inquiriesView);

        // Authenticated user without any email claim
        var principal = new ClaimsPrincipal(new ClaimsIdentity(
        [
            new Claim("sub", "no_email_user_id")
        ], "TestAuth"));

        authServiceMock.Setup(a => a.HasPermissionAsync("no_email_user_id", It.IsAny<Guid?>(), PlatformPermissions.inquiriesView, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        var context = new AuthorizationHandlerContext([requirement], principal, null);

        // Act
        await handler.HandleAsync(context);

        // Assert: Fails closed
        context.HasSucceeded.Should().BeFalse();
    }
}
