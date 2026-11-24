namespace ERPEZ.Shared.Constants;

/// <summary>
/// Normalized internal claim names stamped by identity normalizers.
/// Downstream middleware and application services only read these standardized claims.
/// </summary>
public static class CustomClaims
{
    /// <summary>
    /// Federated subject ID (e.g. Clerk 'user_...' or Keycloak 'sub' GUID).
    /// </summary>
    public const string externalIdentityId = "erpez:external_identity_id";

    /// <summary>
    /// Candidate external organization/tenant ID extracted from IdP token (e.g. Clerk 'org_...' or Keycloak workspace).
    /// </summary>
    public const string externalOrganizationId = "erpez:external_org_id";

    /// <summary>
    /// Identity provider that authenticated this principal (Clerk or Keycloak).
    /// </summary>
    public const string identityProvider = "erpez:identity_provider";

    public static string ExternalIdentityId => externalIdentityId;
    public static string ExternalOrganizationId => externalOrganizationId;
    public static string IdentityProvider => identityProvider;
}
