using System.Security.Cryptography;
using System.Text;
using ERPEZ.TenantManagement.Infrastructure.Services;
using FluentAssertions;
using Xunit;

namespace ERPEZ.TenantManagement.Application.UnitTests.Webhooks;

public class SvixWebhookVerifierTests
{
    private static (string Secret, string SecretClean) GenerateSecret()
    {
        var raw = RandomNumberGenerator.GetBytes(32);
        var base64 = Convert.ToBase64String(raw);
        return ($"whsec_{base64}", base64);
    }

    private static string Sign(string payload, string svixId, string timestamp, string secretBase64)
    {
        var secretBytes = Convert.FromBase64String(secretBase64);
        var toSign = $"{svixId}.{timestamp}.{payload}";
        using var hmac = new HMACSHA256(secretBytes);
        var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(toSign));
        return $"v1,{Convert.ToBase64String(hash)}";
    }

    [Fact]
    public void VerifySignature_ShouldReturnTrue_WhenSignatureAndTimestampValid()
    {
        var (secret, secretClean) = GenerateSecret();
        var svixId = "msg_test_123";
        var timestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString();
        var payload = "{\"type\":\"user.created\",\"data\":{\"id\":\"user_123\"}}";
        var signature = Sign(payload, svixId, timestamp, secretClean);

        var result = SvixWebhookVerifier.VerifySignature(payload, svixId, timestamp, signature, secret);

        result.Should().BeTrue();
    }

    [Fact]
    public void VerifySignature_ShouldReturnFalse_WhenTimestampExpired()
    {
        var (secret, secretClean) = GenerateSecret();
        var svixId = "msg_test_123";
        var expiredTimestamp = DateTimeOffset.UtcNow.AddMinutes(-10).ToUnixTimeSeconds().ToString();
        var payload = "{\"type\":\"user.created\"}";
        var signature = Sign(payload, svixId, expiredTimestamp, secretClean);

        var result = SvixWebhookVerifier.VerifySignature(payload, svixId, expiredTimestamp, signature, secret);

        result.Should().BeFalse();
    }

    [Fact]
    public void VerifySignature_ShouldReturnFalse_WhenPayloadTampered()
    {
        var (secret, secretClean) = GenerateSecret();
        var svixId = "msg_test_123";
        var timestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString();
        var payload = "{\"type\":\"user.created\"}";
        var signature = Sign(payload, svixId, timestamp, secretClean);

        var tamperedPayload = "{\"type\":\"user.created\",\"tampered\":true}";
        var result = SvixWebhookVerifier.VerifySignature(tamperedPayload, svixId, timestamp, signature, secret);

        result.Should().BeFalse();
    }

    [Fact]
    public void VerifySignature_ShouldReturnFalse_WhenSignatureInvalid()
    {
        var (secret, _) = GenerateSecret();
        var svixId = "msg_test_123";
        var timestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString();
        var payload = "{\"type\":\"user.created\"}";

        var result = SvixWebhookVerifier.VerifySignature(payload, svixId, timestamp, "v1,invalidBase64Signature==", secret);

        result.Should().BeFalse();
    }
}
