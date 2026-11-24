using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.UACSCodeValidation.Queries.CheckCodeValidity;

/// <summary>
/// Query to check if a UACS code is valid for a specific fiscal year and date.
/// </summary>
public record CheckCodeValidityQuery(
    Guid? UACSCodeSegmentId,
    Guid? UACSCodeCombinationId,
    Guid FiscalYearId,
    DateTime ValidationDate
) : IRequest<ApiResponse<CodeValidityResponse>>;

/// <summary>
/// Response DTO for code validity check.
/// </summary>
public record CodeValidityResponse
{
    public bool IsValid { get; init; }
    public string ValidationMessage { get; init; } = string.Empty;
    public Guid? ApplicableFiscalYearId { get; init; }
    public DateTime? EffectiveStartDate { get; init; }
    public DateTime? EffectiveEndDate { get; init; }
    public bool IsActive { get; init; }
}
