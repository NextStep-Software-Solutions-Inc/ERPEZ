namespace ERPEZ.Shared.Security;

/// <summary>
/// Validates request hosts against tenant domain constraints using strict DNS label-boundary matching.
/// Prevents substring and label-boundary spoofing attacks.
/// </summary>
public static class HostMatcher
{
    public static bool IsHostAllowed(string? canonicalRequestHost, string? allowedDomainPattern)
    {
        if (string.IsNullOrWhiteSpace(allowedDomainPattern) || allowedDomainPattern.Trim() == "*")
        {
            return true;
        }

        var cleanHost = NormalizeHost(canonicalRequestHost);
        var cleanPattern = NormalizeHost(allowedDomainPattern);

        if (string.IsNullOrWhiteSpace(cleanHost))
        {
            return false;
        }

        // Always allow localhost loopbacks in dev/local environments
        if (cleanHost is "localhost" or "127.0.0.1" or "::1")
        {
            return true;
        }

        // Exact canonical FQDN match
        if (string.Equals(cleanHost, cleanPattern, StringComparison.OrdinalIgnoreCase))
        {
            return true;
        }

        // Single-level wildcard match (e.g., *.example.com)
        if (cleanPattern.StartsWith("*."))
        {
            var baseDomain = cleanPattern[2..];
            var hostLabels = cleanHost.Split('.', StringSplitOptions.RemoveEmptyEntries);
            var patternLabels = baseDomain.Split('.', StringSplitOptions.RemoveEmptyEntries);

            // Host must have exactly one more label than the base domain (single-tier subdomain)
            if (hostLabels.Length == patternLabels.Length + 1)
            {
                var hostBase = string.Join('.', hostLabels.Skip(1));
                return string.Equals(hostBase, baseDomain, StringComparison.OrdinalIgnoreCase);
            }
        }

        return false;
    }

    public static string NormalizeHost(string? host)
    {
        if (string.IsNullOrWhiteSpace(host))
        {
            return string.Empty;
        }

        var h = host.Trim().ToLowerInvariant();

        // Strip schemes if passed in legacy configuration
        if (h.StartsWith("http://", StringComparison.OrdinalIgnoreCase)) h = h[7..];
        if (h.StartsWith("https://", StringComparison.OrdinalIgnoreCase)) h = h[8..];

        // Strip path
        var slashIdx = h.IndexOf('/');
        if (slashIdx >= 0)
        {
            h = h[..slashIdx];
        }

        // Handle IPv6 bracketed host (e.g. [::1]:5000) or host:port
        if (h.StartsWith('[') && h.IndexOf(']') > 0)
        {
            var closingBracket = h.IndexOf(']');
            h = h[1..closingBracket];
        }
        else if (h.Count(c => c == ':') == 1)
        {
            var colonIdx = h.IndexOf(':');
            h = h[..colonIdx];
        }

        return h.Trim().TrimEnd('.');
    }
}
