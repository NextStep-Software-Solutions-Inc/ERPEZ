using ERPEZ.Shared.Security;
using FluentAssertions;
using Xunit;

namespace Dashboard.Application.UnitTests.Security;

public class ClientOriginParserTests
{
    private readonly ClientOriginParser parser = new();

    [Theory]
    [InlineData("https://erpez-app.vercel.app")]
    [InlineData("http://localhost:3000")]
    [InlineData("https://ERPEZ-APP.VERCEL.APP")]
    [InlineData("http://127.0.0.1:8080")]
    [InlineData("https://app.erpez.com")]
    public void TryParse_WhenValidOrigin_ReturnsTrueAndNormalizedUri(string validOrigin)
    {
        // Act
        var success = parser.TryParse(validOrigin, out var uri);

        // Assert
        success.Should().BeTrue();
        uri.Should().NotBeNull();
        uri!.IsAbsoluteUri.Should().BeTrue();
        uri.Scheme.Should().BeOneOf("http", "https");
    }

    [Theory]
    [InlineData("https://example.com/path")]
    [InlineData("https://example.com/api/v1/resource")]
    [InlineData("https://example.com?foo=bar")]
    [InlineData("https://example.com#fragment")]
    [InlineData("https://user:pass@example.com")]
    [InlineData("javascript:alert(1)")]
    [InlineData("ftp://example.com")]
    [InlineData("file:///etc/passwd")]
    [InlineData("not-a-url")]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    [InlineData("null")]
    [InlineData("NULL")]
    public void TryParse_WhenInvalidOrDisallowedOrigin_ReturnsFalse(string? invalidOrigin)
    {
        // Act
        var success = parser.TryParse(invalidOrigin, out var uri);

        // Assert
        success.Should().BeFalse();
        uri.Should().BeNull();
    }
}
