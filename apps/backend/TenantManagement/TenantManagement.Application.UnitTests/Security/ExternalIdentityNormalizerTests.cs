using System.Security.Claims;
using ERPEZ.Shared.Constants;
using ERPEZ.Shared.Enums;
using ERPEZ.Shared.Exceptions;
using ERPEZ.Shared.Interfaces;
using ERPEZ.Shared.Security;
using FluentAssertions;
using Microsoft.Extensions.Configuration;
using Xunit;

namespace ERPEZ.TenantManagement.Application.UnitTests.Security;

public class ExternalIdentityNormalizerTests
{
    private readonly ClerkIdentityNormalizer clerkNormalizer = new();
    private readonly KeycloakIdentityNormalizer keycloakNormalizer = new();

    [Fact]
    public void ClerkNormalizer_ShouldExtractSub_WhenPresent()
    {
        var principal = new ClaimsPrincipal(new ClaimsIdentity(
        [
            new Claim("sub", "user_2test123")
        ], "ClerkJwt"));

        var sub = clerkNormalizer.GetExternalIdentityId(principal);

        sub.Should().Be("user_2test123");
    }

    [Fact]
    public void ClerkNormalizer_ShouldThrow_WhenSubMissing()
    {
        var principal = new ClaimsPrincipal(new ClaimsIdentity());

        var act = () => clerkNormalizer.GetExternalIdentityId(principal);

        act.Should().Throw<UnauthorizedException>()
            .WithMessage("*Missing required 'sub' claim*");
    }

    [Fact]
    public void ClerkNormalizer_ShouldExtractFlatOrgId_WhenPresent()
    {
        var principal = new ClaimsPrincipal(new ClaimsIdentity(
        [
            new Claim("sub", "user_2test123"),
            new Claim("org_id", "org_clerk_flat_456")
        ], "ClerkJwt"));

        var orgId = clerkNormalizer.GetExternalOrganizationId(principal);

        orgId.Should().Be("org_clerk_flat_456");
    }

    [Fact]
    public void ClerkNormalizer_ShouldExtractNestedV2OrgId_WhenNestedOClaimPresent()
    {
        var nestedClaimJson = "{\"id\":\"org_2clerk_nested_789\",\"rol\":\"admin\",\"per\":[\"read:all\"]}";
        var principal = new ClaimsPrincipal(new ClaimsIdentity(
        [
            new Claim("sub", "user_2test123"),
            new Claim("o", nestedClaimJson)
        ], "ClerkJwt"));

        var orgId = clerkNormalizer.GetExternalOrganizationId(principal);

        orgId.Should().Be("org_2clerk_nested_789");
    }

    [Fact]
    public void ClerkNormalizer_ShouldReturnNull_WhenMalformedOClaimProvided()
    {
        var principal = new ClaimsPrincipal(new ClaimsIdentity(
        [
            new Claim("sub", "user_2test123"),
            new Claim("o", "not-a-valid-json")
        ], "ClerkJwt"));

        var orgId = clerkNormalizer.GetExternalOrganizationId(principal);

        orgId.Should().BeNull();
    }

    [Fact]
    public void ClerkNormalizer_ShouldReturnNull_WhenUserHasNoActiveOrganization()
    {
        var principal = new ClaimsPrincipal(new ClaimsIdentity(
        [
            new Claim("sub", "user_2test123")
        ], "ClerkJwt"));

        var orgId = clerkNormalizer.GetExternalOrganizationId(principal);

        orgId.Should().BeNull();
    }

    [Fact]
    public void ClerkNormalizer_ShouldStampNormalizedClaims()
    {
        var principal = new ClaimsPrincipal(new ClaimsIdentity(
        [
            new Claim("sub", "user_2test123"),
            new Claim("org_id", "org_clerk_abc")
        ], "ClerkJwt"));

        clerkNormalizer.NormalizeAndStamp(principal);

        principal.FindFirstValue(CustomClaims.identityProvider).Should().Be("Clerk");
        principal.FindFirstValue(CustomClaims.externalIdentityId).Should().Be("user_2test123");
        principal.FindFirstValue(CustomClaims.externalOrganizationId).Should().Be("org_clerk_abc");
    }

    [Fact]
    public void KeycloakNormalizer_ShouldExtractSub_WhenPresent()
    {
        var principal = new ClaimsPrincipal(new ClaimsIdentity(
        [
            new Claim(ClaimTypes.NameIdentifier, "kc-user-guid-999")
        ], "KeycloakJwt"));

        var sub = keycloakNormalizer.GetExternalIdentityId(principal);

        sub.Should().Be("kc-user-guid-999");
    }

    [Fact]
    public void KeycloakNormalizer_ShouldExtractTenantIdWithPrecedenceOverWorkspaceId()
    {
        var principal = new ClaimsPrincipal(new ClaimsIdentity(
        [
            new Claim("sub", "kc-user-guid"),
            new Claim("tenant_id", "tenant-alpha"),
            new Claim("workspace_id", "workspace-beta")
        ], "KeycloakJwt"));

        var orgId = keycloakNormalizer.GetExternalOrganizationId(principal);

        orgId.Should().Be("tenant-alpha");
    }

    [Fact]
    public void KeycloakNormalizer_ShouldFallbackToWorkspaceId_WhenTenantIdAbsent()
    {
        var principal = new ClaimsPrincipal(new ClaimsIdentity(
        [
            new Claim("sub", "kc-user-guid"),
            new Claim("workspace_id", "workspace-beta")
        ], "KeycloakJwt"));

        var orgId = keycloakNormalizer.GetExternalOrganizationId(principal);

        orgId.Should().Be("workspace-beta");
    }

    [Fact]
    public void NormalizerResolver_ShouldResolveByIssuer()
    {
        var inMemorySettings = new Dictionary<string, string?>
        {
            { "Clerk:Authority", "https://clerk.erpez.cloud" },
            { "JwtSettings:Authority", "https://keycloak.erpez.local/realms/erpez" }
        };
        var config = new ConfigurationBuilder().AddInMemoryCollection(inMemorySettings).Build();
        var normalizers = new IExternalIdentityNormalizer[] { clerkNormalizer, keycloakNormalizer };
        var resolver = new ExternalIdentityNormalizerResolver(normalizers, config);

        var clerkPrincipal = new ClaimsPrincipal(new ClaimsIdentity(
        [
            new Claim("sub", "user_1"),
            new Claim("iss", "https://clerk.erpez.cloud")
        ]));
        var kcPrincipal = new ClaimsPrincipal(new ClaimsIdentity(
        [
            new Claim("sub", "user_2"),
            new Claim("iss", "https://keycloak.erpez.local/realms/erpez/")
        ]));

        resolver.Resolve(clerkPrincipal).Provider.Should().Be(IdentityProvider.Clerk);
        resolver.Resolve(kcPrincipal).Provider.Should().Be(IdentityProvider.Keycloak);
    }
}
