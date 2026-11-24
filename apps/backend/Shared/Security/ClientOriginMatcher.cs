namespace ERPEZ.Shared.Security;

/// <summary>
/// Authoritative matcher validating client origins against tenant allowed domain/origin constraints.
/// Enforces DNS label-boundary checks, strict port validation, and protocol isolation.
/// </summary>
public sealed class ClientOriginMatcher : IClientOriginMatcher
{
    public bool IsAllowed(Uri? clientOrigin, string? allowedDomainPattern)
    {
        if (clientOrigin == null || string.IsNullOrWhiteSpace(allowedDomainPattern))
        {
            return false;
        }

        // Support semicolon- or comma-separated lists of allowed origins/domains
        var patterns = allowedDomainPattern.Split([';', ','], StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

        foreach (var rawPattern in patterns)
        {
            if (MatchesPattern(clientOrigin, rawPattern))
            {
                return true;
            }
        }

        return false;
    }

    private static bool MatchesPattern(Uri clientOrigin, string pattern)
    {
        if (string.IsNullOrWhiteSpace(pattern))
        {
            return false;
        }

        var trimmed = pattern.Trim();

        // Universal wildcard (used only when explicitly configured)
        if (trimmed == "*")
        {
            return true;
        }

        // Pattern specifies a full URI (e.g. "http://localhost:3000" or "https://erpez-app.vercel.app")
        if (trimmed.Contains("://"))
        {
            return MatchesFullUriPattern(clientOrigin, trimmed);
        }

        // Pattern is a host/domain pattern (e.g. "localhost", "erpez-app.vercel.app", "*.example.com")
        return MatchesHostPattern(clientOrigin, trimmed);
    }

    private static bool MatchesFullUriPattern(Uri clientOrigin, string pattern)
    {
        // Handle wildcard in URI like "https://*.example.com" or "https://*.example.com:443"
        var schemeEnd = pattern.IndexOf("://", StringComparison.Ordinal);
        if (schemeEnd <= 0)
        {
            return false;
        }

        var patternScheme = pattern[..schemeEnd];
        if (!string.Equals(clientOrigin.Scheme, patternScheme, StringComparison.OrdinalIgnoreCase))
        {
            return false;
        }

        var remainder = pattern[(schemeEnd + 3)..];
        var slashIdx = remainder.IndexOf('/');
        if (slashIdx >= 0)
        {
            remainder = remainder[..slashIdx];
        }

        string patternHost;
        int? patternPort = null;

        var colonIdx = remainder.LastIndexOf(':');
        if (colonIdx >= 0 && int.TryParse(remainder[(colonIdx + 1)..], out var parsedPort))
        {
            patternHost = remainder[..colonIdx];
            patternPort = parsedPort;
        }
        else
        {
            patternHost = remainder;
            patternPort = string.Equals(patternScheme, "https", StringComparison.OrdinalIgnoreCase) ? 443 : 80;
        }

        // Validate effective port
        var effectiveOriginPort = clientOrigin.IsDefaultPort
            ? (string.Equals(clientOrigin.Scheme, "https", StringComparison.OrdinalIgnoreCase) ? 443 : 80)
            : clientOrigin.Port;

        if (patternPort.HasValue && effectiveOriginPort != patternPort.Value)
        {
            return false;
        }

        return IsHostMatching(clientOrigin.Host, patternHost);
    }

    private static bool MatchesHostPattern(Uri clientOrigin, string pattern)
    {
        var cleanPattern = HostMatcher.NormalizeHost(pattern);
        if (string.IsNullOrWhiteSpace(cleanPattern))
        {
            return false;
        }

        // Bare "localhost" allows loopbacks on any port for local dev
        if (cleanPattern is "localhost" or "127.0.0.1" or "::1")
        {
            return clientOrigin.Host is "localhost" or "127.0.0.1" or "::1";
        }

        return IsHostMatching(clientOrigin.Host, cleanPattern);
    }

    private static bool IsHostMatching(string originHost, string patternHost)
    {
        var cleanOrigin = HostMatcher.NormalizeHost(originHost);
        var cleanPattern = HostMatcher.NormalizeHost(patternHost);

        // Exact match
        if (string.Equals(cleanOrigin, cleanPattern, StringComparison.OrdinalIgnoreCase))
        {
            return true;
        }

        // DNS label-boundary wildcard match: e.g. *.example.com
        if (cleanPattern.StartsWith("*."))
        {
            var baseDomain = cleanPattern[2..];
            var originLabels = cleanOrigin.Split('.', StringSplitOptions.RemoveEmptyEntries);
            var patternLabels = baseDomain.Split('.', StringSplitOptions.RemoveEmptyEntries);

            // Single-tier subdomain boundary check
            // app.example.com -> length 3 vs base length 2 -> matches
            // evil.sub.example.com -> length 4 vs base length 2 -> rejected
            // example.com -> length 2 vs base length 2 -> rejected
            if (originLabels.Length == patternLabels.Length + 1)
            {
                var originBase = string.Join('.', originLabels.Skip(1));
                return string.Equals(originBase, baseDomain, StringComparison.OrdinalIgnoreCase);
            }
        }

        return false;
    }
}
