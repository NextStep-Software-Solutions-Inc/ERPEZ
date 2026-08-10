using ERPEZ.Application.Features.Planning.UACSValidation.Dtos;

namespace ERPEZ.Application.Interfaces;

/// <summary>
/// Service interface for validating UACS code combinations using rules engine.
/// </summary>
public interface IUACSValidationEngine
{
    /// <summary>
    /// Validates a UACS code combination against all applicable rules.
    /// </summary>
    /// <param name="fundSourceId">The FundSource ID.</param>
    /// <param name="organizationId">The Organization ID.</param>
    /// <param name="locationId">The Location ID.</param>
    /// <param name="mfopapId">The MFOPAP ID.</param>
    /// <param name="objectId">The Object ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The validation result with applicable rules and feedback.</returns>
    Task<UACSValidationResultResponse> ValidateCombinationAsync(
        Guid fundSourceId,
        Guid organizationId,
        Guid locationId,
        Guid mfopapId,
        Guid objectId,
        CancellationToken cancellationToken = default);
}
