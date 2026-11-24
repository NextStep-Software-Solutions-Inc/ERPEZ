using System.Security.Claims;
using System.Text.Json;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Constants;
using ERPEZ.Shared.Enums;
using ERPEZ.Shared.Interfaces;
using ERPEZ.Shared.Middlewares;
using ERPEZ.Shared.Models;
using ERPEZ.Shared.Security;
using ERPEZ.Shared.Services;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Moq;
using Xunit;

namespace ERPEZ.TenantManagement.Application.UnitTests.Security;

public class DualIdPTenantResolutionMiddlewareTests
{
    private readonly Mock<IExternalTenantResolver> externalTenantResolverMock = new();
    private readonly Mock<ITenantAccessService> accessServiceMock = new();
    private readonly Mock<ITenantConnectionResolver> connectionResolverMock = new();
    private readonly Mock<IClientOriginParser> originParserMock = new();
    private readonly TenantRequestContext requestContext = new();
    private readonly IExternalIdentityNormalizer[] normalizers;
    private readonly IConfiguration configuration;

    public DualIdPTenantResolutionMiddlewareTests()
    {
        normalizers = new IExternalIdentityNormalizer[]
        {
            new ClerkIdentityNormalizer(),
            new KeycloakIdentityNormalizer()
        };

        var configValues = new Dictionary<string, string?>
        {
            { "Clerk:Authority", "https://clerk.erpez.cloud" },
            { "JwtSettings:Authority", "https://keycloak.erpez.local/realms/erpez" }
        };
        configuration = new ConfigurationBuilder().AddInMemoryCollection(configValues).Build();
    }

    private HttpContext CreateHttpContext(ClaimsPrincipal? user = null, string path = "/api/orders")
    {
        var context = new DefaultHttpContext();
        context.Response.Body = new MemoryStream();
        context.Request.Path = path;
        context.Request.Host = new HostString("app.erpez.com");

        if (user != null)
        {
            context.User = user;
        }

        var services = new ServiceCollection();
        services.AddSingleton(new ExternalIdentityNormalizerResolver(normalizers, configuration));
        services.AddSingleton(externalTenantResolverMock.Object);
        services.AddSingleton(requestContext);
        context.RequestServices = services.BuildServiceProvider();

        return context;
    }

    private static async Task<string> ReadResponseBodyAsync(HttpContext context)
    {
        context.Response.Body.Seek(0, SeekOrigin.Begin);
        using var reader = new StreamReader(context.Response.Body);
        return await reader.ReadToEndAsync();
    }

