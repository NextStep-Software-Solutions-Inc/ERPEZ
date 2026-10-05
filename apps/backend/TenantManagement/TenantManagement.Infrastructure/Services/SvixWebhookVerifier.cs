using System.Security.Cryptography;
using System.Text;

namespace ERPEZ.TenantManagement.Infrastructure.Services;

public class SvixWebhookVerifier
{
    public static bool VerifySignature(
        string payload,
        string svixId,
        string svixTimestamp,
        string svixSignature,
        string webhookSecret,
        TimeSpan? tolerance = null)
    {
        if (string.IsNullOrWhiteSpace(payload) ||
            string.IsNullOrWhiteSpace(svixId) ||
            string.IsNullOrWhiteSpace(svixTimestamp) ||
            string.IsNullOrWhiteSpace(svixSignature) ||
            string.IsNullOrWhiteSpace(webhookSecret))
        {
            return false;
        }

        // Verify timestamp tolerance (default 5 minutes) to protect against replay attacks
        if (long.TryParse(svixTimestamp, out var timestampSec))
        {
            var eventTime = DateTimeOffset.FromUnixTimeSeconds(timestampSec);
            var now = DateTimeOffset.UtcNow;
            var maxTolerance = tolerance ?? TimeSpan.FromMinutes(5);
            if (now - eventTime > maxTolerance || eventTime - now > maxTolerance)
            {
                return false;
            }
        }
        else
        {
            return false;
        }

        // Svix secret may start with "whsec_"
        var secretClean = webhookSecret.StartsWith("whsec_")
            ? webhookSecret["whsec_".Length..]
            : webhookSecret;

        byte[] secretBytes;
        try
        {
            secretBytes = Convert.FromBase64String(secretClean);
        }
        catch
        {
            secretBytes = Encoding.UTF8.GetBytes(secretClean);
        }

        var toSign = $"{svixId}.{svixTimestamp}.{payload}";
        using var hmac = new HMACSHA256(secretBytes);
        var computedSignatureBytes = hmac.ComputeHash(Encoding.UTF8.GetBytes(toSign));
        var computedSignature = Convert.ToBase64String(computedSignatureBytes);

        // Signatures are separated by spaces: "v1,sig1 v1,sig2"
        var signatures = svixSignature.Split(' ', StringSplitOptions.RemoveEmptyEntries);
        foreach (var sigEntry in signatures)
        {
            var parts = sigEntry.Split(',', 2);
            if (parts.Length == 2 && parts[0] == "v1")
            {
                var candidate = parts[1];
                if (CryptographicOperations.FixedTimeEquals(
                    Encoding.UTF8.GetBytes(candidate),
                    Encoding.UTF8.GetBytes(computedSignature)))
                {
                    return true;
                }
            }
        }

        return false;
    }
}
