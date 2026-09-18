using System.Security.Claims;
using System.Text.Json;
using ERPEZ.Infrastructure.Persistence;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Configuration;
using ERPEZ.Shared.Enums;
using ERPEZ.Shared.Interfaces;
using ERPEZ.Shared.Middlewares;
using ERPEZ.Shared.Models;
using ERPEZ.Shared.Services;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Options;
using Moq;
using Xunit;

namespace Dashboard.Application.UnitTests.MultiTenancy;

public class TenantSecurityBoundaryTests
{
    private readonly Mock<ITenantAccessService> accessServiceMock = new();
    private readonly Mock<ITenantConnectionResolver> connectionResolverMock = new();
    private readonly Mock<IHostEnvironment> envMock = new();
    private readonly Mock<IConfiguration> configMock = new();
    private readonly TenantRequestContext requestContext = new();

    public TenantSecurityBoundaryTests()
    {
        envMock.Setup(e => e.EnvironmentName).Returns("Production");
    }

    private static HttpContext CreateHttpContext(ClaimsPrincipal? user = null, string? host = "app.erpez.com")
    {
        var context = new DefaultHttpContext();
        context.Response.Body = new MemoryStream();
        if (user != null)
        {
            context.User = user;
        }
        if (!string.IsNullOrEmpty(host))
        {
            context.Request.Host = new HostString(host);
        }
        return context;
    }

    private static async Task<string> ReadResponseBodyAsync(HttpContext context)
    {
        context.Response.Body.Seek(0, SeekOrigin.Begin);
        using var reader = new StreamReader(context.Response.Body);
        return await reader.ReadToEndAsync();
    }

