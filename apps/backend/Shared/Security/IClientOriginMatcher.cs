namespace ERPEZ.Shared.Security;

/// <summary>
/// Authoritative matcher validating whether a client origin is authorized for a tenant.
/// Answers the question: "Does this client origin belong to this tenant's authorized origins?"
/// </summary>
public interface IClientOriginMatcher
{
    /// <summary>
    /// Evaluates whether the client origin matches the tenant's allowed domain/origin pattern(s).
    /// </summary>
    bool IsAllowed(Uri? clientOrigin, string? allowedDomainPattern);
}
