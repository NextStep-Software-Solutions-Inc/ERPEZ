namespace ERPEZ.Application.Common.Validators;

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
}
