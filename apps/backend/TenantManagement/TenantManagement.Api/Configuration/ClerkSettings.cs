namespace ERPEZ.TenantManagement.Api.Configuration;

/// <summary>
/// Configuration settings for Clerk authentication and user management.
/// </summary>
public sealed class ClerkSettings
{
    public const string sectionName = "Clerk";

    /// <summary>
    /// The Clerk Frontend API / Issuer URL (e.g., https://clerk.your-domain.com or https://[instance].clerk.accounts.dev).
    /// </summary>
    public string Authority { get; set; } = string.Empty;

    /// <summary>
    /// Optional Audience or Authorized Party (azp claim in Clerk JWT).
    /// </summary>
    public string? Audience { get; set; }

    /// <summary>
    /// Clerk Secret Key (sk_test_... or sk_live_...) for backend API calls.
    /// </summary>
    public string? SecretKey { get; set; }

    /// <summary>
    /// Clerk Publishable Key (pk_test_... or pk_live_...).
    /// </summary>
    public string? PublishableKey { get; set; }

    /// <summary>
    /// Svix webhook signing secret (whsec_...) for verifying inbound Clerk webhooks.
    /// </summary>
    public string? WebhookSecret { get; set; }
}
