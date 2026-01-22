using ERPEZ.Application.Features.Planning.UACSCodeCombination.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.UACSCodeCombination.Queries.GetUACSCodeCombinationById;

public class GetUACSCodeCombinationByIdQueryHandler(IUnitOfWork unitOfWork) 
    : IRequestHandler<GetUACSCodeCombinationByIdQuery, ApiResponse<UACSCodeCombinationResponse>>
{
    public async Task<ApiResponse<UACSCodeCombinationResponse>> Handle(GetUACSCodeCombinationByIdQuery request, CancellationToken cancellationToken)
    {
        var query = unitOfWork.UACSCodeCombinationRepository.Query(c => c.Id == request.Id)
            .Select(codeCombination => new UACSCodeCombinationResponse
            {
                Id = codeCombination.Id,
                FundSourceId = codeCombination.FundSourceId,
                OrganizationId = codeCombination.OrganizationId,
                LocationId = codeCombination.LocationId,
                MFOPAPId = codeCombination.MFOPAPId,
                ObjectId = codeCombination.ObjectId,
                CombinationCode = codeCombination.CombinationCode,
                Description = codeCombination.Description,
                IsValid = codeCombination.IsValid,
                FiscalYearId = codeCombination.FiscalYearId,
                EffectiveDate = codeCombination.EffectiveDate,
                ExpiryDate = codeCombination.ExpiryDate,
                IsActive = codeCombination.IsActive,
                CreatedBy = codeCombination.CreatedBy,
                CreatedAt = codeCombination.CreatedAt
            });

        var result = await unitOfWork.UACSCodeCombinationRepository.GetFirstAsync(query, cancellationToken) 
            ?? throw new NotFoundException("UACS code combination not found.");

        return ApiResponse<UACSCodeCombinationResponse>.Success(result, "Retrieved successfully");
    }
}