    [Fact]
    public async Task ClerkMode_WhenHeaderMatchesTokenOrg_SetsCandidateTenantId()
    {
        var tenantId = Guid.NewGuid();
        var externalOrgId = "org_clerk_123";

        externalTenantResolverMock
            .Setup(r => r.ResolveTenantIdAsync(IdentityProvider.Clerk, externalOrgId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(tenantId);

        var user = new ClaimsPrincipal(new ClaimsIdentity(
        [
            new Claim("sub", "user_clerk_1"),
            new Claim("iss", "https://clerk.erpez.cloud"),
            new Claim("o", JsonSerializer.Serialize(new { id = externalOrgId, rol = "admin" }))
        ], "ClerkJwt"));

        var context = CreateHttpContext(user);
        context.Request.Headers["X-Tenant-Id"] = tenantId.ToString();

        var nextCalled = false;
        var middleware = new TenantResolutionMiddleware(_ =>
        {
            nextCalled = true;
            return Task.CompletedTask;
        });

        await middleware.InvokeAsync(context);

        nextCalled.Should().BeTrue();
        context.Items[TenantResolutionMiddleware.candidateTenantItemKey].Should().Be(tenantId);
    }

    [Fact]
    public async Task ClerkMode_WhenHeaderDiffersFromTokenOrg_Returns400Conflict()
    {
        var mappedTenantId = Guid.NewGuid();
        var headerTenantId = Guid.NewGuid();
        var externalOrgId = "org_clerk_123";

        externalTenantResolverMock
            .Setup(r => r.ResolveTenantIdAsync(IdentityProvider.Clerk, externalOrgId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(mappedTenantId);

        var user = new ClaimsPrincipal(new ClaimsIdentity(
        [
            new Claim("sub", "user_clerk_1"),
            new Claim("iss", "https://clerk.erpez.cloud"),
            new Claim("org_id", externalOrgId)
        ], "ClerkJwt"));

        var context = CreateHttpContext(user);
        context.Request.Headers["X-Tenant-Id"] = headerTenantId.ToString();

        var nextCalled = false;
        var middleware = new TenantResolutionMiddleware(_ =>
        {
            nextCalled = true;
            return Task.CompletedTask;
        });

        await middleware.InvokeAsync(context);

        nextCalled.Should().BeFalse();
        context.Response.StatusCode.Should().Be(StatusCodes.Status400BadRequest);

        var body = await ReadResponseBodyAsync(context);
        body.Should().Contain("TENANT_SELECTOR_CONFLICT");
    }

    [Fact]
    public async Task KeycloakMode_WhenHeaderAndQueryParamConflict_Returns400Conflict()
    {
        var headerTenantId = Guid.NewGuid();
        var queryTenantId = Guid.NewGuid();

        var user = new ClaimsPrincipal(new ClaimsIdentity(
        [
            new Claim("sub", "user_kc_1"),
            new Claim("iss", "https://keycloak.erpez.local/realms/erpez")
        ], "KeycloakJwt"));

        var context = CreateHttpContext(user);
        context.Request.Headers["X-Tenant-Id"] = headerTenantId.ToString();
        context.Request.QueryString = new QueryString($"?tenantId={queryTenantId}");

        var nextCalled = false;
        var middleware = new TenantResolutionMiddleware(_ =>
        {
            nextCalled = true;
            return Task.CompletedTask;
        });

        await middleware.InvokeAsync(context);

        nextCalled.Should().BeFalse();
        context.Response.StatusCode.Should().Be(StatusCodes.Status400BadRequest);

        var body = await ReadResponseBodyAsync(context);
        body.Should().Contain("TENANT_SELECTOR_CONFLICT");
    }

    [Fact]
    public async Task KeycloakMode_AllowsWorkspaceSwitchingViaHeader_EvenIfTokenHasDifferentTenantId()
    {
        var tokenTenantId = Guid.NewGuid();
        var headerTenantId = Guid.NewGuid();

        var user = new ClaimsPrincipal(new ClaimsIdentity(
        [
            new Claim("sub", "user_kc_1"),
            new Claim("iss", "https://keycloak.erpez.local/realms/erpez"),
            new Claim("tenant_id", tokenTenantId.ToString())
        ], "KeycloakJwt"));

        var context = CreateHttpContext(user);
        context.Request.Headers["X-Tenant-Id"] = headerTenantId.ToString();

        var nextCalled = false;
        var middleware = new TenantResolutionMiddleware(_ =>
        {
            nextCalled = true;
            return Task.CompletedTask;
        });

        await middleware.InvokeAsync(context);

        nextCalled.Should().BeTrue();
        context.Items[TenantResolutionMiddleware.candidateTenantItemKey].Should().Be(headerTenantId);
    }

    [Theory]
    [InlineData("/api/tenant/context")]
    [InlineData("/api/tenant/available")]
    [InlineData("/tenants/context")]
    [InlineData("/tenants/available")]
    public async Task BootstrapRoutes_AreExemptFromTenantAccessValidationMiddleware(string bootstrapPath)
    {
        var user = new ClaimsPrincipal(new ClaimsIdentity(
        [
            new Claim("sub", "user_bootstrap")
        ], "TestAuth"));

        var context = CreateHttpContext(user, bootstrapPath);
        // CandidateTenantId is NOT set

        var nextCalled = false;
        var validationMiddleware = new TenantAccessValidationMiddleware(_ =>
        {
            nextCalled = true;
            return Task.CompletedTask;
        });

        await validationMiddleware.InvokeAsync(
            context,
            accessServiceMock.Object,
            connectionResolverMock.Object,
            requestContext,
            originParserMock.Object);

        nextCalled.Should().BeTrue();
        context.Response.StatusCode.Should().Be(StatusCodes.Status200OK); // untouched
    }

    [Fact]
    public async Task OperationalRoute_WhenCandidateTenantIdMissing_FailsWith400()
    {
        var user = new ClaimsPrincipal(new ClaimsIdentity(
        [
            new Claim("sub", "user_operational")
        ], "TestAuth"));

        var context = CreateHttpContext(user, "/api/orders");
        // No CandidateTenantId set

        var nextCalled = false;
        var validationMiddleware = new TenantAccessValidationMiddleware(_ =>
        {
            nextCalled = true;
            return Task.CompletedTask;
        });

        await validationMiddleware.InvokeAsync(
            context,
            accessServiceMock.Object,
            connectionResolverMock.Object,
            requestContext,
            originParserMock.Object);

        nextCalled.Should().BeFalse();
        context.Response.StatusCode.Should().Be(StatusCodes.Status400BadRequest);

        var body = await ReadResponseBodyAsync(context);
        body.Should().Contain("Active tenant context is required");
    }

    [Fact]
    public async Task ClerkMode_WhenExternalOrgUnmapped_OperationalRoute_FailsWith403()
    {
        var externalOrgId = "org_unmapped_999";

        // Resolver returns null for unmapped org
        externalTenantResolverMock
            .Setup(r => r.ResolveTenantIdAsync(IdentityProvider.Clerk, externalOrgId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Guid?)null);

        var user = new ClaimsPrincipal(new ClaimsIdentity(
        [
            new Claim("sub", "user_clerk_1"),
            new Claim("iss", "https://clerk.erpez.cloud"),
            new Claim("org_id", externalOrgId)
        ], "ClerkJwt"));

        var context = CreateHttpContext(user, "/api/orders");

        var nextCalled = false;
        var middleware = new TenantResolutionMiddleware(_ =>
        {
            nextCalled = true;
            return Task.CompletedTask;
        });

        await middleware.InvokeAsync(context);

        nextCalled.Should().BeFalse();
        context.Response.StatusCode.Should().Be(StatusCodes.Status403Forbidden);

        var body = await ReadResponseBodyAsync(context);
        body.Should().Contain("TENANT_UNMAPPED");
    }
}
