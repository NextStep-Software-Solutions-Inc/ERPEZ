using ERPEZ.Application.Features.Planning.WFPObjectiveTarget.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using System.Linq.Expressions;

namespace ERPEZ.Application.Features.Planning.WFPObjectiveTarget.Queries.GetWFPObjectiveTargets;

public class GetWFPObjectiveTargetsQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetWFPObjectiveTargetsQuery, PaginatedApiResponse<WFPObjectiveTargetResponse>>
{
    public async Task<PaginatedApiResponse<WFPObjectiveTargetResponse>> Handle(GetWFPObjectiveTargetsQuery query, CancellationToken cancellationToken)
    {
        var sieveModel = new Sieve.Models.SieveModel
        {
            PageSize = query.PageSize,
            Page = query.PageNumber,
            Filters = query.Filters,
            Sorts = query.Sorts
        };

        Expression<Func<Domain.Entities.Planning.WFPObjectiveTarget, WFPObjectiveTargetResponse>> projection = x => new WFPObjectiveTargetResponse
        {
            Id = x.Id,
            WFPObjectiveId = x.WFPObjectiveId,
            ActivityName = x.ActivityName,
            Indicator = x.Indicator,
            Weight = x.Weight,
            CreatedAt = x.CreatedAt,
            CreatedBy = x.CreatedBy
        };
        var (wfpObjectiveTargets, totalCount) = await unitOfWork.WFPObjectiveTargetRepository.GetAllAsync(sieveModel, projection, cancellationToken: cancellationToken);

        return new PaginatedApiResponse<WFPObjectiveTargetResponse>(
            [.. wfpObjectiveTargets],
            query.PageNumber,
            query.PageSize,
            totalCount
            );
    }
}

