using ERPEZ.Application.Features.Planning.WFPObjectiveTargetExpenditure.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using System.Linq.Expressions;

namespace ERPEZ.Application.Features.Planning.WFPObjectiveTargetExpenditure.Queries.GetWFPObjectiveTargetExpenditures;

public class GetWFPObjectiveTargetExpendituresQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetWFPObjectiveTargetExpendituresQuery, PaginatedApiResponse<WFPObjectiveTargetExpenditureResponse>>
{
    public async Task<PaginatedApiResponse<WFPObjectiveTargetExpenditureResponse>> Handle(GetWFPObjectiveTargetExpendituresQuery query, CancellationToken cancellationToken)
    {
        var sieveModel = new Sieve.Models.SieveModel
        {
            PageSize = query.PageSize,
            Page = query.PageNumber,
            Filters = query.Filters,
            Sorts = query.Sorts
        };

        Expression<Func<Domain.Entities.Planning.WFPObjectiveTargetExpenditure, WFPObjectiveTargetExpenditureResponse>> projection = abr => new WFPObjectiveTargetExpenditureResponse
        {
            Id = abr.Id,
            WFPObjectiveTargetId = abr.WFPObjectiveTargetId,
            Object = new()
            {
                Id = abr.Object.Id,
                ParentId = abr.Object.ParentId,
                Name = abr.Object.Name,
                Code = abr.Object.Code,
            },
            ItemDescription = abr.ItemDescription ?? string.Empty,
            Quantity = abr.Quantity,
            CostEstimates = abr.CostEstimates,
            CreatedAt = abr.CreatedAt,
            CreatedBy = abr.CreatedBy ?? string.Empty
        };
        var (abrs, totalCount) = await unitOfWork.WFPObjectiveTargetExpenditureRepository.GetAllAsync(sieveModel, projection, cancellationToken: cancellationToken);
        return new PaginatedApiResponse<WFPObjectiveTargetExpenditureResponse>(
            [.. abrs],
            query.PageNumber,
            query.PageSize,
            totalCount);
    }
}

