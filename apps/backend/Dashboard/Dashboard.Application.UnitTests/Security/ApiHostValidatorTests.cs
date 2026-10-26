using ERPEZ.Shared.Security;
using FluentAssertions;
using Xunit;

namespace Dashboard.Application.UnitTests.Security;

public class ApiHostValidatorTests
{
    [Fact]
    public void IsAllowed_WhenConfiguredHostMatches_ReturnsTrue()
    {
        var validator = new ApiHostValidator(new[] { "erpez-app.api.dev.nextstep-software.com" });

        validator.IsAllowed("erpez-app.api.dev.nextstep-software.com").Should().BeTrue();
    }

    [Fact]
    public void IsAllowed_WhenHostIsCaseInsensitive_ReturnsTrue()
    {
        var validator = new ApiHostValidator(new[] { "erpez-app.api.dev.nextstep-software.com" });

        validator.IsAllowed("ERPEZ-APP.API.DEV.NEXTSTEP-SOFTWARE.COM").Should().BeTrue();
    }

    [Fact]
    public void IsAllowed_WhenUnauthorizedHost_ReturnsFalse()
    {
        var validator = new ApiHostValidator(new[] { "erpez-app.api.dev.nextstep-software.com" });

        validator.IsAllowed("malicious.example.com").Should().BeFalse();
        validator.IsAllowed("evil-nextstep-software.com").Should().BeFalse();
    }

    [Theory]
    [InlineData("localhost")]
    [InlineData("127.0.0.1")]
    [InlineData("::1")]
    public void IsAllowed_WhenLocalhostLoopback_ReturnsTrue(string loopbackHost)
    {
        var validator = new ApiHostValidator(new[] { "api.erpez.com" }, allowDevFallback: false);

        validator.IsAllowed(loopbackHost).Should().BeTrue();
    }

    [Theory]
    [InlineData("api.nextstep-software.com")]
    [InlineData("dev.nextstep-software.com")]
    public void IsAllowed_WhenWildcardApiHost_ReturnsTrueForSingleTier(string host)
    {
        var validator = new ApiHostValidator(new[] { "*.nextstep-software.com" });

        validator.IsAllowed(host).Should().BeTrue();
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void IsAllowed_WhenHostNullOrEmpty_ReturnsFalse(string? emptyHost)
    {
        var validator = new ApiHostValidator(new[] { "api.erpez.com" });

        validator.IsAllowed(emptyHost).Should().BeFalse();
    }
}
