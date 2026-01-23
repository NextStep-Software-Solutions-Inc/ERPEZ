using ERPEZ.Application.Features.Planning.UACSCodeCombination.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using System.Linq.Expressions;

namespace ERPEZ.Application.Features.Planning.UACSCodeCombination.Queries.GetUACSCodeCombinations;

public class GetUACSCodeCombinationsQueryHandler(IUnitOfWork unitOfWork) 
    : IRequestHandler<GetUACSCodeCombinationsQuery, PaginatedApiResponse<UACSCodeCombinationResponse>>
{
    public async Task<PaginatedApiResponse<UACSCodeCombinationResponse>> Handle(GetUACSCodeCombinationsQuery query, CancellationToken cancellationToken)
    {
        var sieveModel = new Sieve.Models.SieveModel
        {
            PageSize = query.PageSize,
            Page = query.PageNumber,
            Filters = query.Filters,
            Sorts = query.Sorts
        };

        Expression<Func<Domain.Entities.Planning.UACSCodeCombination, UACSCodeCombinationResponse>> projection = codeCombination => new UACSCodeCombinationResponse
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
        };

        var (codeCombinations, totalCount) = await unitOfWork.UACSCodeCombinationRepository.GetAllAsync(sieveModel, projection, cancellationToken: cancellationToken);
        return new PaginatedApiResponse<UACSCodeCombinationResponse>(
            [.. codeCombinations],
            query.PageNumber,
            query.PageSize,
            totalCount);
    }
}
