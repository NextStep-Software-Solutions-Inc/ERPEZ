using Microsoft.AspNetCore.Authorization;

namespace ERPEZ.Shared.Authorization;

/// <summary>
/// Requirement that user tokens from browser clients must include a validated 'azp' (authorized party) claim
/// matching an allowed client origin.
/// </summary>
public class AzpRequirement : IAuthorizationRequirement
{
}
