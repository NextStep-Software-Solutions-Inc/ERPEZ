using ERPEZ.Application.Features.Planning.UACSValidation.Dtos;
using ERPEZ.Application.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.UACSValidation.Commands.ValidateUACSCombination;

/// <summary>
/// Handler for ValidateUACSCombinationCommand that validates UACS code combinations.
/// </summary>
public class ValidateUACSCombinationCommandHandler(IUACSValidationEngine validationEngine)
    : IRequestHandler<ValidateUACSCombinationCommand, ApiResponse<UACSValidationResultResponse>>
{
    public async Task<ApiResponse<UACSValidationResultResponse>> Handle(
        ValidateUACSCombinationCommand request,
        CancellationToken cancellationToken)
    {
        var result = await validationEngine.ValidateCombinationAsync(
            request.FundSourceId,
            request.OrganizationId,
            request.LocationId,
            request.MFOPAPId,
            request.ObjectId,
            cancellationToken);

        var message = result.IsValid
            ? "UACS code combination is valid."
            : $"UACS code combination validation failed with {result.Messages.Count} error(s).";

        return ApiResponse<UACSValidationResultResponse>.Success(result, message);
    }
}
