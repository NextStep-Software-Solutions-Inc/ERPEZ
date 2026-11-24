using ERPEZ.Shared.Security;
using FluentAssertions;
using Xunit;

namespace Dashboard.Application.UnitTests.Security;

public class ClientOriginMatcherTests
{
    private readonly ClientOriginMatcher matcher = new();

    [Fact]
    public void IsAllowed_WhenExactOriginMatches_ReturnsTrue()
    {
        var origin = new Uri("https://erpez-app.vercel.app");
        var pattern = "https://erpez-app.vercel.app";

        matcher.IsAllowed(origin, pattern).Should().BeTrue();
    }

    [Fact]
    public void IsAllowed_WhenOriginHostDiffers_ReturnsFalse()
    {
        var origin = new Uri("https://evil.vercel.app");
        var pattern = "https://erpez-app.vercel.app";

        matcher.IsAllowed(origin, pattern).Should().BeFalse();
    }

    [Fact]
    public void IsAllowed_WhenPrefixSpoofed_ReturnsFalse()
    {
        var origin = new Uri("https://evil-example.com");
        var pattern = "example.com";

        matcher.IsAllowed(origin, pattern).Should().BeFalse();
    }

    [Fact]
    public void IsAllowed_WhenSuffixSpoofed_ReturnsFalse()
    {
        var origin = new Uri("https://example.com.evil.com");
        var pattern = "example.com";

        matcher.IsAllowed(origin, pattern).Should().BeFalse();
    }

    [Fact]
    public void IsAllowed_WhenPortMatchesExact_ReturnsTrue()
    {
        var origin = new Uri("http://localhost:3000");
        var pattern = "http://localhost:3000";

        matcher.IsAllowed(origin, pattern).Should().BeTrue();
    }

    [Fact]
    public void IsAllowed_WhenPortDiffers_ReturnsFalse()
    {
        var origin = new Uri("http://localhost:5173");
        var pattern = "http://localhost:3000";

        matcher.IsAllowed(origin, pattern).Should().BeFalse();
    }

    [Fact]
    public void IsAllowed_WhenSchemeDiffers_ReturnsFalse()
    {
        var origin = new Uri("http://example.com");
        var pattern = "https://example.com";

        matcher.IsAllowed(origin, pattern).Should().BeFalse();
    }

    [Theory]
    [InlineData("https://app.example.com")]
    [InlineData("https://tenant.example.com")]
    [InlineData("https://customer-alpha.example.com")]
    public void IsAllowed_WhenSingleTierWildcardSubdomain_ReturnsTrue(string originUrl)
    {
        var origin = new Uri(originUrl);
        var pattern = "*.example.com";

        matcher.IsAllowed(origin, pattern).Should().BeTrue();
    }

    [Theory]
    [InlineData("https://example.com")]              // Apex domain does not match *.example.com
    [InlineData("https://evil-example.com")]         // Prefix spoofing
    [InlineData("https://example.com.evil.com")]     // Suffix spoofing
    [InlineData("https://evil.sub.example.com")]     // Multi-tier subdomain
    [InlineData("https://a.b.c.example.com")]        // Multi-tier subdomain
    [InlineData("https://notexample.com")]           // Unrelated domain
    public void IsAllowed_WhenWildcardViolated_ReturnsFalse(string originUrl)
    {
        var origin = new Uri(originUrl);
        var pattern = "*.example.com";

        matcher.IsAllowed(origin, pattern).Should().BeFalse();
    }

    [Fact]
    public void IsAllowed_WhenMultiplePatternsSpecified_MatchesAny()
    {
        var pattern = "http://localhost:3000, https://erpez-app.vercel.app; https://*.erpez.com";

        matcher.IsAllowed(new Uri("http://localhost:3000"), pattern).Should().BeTrue();
        matcher.IsAllowed(new Uri("https://erpez-app.vercel.app"), pattern).Should().BeTrue();
        matcher.IsAllowed(new Uri("https://portal.erpez.com"), pattern).Should().BeTrue();

        matcher.IsAllowed(new Uri("http://localhost:5000"), pattern).Should().BeFalse();
        matcher.IsAllowed(new Uri("https://unauthorized.com"), pattern).Should().BeFalse();
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void IsAllowed_WhenPatternNullOrEmpty_FailsClosed(string? pattern)
    {
        var origin = new Uri("https://erpez-app.vercel.app");

        matcher.IsAllowed(origin, pattern).Should().BeFalse();
    }

    [Fact]
    public void IsAllowed_WhenOriginNull_ReturnsFalse()
    {
        matcher.IsAllowed(null, "https://erpez-app.vercel.app").Should().BeFalse();
    }
}
