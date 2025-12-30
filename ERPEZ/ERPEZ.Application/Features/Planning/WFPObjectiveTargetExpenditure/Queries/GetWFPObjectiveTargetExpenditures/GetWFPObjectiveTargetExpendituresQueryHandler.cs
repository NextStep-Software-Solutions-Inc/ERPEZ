using ERPEZ.Application.Features.Planning.Object.Dtos;
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
                Parent = abr.Object.ParentObject != null ? new ObjectResponse()
                {
                    Id = abr.Object.ParentObject.Id,
                    Name = abr.Object.ParentObject.Name,
                    Code = abr.Object.ParentObject.Code,
                    IsActive = abr.Object.ParentObject.IsActive,
                    Parent = abr.Object.ParentObject.ParentObject != null ? new ObjectResponse()
                    {
                        Id = abr.Object.ParentObject.ParentObject.Id,
                        Name = abr.Object.ParentObject.ParentObject.Name,
                        Code = abr.Object.ParentObject.ParentObject.Code,
                        IsActive = abr.Object.ParentObject.ParentObject.IsActive,
                        Parent = abr.Object.ParentObject.ParentObject.ParentObject != null ? new ObjectResponse()
                        {
                            Id = abr.Object.ParentObject.ParentObject.ParentObject.Id,
                            Name = abr.Object.ParentObject.ParentObject.ParentObject.Name,
                            Code = abr.Object.ParentObject.ParentObject.ParentObject.Code,
                            IsActive = abr.Object.ParentObject.ParentObject.ParentObject.IsActive
                        } : null
                    } : null
                } : null,
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

