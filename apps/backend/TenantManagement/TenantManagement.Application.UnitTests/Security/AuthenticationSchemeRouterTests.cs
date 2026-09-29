using ERPEZ.Shared.Constants;
using ERPEZ.Shared.Security;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Xunit;

namespace ERPEZ.TenantManagement.Application.UnitTests.Security;

public class AuthenticationSchemeRouterTests
{
    private readonly IConfiguration configuration;
    private readonly AuthenticationSchemeRouter router;

    public AuthenticationSchemeRouterTests()
    {
        var settings = new Dictionary<string, string?>
        {
            { "Clerk:Authority", "https://adapting-stallion-26.clerk.accounts.dev" },
            { "JwtSettings:Authority", "https://keycloak.erpez.local/realms/erpez" },
            { "JwtSettings:DevIssuer", "https://erpez.dev/auth" },
            { "AUTH_PROVIDER", "hybrid" }
        };

        configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(settings)
            .Build();

        router = new AuthenticationSchemeRouter(configuration);
    }

    [Fact]
    public void ResolveScheme_ShouldRouteToClerkJwt_WhenIssuerMatchesClerkAuthorityExactly()
    {
        var scheme = router.ResolveScheme("https://adapting-stallion-26.clerk.accounts.dev");

        scheme.Should().Be(AuthSchemes.clerkJwt);
    }

    [Fact]
    public void ResolveScheme_ShouldRouteToClerkJwt_WhenIssuerHasTrailingSlash()
    {
        var scheme = router.ResolveScheme("https://adapting-stallion-26.clerk.accounts.dev/");

        scheme.Should().Be(AuthSchemes.clerkJwt);
    }

    [Fact]
    public void ResolveScheme_ShouldRouteToKeycloakJwt_WhenIssuerMatchesKeycloakAuthorityExactly()
    {
        var scheme = router.ResolveScheme("https://keycloak.erpez.local/realms/erpez");

        scheme.Should().Be(AuthSchemes.keycloakJwt);
    }

    [Fact]
    public void ResolveScheme_ShouldRouteToKeycloakJwt_WhenIssuerMatchesDevIssuer()
    {
        var scheme = router.ResolveScheme("https://erpez.dev/auth");

        scheme.Should().Be(AuthSchemes.keycloakJwt);
    }

    [Theory]
    [InlineData("https://untrusted-issuer.com")]
    [InlineData("https://attacker-clerk.accounts.dev")]
    [InlineData("https://accounts.google.com")]
    [InlineData("https://keycloak.evil.com/realms/erpez")]
    public void ResolveScheme_ShouldRouteToRejectScheme_WhenIssuerIsUnknown(string unknownIssuer)
    {
        var scheme = router.ResolveScheme(unknownIssuer);

        scheme.Should().Be(AuthSchemes.rejectScheme);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void ResolveScheme_ShouldRouteToRejectScheme_WhenIssuerIsNullOrWhitespace(string? emptyIssuer)
    {
        var scheme = router.ResolveScheme(emptyIssuer);

        scheme.Should().Be(AuthSchemes.rejectScheme);
    }

    [Fact]
    public void ResolveSchemeFromContext_ShouldRouteToRejectScheme_WhenTokenIsMalformed()
    {
        var context = new DefaultHttpContext();
        context.Request.Headers.Authorization = "Bearer not-a-valid-jwt-token";

        var scheme = router.ResolveSchemeFromContext(context);

        scheme.Should().Be(AuthSchemes.rejectScheme);
    }
}
