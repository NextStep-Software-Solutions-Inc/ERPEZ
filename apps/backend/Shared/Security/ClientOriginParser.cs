namespace ERPEZ.Shared.Security;

/// <summary>
/// Strict parser for HTTP Origin headers per RFC 6454.
/// Ensures origins are absolute HTTP/HTTPS URIs without path, query, fragment, or credentials.
/// </summary>
public sealed class ClientOriginParser : IClientOriginParser
{
    public bool TryParse(string? originHeader, out Uri? origin)
    {
        origin = null;

        if (string.IsNullOrWhiteSpace(originHeader))
        {
            return false;
        }

        var trimmed = originHeader.Trim();

        // Origin headers like 'null' (sandboxed iframes, file://, etc.) are unparseable/untrusted
        if (string.Equals(trimmed, "null", StringComparison.OrdinalIgnoreCase))
        {
            return false;
        }

        if (!Uri.TryCreate(trimmed, UriKind.Absolute, out var parsed))
        {
            return false;
        }

        // Scheme must be strictly HTTP or HTTPS
        if (!string.Equals(parsed.Scheme, Uri.UriSchemeHttps, StringComparison.OrdinalIgnoreCase) &&
            !string.Equals(parsed.Scheme, Uri.UriSchemeHttp, StringComparison.OrdinalIgnoreCase))
        {
            return false;
        }

        if (string.IsNullOrWhiteSpace(parsed.Host))
        {
            return false;
        }

        // Origin must not contain path beyond root ('/' or empty)
        if (!string.IsNullOrEmpty(parsed.AbsolutePath) && parsed.AbsolutePath != "/")
        {
            return false;
        }

        // Origin must never contain query, fragment, or user credentials
        if (!string.IsNullOrEmpty(parsed.Query) ||
            !string.IsNullOrEmpty(parsed.Fragment) ||
            !string.IsNullOrEmpty(parsed.UserInfo))
        {
            return false;
        }

        origin = parsed;
        return true;
    }
}
