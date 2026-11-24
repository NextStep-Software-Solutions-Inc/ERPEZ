using ERPEZ.Shared.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Options;

namespace ERPEZ.Shared.Security;

/// <summary>
/// Authoritative validator for incoming HTTP API request hosts.
/// Rejects unauthorized or spoofed host headers before tenant routing proceeds.
/// </summary>
public sealed class ApiHostValidator : IApiHostValidator
{
    private readonly HashSet<string> allowedHosts;
    private readonly List<string> wildcardDomains;
    private readonly bool allowAnyInDev;

    [ActivatorUtilitiesConstructor]
    public ApiHostValidator(IOptions<TenantRoutingOptions> options, IHostEnvironment? env = null)
        : this(options.Value.AllowedApiHosts,
               (env?.IsDevelopment() == true) || options.Value.AllowDevelopmentFallback)
    {
    }

    public ApiHostValidator(IEnumerable<string>? allowedHosts, bool allowDevFallback = false)
    {
        this.allowAnyInDev = allowDevFallback;
        this.allowedHosts = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        this.wildcardDomains = [];

        if (allowedHosts != null)
        {
            foreach (var raw in allowedHosts)
            {
                if (string.IsNullOrWhiteSpace(raw)) continue;
                var trimmed = raw.Trim();
                if (trimmed == "*")
                {
                    this.wildcardDomains.Add("*");
                }
                else if (trimmed.StartsWith("*."))
                {
                    this.wildcardDomains.Add(trimmed[2..].ToLowerInvariant());
                }
                else
                {
                    this.allowedHosts.Add(HostMatcher.NormalizeHost(trimmed));
                }
            }
        }
    }

    public bool IsAllowed(string? apiHost)
    {
        if (string.IsNullOrWhiteSpace(apiHost))
        {
            return false;
        }

        var normalizedHost = HostMatcher.NormalizeHost(apiHost);
        if (string.IsNullOrWhiteSpace(normalizedHost))
        {
            return false;
        }

        // Loopback is always permitted for local dev/tooling
        if (normalizedHost is "localhost" or "127.0.0.1" or "::1")
        {
            return true;
        }

        // Catch-all wildcard
        if (wildcardDomains.Contains("*"))
        {
            return true;
        }

        // Exact match against configured API hosts
        if (allowedHosts.Contains(normalizedHost))
        {
            return true;
        }

        // Wildcard domain match (e.g. *.nextstep-software.com or *.erpez.com)
        var hostLabels = normalizedHost.Split('.', StringSplitOptions.RemoveEmptyEntries);
        foreach (var baseDomain in wildcardDomains)
        {
            if (baseDomain == "*") continue;
            var patternLabels = baseDomain.Split('.', StringSplitOptions.RemoveEmptyEntries);
            if (hostLabels.Length == patternLabels.Length + 1)
            {
                var hostBase = string.Join('.', hostLabels.Skip(1));
                if (string.Equals(hostBase, baseDomain, StringComparison.OrdinalIgnoreCase))
                {
                    return true;
                }
            }
        }

        // If no explicit hosts are configured and dev fallback is permitted
        if (allowedHosts.Count == 0 && wildcardDomains.Count == 0 && allowAnyInDev)
        {
            return true;
        }

        return false;
    }
}
