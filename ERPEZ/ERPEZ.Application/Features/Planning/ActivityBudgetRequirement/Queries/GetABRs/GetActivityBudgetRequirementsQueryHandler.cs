using ERPEZ.Application.Features.Planning.ActivityBudgetRequirement.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using System.Linq.Expressions;

namespace ERPEZ.Application.Features.Planning.ActivityBudgetRequirement.Queries.GetABRs;

public class GetActivityBudgetRequirementsQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetActivityBudgetRequirementsQuery, PaginatedApiResponse<ActivityBudgetRequirementResponse>>
{
    public async Task<PaginatedApiResponse<ActivityBudgetRequirementResponse>> Handle(GetActivityBudgetRequirementsQuery query, CancellationToken cancellationToken)
    {
        var sieveModel = new Sieve.Models.SieveModel
        {
            PageSize = query.PageSize,
            Page = query.PageNumber,
            Filters = query.Filters,
            Sorts = query.Sorts
        };

        Expression<Func<Domain.Entities.Planning.ActivityBudgetRequirement, ActivityBudgetRequirementResponse>> projection = abr => new ActivityBudgetRequirementResponse
        {
            Id = abr.Id,
            WFPObjectiveTargetId = abr.WFPObjectiveTargetId,
            ObjectId = abr.ObjectId,
            ItemDescription = abr.ItemDescription,
            Quantity = abr.Quantity,
            CostEstimates = abr.CostEstimates,
            CreatedAt = abr.CreatedAt,
            CreatedBy = abr.CreatedBy
        };
        var (abrs, totalCount) = await unitOfWork.ActivityBudgetRequirementRepository.GetAllAsync(sieveModel, projection, cancellationToken: cancellationToken);
        return new PaginatedApiResponse<ActivityBudgetRequirementResponse>(
            [.. abrs],
            query.PageNumber,
            query.PageSize,
            totalCount);
    }
}

