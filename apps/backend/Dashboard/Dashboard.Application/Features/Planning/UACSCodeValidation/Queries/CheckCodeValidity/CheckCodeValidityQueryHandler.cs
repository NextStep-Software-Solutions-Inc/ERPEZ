using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.UACSCodeValidation.Queries.CheckCodeValidity;

/// <summary>
/// Handler for checking UACS code validity for a specific fiscal year and date.
/// </summary>
public class CheckCodeValidityQueryHandler(IUnitOfWork unitOfWork) 
    : IRequestHandler<CheckCodeValidityQuery, ApiResponse<CodeValidityResponse>>
{
    public async Task<ApiResponse<CodeValidityResponse>> Handle(CheckCodeValidityQuery query, CancellationToken cancellationToken)
    {
        if (query.UACSCodeSegmentId.HasValue)
        {
            return await CheckSegmentValidity(query.UACSCodeSegmentId.Value, query.FiscalYearId, query.ValidationDate, cancellationToken);
        }
        
        if (query.UACSCodeCombinationId.HasValue)
        {
            return await CheckCombinationValidity(query.UACSCodeCombinationId.Value, query.FiscalYearId, query.ValidationDate, cancellationToken);
        }

        return ApiResponse<CodeValidityResponse>.Fail("Either UACSCodeSegmentId or UACSCodeCombinationId must be provided.");
    }

    private async Task<ApiResponse<CodeValidityResponse>> CheckSegmentValidity(
        Guid segmentId, 
        Guid fiscalYearId, 
        DateTime validationDate, 
        CancellationToken cancellationToken)
    {
        var query = unitOfWork.UACSCodeSegmentFiscalYearRepository
            .Query()
            .Where(x => x.UACSCodeSegmentId == segmentId 
                && x.FiscalYearId == fiscalYearId 
                && x.IsActive);

        var associations = await unitOfWork.UACSCodeSegmentFiscalYearRepository.ToListAsync(query, cancellationToken);

        var validAssociation = associations.FirstOrDefault(x => 
            x.EffectiveStartDate <= validationDate 
            && (!x.EffectiveEndDate.HasValue || x.EffectiveEndDate.Value >= validationDate));

        if (validAssociation != null)
        {
            return ApiResponse<CodeValidityResponse>.Success(new CodeValidityResponse
            {
                IsValid = true,
                ValidationMessage = "UACS code segment is valid for the specified fiscal year and date.",
                ApplicableFiscalYearId = validAssociation.FiscalYearId,
                EffectiveStartDate = validAssociation.EffectiveStartDate,
                EffectiveEndDate = validAssociation.EffectiveEndDate,
                IsActive = validAssociation.IsActive
            }, "Code validation completed successfully.");
        }

        return ApiResponse<CodeValidityResponse>.Success(new CodeValidityResponse
        {
            IsValid = false,
            ValidationMessage = "UACS code segment is not valid for the specified fiscal year and date.",
            ApplicableFiscalYearId = null,
            EffectiveStartDate = null,
            EffectiveEndDate = null,
            IsActive = false
        }, "Code validation completed successfully.");
    }

    private async Task<ApiResponse<CodeValidityResponse>> CheckCombinationValidity(
        Guid combinationId, 
        Guid fiscalYearId, 
        DateTime validationDate, 
        CancellationToken cancellationToken)
    {
        var query = unitOfWork.UACSCodeCombinationFiscalYearRepository
            .Query()
            .Where(x => x.UACSCodeCombinationId == combinationId 
                && x.FiscalYearId == fiscalYearId 
                && x.IsActive);

        var associations = await unitOfWork.UACSCodeCombinationFiscalYearRepository.ToListAsync(query, cancellationToken);

        var validAssociation = associations.FirstOrDefault(x => 
            x.IsValidFrom <= validationDate 
            && (!x.IsValidTo.HasValue || x.IsValidTo.Value >= validationDate));

        if (validAssociation != null)
        {
            return ApiResponse<CodeValidityResponse>.Success(new CodeValidityResponse
            {
                IsValid = true,
                ValidationMessage = "UACS code combination is valid for the specified fiscal year and date.",
                ApplicableFiscalYearId = validAssociation.FiscalYearId,
                EffectiveStartDate = validAssociation.IsValidFrom,
                EffectiveEndDate = validAssociation.IsValidTo,
                IsActive = validAssociation.IsActive
            }, "Code validation completed successfully.");
        }

        return ApiResponse<CodeValidityResponse>.Success(new CodeValidityResponse
        {
            IsValid = false,
            ValidationMessage = "UACS code combination is not valid for the specified fiscal year and date.",
            ApplicableFiscalYearId = null,
            EffectiveStartDate = null,
            EffectiveEndDate = null,
            IsActive = false
        }, "Code validation completed successfully.");
    }
}
