namespace ERPEZ.Shared.Security;

/// <summary>
/// Parses and validates browser Origin headers according to strict RFC 6454 specifications.
/// </summary>
public interface IClientOriginParser
{
    /// <summary>
    /// Attempts to parse the raw Origin header into a validated absolute client origin URI.
    /// Returns false if the header is missing, malformed, or contains invalid components (paths, query, userinfo).
    /// </summary>
    bool TryParse(string? originHeader, out Uri? origin);
}
