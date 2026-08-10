using ERPEZ.Application.Features.Planning.UACSValidation.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.UACSValidation.Commands.ValidateUACSCombination;

/// <summary>
/// Command to validate a UACS code combination.
/// </summary>
public class ValidateUACSCombinationCommand : IRequest<ApiResponse<UACSValidationResultResponse>>
{
    /// <summary>
    /// The FundSource ID (element 1).
    /// </summary>
    public required Guid FundSourceId { get; init; }

    /// <summary>
    /// The Organization ID (element 2).
    /// </summary>
    public required Guid OrganizationId { get; init; }

    /// <summary>
    /// The Location ID (element 3).
    /// </summary>
    public required Guid LocationId { get; init; }

    /// <summary>
    /// The MFOPAP ID (element 4).
    /// </summary>
    public required Guid MFOPAPId { get; init; }

    /// <summary>
    /// The Object ID (element 5).
    /// </summary>
    public required Guid ObjectId { get; init; }
}
