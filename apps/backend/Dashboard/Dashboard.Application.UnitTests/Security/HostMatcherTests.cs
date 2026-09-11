using ERPEZ.Shared.Security;
using FluentAssertions;
using Xunit;

namespace Dashboard.Application.UnitTests.Security;

public class HostMatcherTests
{
    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData("*")]
    public void IsHostAllowed_WhenPatternNullEmptyOrStar_ReturnsTrue(string? pattern)
    {
        // Act
        var result = HostMatcher.IsHostAllowed("anything.erpez.com", pattern);

        // Assert
        result.Should().BeTrue();
    }

    [Theory]
    [InlineData("localhost")]
    [InlineData("127.0.0.1")]
    [InlineData("::1")]
    [InlineData("localhost:5000")]
    [InlineData("http://localhost:3000")]
    public void IsHostAllowed_WhenHostIsLocalhostOrLoopback_ReturnsTrue(string host)
    {
        // Act
        var result = HostMatcher.IsHostAllowed(host, "tenant.erpez.com");

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public void IsHostAllowed_WhenExactCanonicalMatch_ReturnsTrue()
    {
        // Arrange
        var host = "tenant.erpez.com";
        var pattern = "tenant.erpez.com";

        // Act & Assert
        HostMatcher.IsHostAllowed(host, pattern).Should().BeTrue();
        HostMatcher.IsHostAllowed("TENANT.ERPEZ.COM", pattern).Should().BeTrue();
    }

    [Fact]
    public void IsHostAllowed_WhenSingleLevelWildcard_ReturnsTrue()
    {
        // Arrange
        var pattern = "*.erpez.com";

        // Act & Assert
        HostMatcher.IsHostAllowed("customer1.erpez.com", pattern).Should().BeTrue();
        HostMatcher.IsHostAllowed("tenant-alpha.erpez.com", pattern).Should().BeTrue();
    }

    [Fact]
    public void IsHostAllowed_WhenMultiLevelSubdomainUnderWildcard_ReturnsFalse()
    {
        // Arrange: *.erpez.com must only match single-level subdomains, not multi-tier
        var pattern = "*.erpez.com";

        // Act & Assert
        HostMatcher.IsHostAllowed("evil.sub.erpez.com", pattern).Should().BeFalse();
        HostMatcher.IsHostAllowed("a.b.c.erpez.com", pattern).Should().BeFalse();
    }

    [Fact]
    public void IsHostAllowed_WhenSuffixSpoofingAttempted_ReturnsFalse()
    {
        // Arrange: Suffix attacks trying to fool ends-with
        // Act & Assert
        HostMatcher.IsHostAllowed("evilerpez.com", "erpez.com").Should().BeFalse();
        HostMatcher.IsHostAllowed("evilerpez.com", "*.erpez.com").Should().BeFalse();
        HostMatcher.IsHostAllowed("noterpez.com", "erpez.com").Should().BeFalse();
        HostMatcher.IsHostAllowed("customer1-erpez.com", "*.erpez.com").Should().BeFalse();
    }

    [Fact]
    public void IsHostAllowed_WhenDifferentDomain_ReturnsFalse()
    {
        // Arrange
        var pattern = "app.erpez.com";

        // Act & Assert
        HostMatcher.IsHostAllowed("evil-attacker.com", pattern).Should().BeFalse();
        HostMatcher.IsHostAllowed("erpez.otherdomain.com", pattern).Should().BeFalse();
    }

    [Fact]
    public void NormalizeHost_StripsSchemePortAndPathCorrectly()
    {
        // Act & Assert
        HostMatcher.NormalizeHost("https://tenant.erpez.com:8443/api/v1").Should().Be("tenant.erpez.com");
        HostMatcher.NormalizeHost("http://tenant.erpez.com/").Should().Be("tenant.erpez.com");
        HostMatcher.NormalizeHost("tenant.erpez.com:9000").Should().Be("tenant.erpez.com");
        HostMatcher.NormalizeHost("tenant.erpez.com.").Should().Be("tenant.erpez.com");
    }
}
