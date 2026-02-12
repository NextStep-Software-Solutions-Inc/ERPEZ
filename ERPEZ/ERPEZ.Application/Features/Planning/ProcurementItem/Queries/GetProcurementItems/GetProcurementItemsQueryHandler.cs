using ERPEZ.Application.Features.Planning.ProcurementItem.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using System.Linq.Expressions;

namespace ERPEZ.Application.Features.Planning.ProcurementItem.Queries.GetProcurementItems;

public class GetProcurementItemsQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetProcurementItemsQuery, PaginatedApiResponse<ProcurementItemResponse>>
{
    public async Task<PaginatedApiResponse<ProcurementItemResponse>> Handle(
        GetProcurementItemsQuery request,
        CancellationToken cancellationToken)
    {
        Expression<Func<Domain.Entities.Planning.ProcurementItem, ProcurementItemResponse>> projection = x => new ProcurementItemResponse
        {
            Id = x.Id,
            Name = x.Name,
            Specifications = x.Specifications,
            Type = x.Type,
            IsCSE = x.IsCSE,
            ItemLife = x.ItemLife,
            ProductCode = x.ProductCode,
            ImageURL = x.ImageURL,
            IsActive = x.IsActive,
            ObjectCodeId = x.ObjectCodeId,
            ObjectCodeName = x.ObjectCode != null ? x.ObjectCode.Code : string.Empty,
            UNSPSCCodeId = x.UNSPSCCodeId,
            UNSPSCCodeName = x.UNSPSCCode != null ? x.UNSPSCCode.Name : string.Empty,
            UOMId = x.UOMId,
            UOMName = x.UOM != null ? x.UOM.Name : string.Empty,
            CreatedAt = x.CreatedAt,
            UpdatedAt = x.UpdatedAt
        };

        var (items, totalCount) = await unitOfWork.ProcurementItemRepository.GetAllAsync(
            request.SieveModel,
            projection,
            cancellationToken: cancellationToken);

        return new PaginatedApiResponse<ProcurementItemResponse>(
            [.. items],
            request.SieveModel.Page ?? 1,
            request.SieveModel.PageSize ?? 10,
            totalCount);
    }
}
