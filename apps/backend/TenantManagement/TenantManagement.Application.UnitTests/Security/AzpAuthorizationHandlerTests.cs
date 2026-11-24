using System.Security.Claims;
using ERPEZ.Shared.Authorization;
using FluentAssertions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Configuration;
using Xunit;

namespace ERPEZ.TenantManagement.Application.UnitTests.Security;

public class AzpAuthorizationHandlerTests
{
    private readonly IConfiguration configuration;
    private readonly AzpAuthorizationHandler handler;
    private readonly AzpRequirement requirement = new();

    public AzpAuthorizationHandlerTests()
    {
        var settings = new Dictionary<string, string?>
        {
            { "Clerk:AllowedAuthorizedParties:0", "http://localhost:3000" },
            { "Clerk:AllowedAuthorizedParties:1", "https://dashboard.erpez.cloud" }
        };

        configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(settings)
            .Build();

        handler = new AzpAuthorizationHandler(configuration);
    }

    [Theory]
    [InlineData("http://localhost:3000")]
    [InlineData("http://localhost:3000/")]
    [InlineData("https://dashboard.erpez.cloud")]
    public async Task HandleRequirementAsync_ShouldSucceed_WhenAzpIsInAllowlist(string allowedAzp)
    {
        var user = new ClaimsPrincipal(new ClaimsIdentity(
        [
            new Claim("sub", "user_123"),
            new Claim("azp", allowedAzp)
        ], "ClerkJwt"));

        var context = new AuthorizationHandlerContext([requirement], user, null);

        await handler.HandleAsync(context);

        context.HasSucceeded.Should().BeTrue();
    }

    [Fact]
    public async Task HandleRequirementAsync_ShouldFail_WhenAzpIsMissing()
    {
        var user = new ClaimsPrincipal(new ClaimsIdentity(
        [
            new Claim("sub", "user_123")
        ], "ClerkJwt"));

        var context = new AuthorizationHandlerContext([requirement], user, null);

        await handler.HandleAsync(context);

        context.HasSucceeded.Should().BeFalse();
        context.FailureReasons.Should().Contain(r => r.Message.Contains("'azp' claim is mandatory"));
    }

    [Theory]
    [InlineData("http://malicious-site.com")]
    [InlineData("https://attacker.org")]
    [InlineData("http://localhost:8080")]
    public async Task HandleRequirementAsync_ShouldFail_WhenAzpIsNotInAllowlist(string untrustedAzp)
    {
        var user = new ClaimsPrincipal(new ClaimsIdentity(
        [
            new Claim("sub", "user_123"),
            new Claim("azp", untrustedAzp)
        ], "ClerkJwt"));

        var context = new AuthorizationHandlerContext([requirement], user, null);

        await handler.HandleAsync(context);

        context.HasSucceeded.Should().BeFalse();
        context.FailureReasons.Should().Contain(r => r.Message.Contains("not in the allowed list"));
    }
}
