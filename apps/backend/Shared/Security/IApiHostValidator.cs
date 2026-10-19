namespace ERPEZ.Shared.Security;

/// <summary>
/// Validates whether the incoming HTTP Request.Host reaches an authorized API endpoint.
/// Answers the fundamental question: "Is this request reaching one of our legitimate API hosts?"
/// </summary>
public interface IApiHostValidator
{
    /// <summary>
    /// Checks if the specified API host (FQDN) is authorized.
    /// </summary>
    bool IsAllowed(string? apiHost);
}
