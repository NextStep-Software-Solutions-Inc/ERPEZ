namespace ERPEZ.Application.Common.Validators;

using ERPEZ.Domain.Enums;

/// <summary>
/// Common validation utilities for use across validators.
/// </summary>
public static class ValidationUtilities
{
    /// <summary>
    /// Validates if the provided URL string is a valid HTTP or HTTPS URL.
    /// </summary>
    /// <param name="url">The URL string to validate.</param>
    /// <returns>True if the URL is valid or null/whitespace; false otherwise.</returns>
    public static bool IsValidHttpUrl(string? url)
    {
        if (string.IsNullOrWhiteSpace(url))
            return true;

        return Uri.TryCreate(url, UriKind.Absolute, out var uriResult)
            && (uriResult.Scheme == Uri.UriSchemeHttp || uriResult.Scheme == Uri.UriSchemeHttps);
    }

    public static bool TryParseDistributionBehavior(string? value, out DistributionBehaviorEnum behavior)
    {
        var normalizedValue = NormalizeDistributionBehavior(value);
        return Enum.TryParse(normalizedValue, true, out behavior);
    }

    public static string NormalizeDistributionBehavior(string? value)
    {
        var normalizedValue = value?.Trim() ?? string.Empty;

        if (normalizedValue.Equals("Divisible", StringComparison.OrdinalIgnoreCase) ||
            normalizedValue.Equals("Summative", StringComparison.OrdinalIgnoreCase))
        {
            return nameof(DistributionBehaviorEnum.Summation);
        }

        return normalizedValue;
    }

    public static string GetDistributionBehaviorOptions()
    {
        return "Summation, Divisible, Uniform, Maximum, Minimum, Milestone";
    }
}