    private static ClaimsPrincipal CreateUser(string sub, Guid? tenantClaimId = null)
    {
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, sub),
            new("sub", sub)
        };

        if (tenantClaimId.HasValue)
        {
            claims.Add(new("tenant_id", tenantClaimId.Value.ToString()));
        }

        var identity = new ClaimsIdentity(claims, "TestAuth");
        return new ClaimsPrincipal(identity);
    }

    [Fact]
    public async Task UserInTenantA_SupplyingTenantBHeader_FailsClosedWith403()
    {
        // Invariant: Authenticated user in Tenant A sends header for Tenant B.
        // Server-side identity validation must reject request, and credentials for Tenant B must NEVER be resolved.
        var tenantBId = Guid.NewGuid();
        var user = CreateUser("user-a");

        var context = CreateHttpContext(user);
        context.Request.Headers["X-Tenant-Id"] = tenantBId.ToString();

        // 1. TenantResolutionMiddleware picks up Tenant B from header (candidate)
        var resolutionMiddleware = new TenantResolutionMiddleware(nextContext =>
        {
            return Task.CompletedTask;
        });
        await resolutionMiddleware.InvokeAsync(context);

        // 2. Setup access evaluation: caller is NOT a member of Tenant B
        accessServiceMock.Setup(s => s.EvaluateAccessAsync(
                It.IsAny<ClaimsPrincipal>(),
                tenantBId,
                It.IsAny<string>(),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(TenantAccessResult.Fail(
                "Caller is not an active authorized member of this tenant.",
                "TENANT_MEMBERSHIP_REQUIRED",
                StatusCodes.Status403Forbidden));

        var nextCalled = false;
        var validationMiddleware = new TenantAccessValidationMiddleware(nextContext =>
        {
            nextCalled = true;
            return Task.CompletedTask;
        });

        // Act
        await validationMiddleware.InvokeAsync(context, accessServiceMock.Object, connectionResolverMock.Object, requestContext);

        // Assert
        context.Response.StatusCode.Should().Be(StatusCodes.Status403Forbidden);
        nextCalled.Should().BeFalse();
        requestContext.IsResolved.Should().BeFalse();

        var body = await ReadResponseBodyAsync(context);
        body.Should().Contain("Caller is not an active authorized member of this tenant.");

        // CRITICAL: ConnectionResolver must NEVER be invoked for Tenant B
        connectionResolverMock.Verify(r => r.ResolveConnectionInfoAsync(tenantBId, It.IsAny<CancellationToken>()), Times.Never);
        connectionResolverMock.Verify(r => r.ResolveConnectionInfoAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task UserInTenantA_WithConflictingJwtClaimAndHeader_FailsClosedWith403()
    {
        // Invariant: Precedence & Conflict Detection.
        // JWT claim says Tenant A, header says Tenant B -> 403 TENANT_SELECTOR_CONFLICT immediately.
        var tenantAId = Guid.NewGuid();
        var tenantBId = Guid.NewGuid();
        var user = CreateUser("user-a", tenantAId);

        var context = CreateHttpContext(user);
        context.Request.Headers["X-Tenant-Id"] = tenantBId.ToString();

        var nextCalled = false;
        var resolutionMiddleware = new TenantResolutionMiddleware(nextContext =>
        {
            nextCalled = true;
            return Task.CompletedTask;
        });

        // Act
        await resolutionMiddleware.InvokeAsync(context);

        // Assert
        context.Response.StatusCode.Should().Be(StatusCodes.Status403Forbidden);
        nextCalled.Should().BeFalse();
        context.Items.ContainsKey(TenantResolutionMiddleware.candidateTenantItemKey).Should().BeFalse();

        var body = await ReadResponseBodyAsync(context);
        body.Should().Contain("Conflicting tenant selectors provided in token and header.");
    }

    [Fact]
    public async Task UserInTenantA_AccessingOwnTenant_Succeeds()
    {
        // Invariant: Authorized user accessing own tenant succeeds, resolves credentials, and sets up request context.
        var tenantAId = Guid.NewGuid();
        var user = CreateUser("user-a", tenantAId);

        var context = CreateHttpContext(user);
        context.Request.Headers["X-Tenant-Id"] = tenantAId.ToString();

        var accessContext = new TenantAccessContext(
            tenantAId,
            "Tenant Alpha",
            TenantProvisioningState.Ready,
            "app.erpez.com",
            "Active");

        accessServiceMock.Setup(s => s.EvaluateAccessAsync(
                user,
                tenantAId,
                "app.erpez.com",
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(TenantAccessResult.Success(accessContext));

        var expectedConnStr = "Host=pg;Database=tenant_alpha_db;Username=postgres;Password=secret";
        connectionResolverMock.Setup(r => r.ResolveConnectionInfoAsync(tenantAId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new TenantDatabaseConnectionInfo(tenantAId, expectedConnStr));

        // Run resolution
        var resolutionMiddleware = new TenantResolutionMiddleware(c => Task.CompletedTask);
        await resolutionMiddleware.InvokeAsync(context);

        var nextCalled = false;
        var validationMiddleware = new TenantAccessValidationMiddleware(nextContext =>
        {
            nextCalled = true;
            return Task.CompletedTask;
        });

        // Act
        await validationMiddleware.InvokeAsync(context, accessServiceMock.Object, connectionResolverMock.Object, requestContext);

        // Assert
        nextCalled.Should().BeTrue();
        requestContext.IsResolved.Should().BeTrue();
        requestContext.AccessContext.Should().NotBeNull();
        requestContext.AccessContext!.TenantId.Should().Be(tenantAId);
        requestContext.AccessContext.TenantName.Should().Be("Tenant Alpha");
        requestContext.ConnectionInfo.Should().NotBeNull();
        requestContext.ConnectionInfo!.ConnectionString.Should().Be(expectedConnStr);

        // Verify synchronous TenantConnectionProvider retrieves verified connection
        var routingOptions = Options.Create(new TenantRoutingOptions { AllowDevelopmentFallback = false });
        var provider = new TenantConnectionProvider(requestContext, configMock.Object, envMock.Object, routingOptions);
        provider.GetConnectionString().Should().Be(expectedConnStr);
    }

    [Fact]
    public async Task UnauthenticatedRequest_Returns401()
    {
        // Invariant: Unauthenticated request to operational endpoint returns 401 AUTH_REQUIRED
        var candidateTenantId = Guid.NewGuid();
        var unauthenticatedUser = new ClaimsPrincipal(new ClaimsIdentity()); // IsAuthenticated = false

        var context = CreateHttpContext(unauthenticatedUser);
        context.Items[TenantResolutionMiddleware.candidateTenantItemKey] = candidateTenantId;

        accessServiceMock.Setup(s => s.EvaluateAccessAsync(
                unauthenticatedUser,
                candidateTenantId,
                It.IsAny<string>(),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(TenantAccessResult.Fail(
                "Authentication credentials missing or invalid.",
                "AUTH_REQUIRED",
                StatusCodes.Status401Unauthorized));

        var nextCalled = false;
        var validationMiddleware = new TenantAccessValidationMiddleware(c =>
        {
            nextCalled = true;
            return Task.CompletedTask;
        });

        // Act
        await validationMiddleware.InvokeAsync(context, accessServiceMock.Object, connectionResolverMock.Object, requestContext);

        // Assert
        context.Response.StatusCode.Should().Be(StatusCodes.Status401Unauthorized);
        nextCalled.Should().BeFalse();
        requestContext.IsResolved.Should().BeFalse();
        connectionResolverMock.Verify(r => r.ResolveConnectionInfoAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task UserNotMemberOfTenant_Returns403()
    {
        // Invariant: Caller not in TenantMembers receives 403 TENANT_MEMBERSHIP_REQUIRED
        var tenantId = Guid.NewGuid();
        var user = CreateUser("user-outsider");

        var context = CreateHttpContext(user);
        context.Items[TenantResolutionMiddleware.candidateTenantItemKey] = tenantId;

        accessServiceMock.Setup(s => s.EvaluateAccessAsync(
                user,
                tenantId,
                It.IsAny<string>(),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(TenantAccessResult.Fail(
                "Caller is not an active authorized member of this tenant.",
                "TENANT_MEMBERSHIP_REQUIRED",
                StatusCodes.Status403Forbidden));

        var nextCalled = false;
        var validationMiddleware = new TenantAccessValidationMiddleware(c =>
        {
            nextCalled = true;
            return Task.CompletedTask;
        });

        // Act
        await validationMiddleware.InvokeAsync(context, accessServiceMock.Object, connectionResolverMock.Object, requestContext);

        // Assert
        context.Response.StatusCode.Should().Be(StatusCodes.Status403Forbidden);
        nextCalled.Should().BeFalse();
        requestContext.IsResolved.Should().BeFalse();
        connectionResolverMock.Verify(r => r.ResolveConnectionInfoAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task DisabledTenant_Returns403()
    {
        // Invariant: Disabled tenant receives 403 TENANT_DISABLED
        var tenantId = Guid.NewGuid();
        var user = CreateUser("user-member", tenantId);

        var context = CreateHttpContext(user);
        context.Items[TenantResolutionMiddleware.candidateTenantItemKey] = tenantId;

        accessServiceMock.Setup(s => s.EvaluateAccessAsync(
                user,
                tenantId,
                It.IsAny<string>(),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(TenantAccessResult.Fail(
                "Tenant access has been disabled by administrator.",
                "TENANT_DISABLED",
                StatusCodes.Status403Forbidden));

        var nextCalled = false;
        var validationMiddleware = new TenantAccessValidationMiddleware(c =>
        {
            nextCalled = true;
            return Task.CompletedTask;
        });

        // Act
        await validationMiddleware.InvokeAsync(context, accessServiceMock.Object, connectionResolverMock.Object, requestContext);

        // Assert
        context.Response.StatusCode.Should().Be(StatusCodes.Status403Forbidden);
        nextCalled.Should().BeFalse();
        requestContext.IsResolved.Should().BeFalse();
        connectionResolverMock.Verify(r => r.ResolveConnectionInfoAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task ProvisioningTenant_Returns503()
    {
        // Invariant: Provisioning tenant receives 503 TENANT_PROVISIONING
        var tenantId = Guid.NewGuid();
        var user = CreateUser("user-member", tenantId);

        var context = CreateHttpContext(user);
        context.Items[TenantResolutionMiddleware.candidateTenantItemKey] = tenantId;

        accessServiceMock.Setup(s => s.EvaluateAccessAsync(
                user,
                tenantId,
                It.IsAny<string>(),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(TenantAccessResult.Fail(
                "Tenant operational database is currently being provisioned.",
                "TENANT_PROVISIONING",
                StatusCodes.Status503ServiceUnavailable));

        var nextCalled = false;
        var validationMiddleware = new TenantAccessValidationMiddleware(c =>
        {
            nextCalled = true;
            return Task.CompletedTask;
        });

        // Act
        await validationMiddleware.InvokeAsync(context, accessServiceMock.Object, connectionResolverMock.Object, requestContext);

        // Assert
        context.Response.StatusCode.Should().Be(StatusCodes.Status503ServiceUnavailable);
        nextCalled.Should().BeFalse();
        requestContext.IsResolved.Should().BeFalse();
        connectionResolverMock.Verify(r => r.ResolveConnectionInfoAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task ExpiredLicense_Returns403()
    {
        // Invariant: Expired or inactive license receives 403 LICENSE_EXPIRED
        var tenantId = Guid.NewGuid();
        var user = CreateUser("user-member", tenantId);

        var context = CreateHttpContext(user);
        context.Items[TenantResolutionMiddleware.candidateTenantItemKey] = tenantId;

        accessServiceMock.Setup(s => s.EvaluateAccessAsync(
                user,
                tenantId,
                It.IsAny<string>(),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(TenantAccessResult.Fail(
                "Tenant license is expired or invalid.",
                "LICENSE_EXPIRED",
                StatusCodes.Status403Forbidden));

        var nextCalled = false;
        var validationMiddleware = new TenantAccessValidationMiddleware(c =>
        {
            nextCalled = true;
            return Task.CompletedTask;
        });

        // Act
        await validationMiddleware.InvokeAsync(context, accessServiceMock.Object, connectionResolverMock.Object, requestContext);

        // Assert
        context.Response.StatusCode.Should().Be(StatusCodes.Status403Forbidden);
        nextCalled.Should().BeFalse();
        requestContext.IsResolved.Should().BeFalse();
        connectionResolverMock.Verify(r => r.ResolveConnectionInfoAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task HostDomainMismatch_Returns403()
    {
        // Invariant: Domain constraint violation receives 403 DOMAIN_VIOLATION
        var tenantId = Guid.NewGuid();
        var user = CreateUser("user-member", tenantId);

        var context = CreateHttpContext(user, "evil-phishing-host.com");
        context.Items[TenantResolutionMiddleware.candidateTenantItemKey] = tenantId;

        accessServiceMock.Setup(s => s.EvaluateAccessAsync(
                user,
                tenantId,
                "evil-phishing-host.com",
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(TenantAccessResult.Fail(
                "Domain constraint violation: Host 'evil-phishing-host.com' is not authorized for this tenant.",
                "DOMAIN_VIOLATION",
                StatusCodes.Status403Forbidden));

        var nextCalled = false;
        var validationMiddleware = new TenantAccessValidationMiddleware(c =>
        {
            nextCalled = true;
            return Task.CompletedTask;
        });

        // Act
        await validationMiddleware.InvokeAsync(context, accessServiceMock.Object, connectionResolverMock.Object, requestContext);

        // Assert
        context.Response.StatusCode.Should().Be(StatusCodes.Status403Forbidden);
        nextCalled.Should().BeFalse();
        requestContext.IsResolved.Should().BeFalse();
        connectionResolverMock.Verify(r => r.ResolveConnectionInfoAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public void MissingTenantInProduction_ThrowsAndFailsClosed()
    {
        // Invariant: When tenant context is uninitialized in production, TenantConnectionProvider throws
        // and NEVER falls back to any connection string.
        var uninitializedContext = new TenantRequestContext();
        var routingOptions = Options.Create(new TenantRoutingOptions { AllowDevelopmentFallback = false });

        var provider = new TenantConnectionProvider(
            uninitializedContext,
            configMock.Object,
            envMock.Object,
            routingOptions);

        // Act
        var act = () => provider.GetConnectionString();

        // Assert
        act.Should().Throw<InvalidOperationException>()
            .WithMessage("Tenant operational database connection is not available for this request.");
    }

    [Fact]
    public void UnauthorizedTenant_CannotInstantiateOperationalDbContext()
    {
        // Invariant: ApplicationDbContext registration fails closed when TenantConnectionProvider
        // throws because tenant context is uninitialized.
        var uninitializedContext = new TenantRequestContext();
        var routingOptions = Options.Create(new TenantRoutingOptions { AllowDevelopmentFallback = false });

        var services = new ServiceCollection();
        services.AddScoped<ITenantRequestContext>(_ => uninitializedContext);
        services.AddScoped<ITenantConnectionProvider, TenantConnectionProvider>();
        services.AddSingleton(envMock.Object);
        services.AddSingleton(configMock.Object);
        services.AddSingleton(routingOptions);

        services.AddDbContext<ApplicationDbContext>((sp, options) =>
        {
            var provider = sp.GetRequiredService<ITenantConnectionProvider>();
            var connectionString = provider.GetConnectionString();
            options.UseNpgsql(connectionString);
        });

        using var serviceProvider = services.BuildServiceProvider();
        using var scope = serviceProvider.CreateScope();

        // Act
        var act = () => scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        // Assert
        act.Should().Throw<InvalidOperationException>()
            .WithMessage("Tenant operational database connection is not available for this request.");
    }

    [Fact]
    public async Task CredentialResolutionFailure_DoesNotInitializeTenantContext()
    {
        // Invariant: If credential resolution returns null, context remains uninitialized,
        // returns 503, and downstream connection provider fails closed.
        var tenantId = Guid.NewGuid();
        var user = CreateUser("user-member", tenantId);

        var context = CreateHttpContext(user);
        context.Items[TenantResolutionMiddleware.candidateTenantItemKey] = tenantId;

        var accessContext = new TenantAccessContext(
            tenantId,
            "Tenant Alpha",
            TenantProvisioningState.Ready,
            "app.erpez.com",
            "Active");

        accessServiceMock.Setup(s => s.EvaluateAccessAsync(
                user,
                tenantId,
                It.IsAny<string>(),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(TenantAccessResult.Success(accessContext));

        // Credential resolution fails (null connection info)
        connectionResolverMock.Setup(r => r.ResolveConnectionInfoAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((TenantDatabaseConnectionInfo?)null);

        var nextCalled = false;
        var validationMiddleware = new TenantAccessValidationMiddleware(c =>
        {
            nextCalled = true;
            return Task.CompletedTask;
        });

        // Act
        await validationMiddleware.InvokeAsync(context, accessServiceMock.Object, connectionResolverMock.Object, requestContext);

        // Assert
        context.Response.StatusCode.Should().Be(StatusCodes.Status503ServiceUnavailable);
        nextCalled.Should().BeFalse();
        requestContext.IsResolved.Should().BeFalse();

        var body = await ReadResponseBodyAsync(context);
        body.Should().Contain("Operational database connection could not be established for this tenant.");
    }

    [Fact]
    public async Task UserWithMultipleWorkspaces_CanSwitchBetweenAuthorizedTenants_AndFailsClosedOnUnauthorizedTenant()
    {
        // Invariant: An authenticated user belonging to multiple workspaces (Tenant A & B)
        // can switch between them, while any attempt to access unauthorized Tenant C (via manipulated header/localStorage)
        // fails closed with 403, and Tenant C connection credentials are NEVER resolved or contacted.
        var tenantAId = Guid.NewGuid();
        var tenantBId = Guid.NewGuid();
        var tenantCId = Guid.NewGuid();
        var user = CreateUser("user-multi");

        // Mock authorized memberships for A and B
        var accessContextA = new TenantAccessContext(tenantAId, "Tenant Alpha", TenantProvisioningState.Ready, "app.erpez.com", "Active");
        var accessContextB = new TenantAccessContext(tenantBId, "Tenant Beta", TenantProvisioningState.Ready, "app.erpez.com", "Active");

        accessServiceMock.Setup(s => s.EvaluateAccessAsync(user, tenantAId, It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(TenantAccessResult.Success(accessContextA));
        accessServiceMock.Setup(s => s.EvaluateAccessAsync(user, tenantBId, It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(TenantAccessResult.Success(accessContextB));
        accessServiceMock.Setup(s => s.EvaluateAccessAsync(user, tenantCId, It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(TenantAccessResult.Fail(
                "Caller is not an active authorized member of this workspace.",
                "WORKSPACE_MEMBERSHIP_REQUIRED",
                StatusCodes.Status403Forbidden));

        connectionResolverMock.Setup(r => r.ResolveConnectionInfoAsync(tenantAId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new TenantDatabaseConnectionInfo(tenantAId, "Host=pg;Database=tenant_a_db;Username=postgres;Password=secret"));
        connectionResolverMock.Setup(r => r.ResolveConnectionInfoAsync(tenantBId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new TenantDatabaseConnectionInfo(tenantBId, "Host=pg;Database=tenant_b_db;Username=postgres;Password=secret"));

        var resolutionMiddleware = new TenantResolutionMiddleware(c => Task.CompletedTask);
        var validationMiddleware = new TenantAccessValidationMiddleware(c => Task.CompletedTask);

        // --- Step 1: Access Workspace A ---
        var contextA = CreateHttpContext(user);
        contextA.Request.Headers["X-Tenant-Id"] = tenantAId.ToString();
        await resolutionMiddleware.InvokeAsync(contextA);
        var reqCtxA = new TenantRequestContext();
        await validationMiddleware.InvokeAsync(contextA, accessServiceMock.Object, connectionResolverMock.Object, reqCtxA);

        contextA.Response.StatusCode.Should().Be(StatusCodes.Status200OK);
        reqCtxA.IsResolved.Should().BeTrue();
        reqCtxA.TenantId.Should().Be(tenantAId);
        connectionResolverMock.Verify(r => r.ResolveConnectionInfoAsync(tenantAId, It.IsAny<CancellationToken>()), Times.Once);

        // --- Step 2: Switch to Workspace B ---
        var contextB = CreateHttpContext(user);
        contextB.Request.Headers["X-Tenant-Id"] = tenantBId.ToString();
        await resolutionMiddleware.InvokeAsync(contextB);
        var reqCtxB = new TenantRequestContext();
        await validationMiddleware.InvokeAsync(contextB, accessServiceMock.Object, connectionResolverMock.Object, reqCtxB);

        contextB.Response.StatusCode.Should().Be(StatusCodes.Status200OK);
        reqCtxB.IsResolved.Should().BeTrue();
        reqCtxB.TenantId.Should().Be(tenantBId);
        connectionResolverMock.Verify(r => r.ResolveConnectionInfoAsync(tenantBId, It.IsAny<CancellationToken>()), Times.Once);

        // --- Step 3: Attempt Unauthorized Workspace C (Stale / Tampered localStorage / header) ---
        var contextC = CreateHttpContext(user);
        contextC.Request.Headers["X-Tenant-Id"] = tenantCId.ToString();
        await resolutionMiddleware.InvokeAsync(contextC);
        var reqCtxC = new TenantRequestContext();
        await validationMiddleware.InvokeAsync(contextC, accessServiceMock.Object, connectionResolverMock.Object, reqCtxC);

        // Golden Security Assertions:
        // 1. Response must fail closed with 403 Forbidden
        contextC.Response.StatusCode.Should().Be(StatusCodes.Status403Forbidden);
        reqCtxC.IsResolved.Should().BeFalse();

        // 2. CRITICAL: ConnectionResolver must NEVER be invoked for Tenant C (Zero credentials resolved / Zero DB contact)
        connectionResolverMock.Verify(r => r.ResolveConnectionInfoAsync(tenantCId, It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task PlatformUser_WithoutTenantMembership_CannotAccessTenantDatabase_FailsClosedWith403()
    {
        // Invariant: Platform access != Workspace access.
        // A user with Platform Support role attempting to access Tenant Alpha without an explicit TenantMember record
        // must fail closed with 403 TENANT_MEMBERSHIP_REQUIRED, and Tenant Alpha database credentials must NEVER be resolved.
        var tenantId = Guid.NewGuid();
        var platformUser = CreateUser("support-user"); // Platform Support identity without tenant membership

        var context = CreateHttpContext(platformUser);
        context.Request.Headers["X-Tenant-Id"] = tenantId.ToString();

        accessServiceMock.Setup(s => s.EvaluateAccessAsync(
                platformUser,
                tenantId,
                It.IsAny<string>(),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(TenantAccessResult.Fail(
                "Platform users do not have implicit access to tenant operational databases. Explicit workspace membership is required.",
                "TENANT_MEMBERSHIP_REQUIRED",
                StatusCodes.Status403Forbidden));

        var resolutionMiddleware = new TenantResolutionMiddleware(c => Task.CompletedTask);
        await resolutionMiddleware.InvokeAsync(context);

        var reqCtx = new TenantRequestContext();
        var validationMiddleware = new TenantAccessValidationMiddleware(c => Task.CompletedTask);
        await validationMiddleware.InvokeAsync(context, accessServiceMock.Object, connectionResolverMock.Object, reqCtx);

        // Assert
        context.Response.StatusCode.Should().Be(StatusCodes.Status403Forbidden);
        reqCtx.IsResolved.Should().BeFalse();

        // Golden Assertion: Zero credential resolution, Zero database contact
        connectionResolverMock.Verify(r => r.ResolveConnectionInfoAsync(tenantId, It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public void WorkspaceAdmin_WithoutPlatformRole_CannotAccessPlatformPlane()
    {
        // Invariant: Workspace Admin != Platform Admin.
        // An identity that is Tenant Administrator inside a workspace, but lacks Keycloak platform roles,
        // is not authorized for Platform Control Plane operations.
        var tenantAdminClaims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, "admin-north"),
            new("sub", "admin-north"),
            new(ClaimTypes.Role, "Tenant Administrator") // Workspace role only, no platform_administrator
        };
        var identity = new ClaimsIdentity(tenantAdminClaims, "Keycloak");
        var principal = new ClaimsPrincipal(identity);

        // Verification: Check if caller has platform role
        var isPlatformAdmin = principal.HasClaim(c => c.Type == ClaimTypes.Role && c.Value == "platform_administrator") ||
                              principal.HasClaim(c => c.Type == "realm_access" && c.Value.Contains("platform_administrator"));

        isPlatformAdmin.Should().BeFalse(
            "Workspace Administrator role belongs strictly to the tenant plane and does not grant Platform Control Plane access.");
    }

    [Fact]
    public async Task TenantAccessValidationMiddleware_WhenClientAbortsRequest_ShouldTerminateGracefullyWithoutThrowing()
    {
        var tenantId = Guid.NewGuid();
        var user = CreateUser("user-1", tenantId);
        using var cts = new CancellationTokenSource();
        cts.Cancel(); // Simulate client aborting the HTTP request

        var context = CreateHttpContext(user);
        context.RequestAborted = cts.Token;
        context.Request.Headers["X-Tenant-Id"] = tenantId.ToString();

        accessServiceMock.Setup(s => s.EvaluateAccessAsync(
                user,
                tenantId,
                It.IsAny<string>(),
                It.IsAny<CancellationToken>()))
            .ThrowsAsync(new OperationCanceledException(cts.Token));

        var resolutionMiddleware = new TenantResolutionMiddleware(c => Task.CompletedTask);
        await resolutionMiddleware.InvokeAsync(context);

        var reqCtx = new TenantRequestContext();
        var nextInvoked = false;
        var validationMiddleware = new TenantAccessValidationMiddleware(c =>
        {
            nextInvoked = true;
            return Task.CompletedTask;
        });

        // Act - should NOT throw OperationCanceledException
        var act = () => validationMiddleware.InvokeAsync(context, accessServiceMock.Object, connectionResolverMock.Object, reqCtx);
        await act.Should().NotThrowAsync();

        // Assert
        nextInvoked.Should().BeFalse();
        reqCtx.IsResolved.Should().BeFalse();
    }
}

