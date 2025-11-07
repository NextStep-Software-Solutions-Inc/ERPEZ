using ERPEZ.Application.Features.Planning.KPI.Queries.GetKPIsQuery;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.ActivityBudgetRequirement.Queries.GetABRs;

public class GetActivityBudgetRequirementsQueryHandler(IUnitOfWork _unitOfWork) : IRequestHandler<GetActivityBudgetRequirementsQuery, PaginatedApiResponse<Domain.Entities.Planning.ActivityBudgetRequirement>>
{
    public async Task<PaginatedApiResponse<Domain.Entities.Planning.ActivityBudgetRequirement>> Handle(GetActivityBudgetRequirementsQuery query, CancellationToken cancellationToken)
    {
        var sieveModel = new Sieve.Models.SieveModel
        {
            PageSize = query.PageSize,
            Page = query.PageNumber,
            Filters = query.Filters,
            Sorts = query.Sorts
        };
        var (abrs, totalCount) = await _unitOfWork.ActivityBudgetRequirementRepository.GetAllAsync(sieveModel, cancellationToken: cancellationToken);
        return new PaginatedApiResponse<Domain.Entities.Planning.ActivityBudgetRequirement>(
            [.. abrs],
            query.PageNumber,
            query.PageSize,
            totalCount);
    }
}

