namespace ERPEZ.Api.Configuration;

/// <summary>
/// Configuration settings for JWT Bearer authentication.
/// Binds to the "JwtSettings" section in appsettings.json.
/// </summary>
public class JwtSettings
{
    /// <summary>
    /// Gets or sets the JWT authority/issuer URL.
    /// </summary>
    public required string Authority { get; set; }

    /// <summary>
    /// Gets or sets the API audience identifier.
    /// </summary>
    public required string Audience { get; set; }
}
