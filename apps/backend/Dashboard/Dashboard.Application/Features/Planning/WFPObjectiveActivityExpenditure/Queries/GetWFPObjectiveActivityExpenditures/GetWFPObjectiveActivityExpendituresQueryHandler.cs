using ERPEZ.Application.Features.Planning.Object.Dtos;
using ERPEZ.Application.Features.Planning.WFPObjectiveActivityExpenditure.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using System.Linq.Expressions;

namespace ERPEZ.Application.Features.Planning.WFPObjectiveActivityExpenditure.Queries.GetWFPObjectiveActivityExpenditures;

public class GetWFPObjectiveActivityExpendituresQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetWFPObjectiveActivityExpendituresQuery, PaginatedApiResponse<WFPObjectiveActivityExpenditureResponse>>
{
    public async Task<PaginatedApiResponse<WFPObjectiveActivityExpenditureResponse>> Handle(GetWFPObjectiveActivityExpendituresQuery query, CancellationToken cancellationToken)
    {
        var sieveModel = new Sieve.Models.SieveModel
        {
            PageSize = query.PageSize,
            Page = query.PageNumber,
            Filters = query.Filters,
            Sorts = query.Sorts
        };

        Expression<Func<Domain.Entities.Planning.WFPObjectiveActivityExpenditure, WFPObjectiveActivityExpenditureResponse>> projection = abr => new WFPObjectiveActivityExpenditureResponse
        {
            Id = abr.Id,
            WFPObjectiveActivityId = abr.WFPObjectiveActivityId,
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
            Quantity = abr.Quantity ?? 0,
            UnitCost = abr.UnitCost ?? 0,
            CreatedAt = abr.CreatedAt,
            CreatedBy = abr.CreatedBy ?? string.Empty
        };
        var (abrs, totalCount) = await unitOfWork.WFPObjectiveActivityExpenditureRepository.GetAllAsync(sieveModel, projection, cancellationToken: cancellationToken);
        return new PaginatedApiResponse<WFPObjectiveActivityExpenditureResponse>(
            [.. abrs],
            query.PageNumber,
            query.PageSize,
            totalCount);
    }
}

