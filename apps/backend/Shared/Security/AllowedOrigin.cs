namespace ERPEZ.Shared.Security;

/// <summary>
/// Represents a normalized allowed client origin comprising scheme, host, and port.
/// </summary>
public sealed record AllowedOrigin(
    string Scheme,
    string Host,
    int Port);
