using ERPEZ.Shared.Common;
using ERPEZ.Application.Features.Procurement.PurchaseOrders.DTOs;
using ERPEZ.Domain.Interfaces;
using MediatR;
using Sieve.Models;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace ERPEZ.Application.Features.Procurement.PurchaseOrders.Queries.GetPurchaseOrders;

public class GetPurchaseOrdersQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetPurchaseOrdersQuery, PaginatedApiResponse<PurchaseOrderListItemDto>>
{
    public async Task<PaginatedApiResponse<PurchaseOrderListItemDto>> Handle(GetPurchaseOrdersQuery request, CancellationToken cancellationToken)
    {
        var sieveModel = new SieveModel
        {
            Page = request.PageNumber,
            PageSize = request.PageSize,
            Filters = request.Filters,
            Sorts = request.Sorts
        };

        var (entities, totalCount) = await unitOfWork.PurchaseOrderRepository.GetAllAsync(sieveModel, cancellationToken);

        var items = entities.Select(r => new PurchaseOrderListItemDto
        {
            Id = r.Id,
            PONumber = r.PONumber,
            Description = r.Description,
            Status = r.Status,
            Date = r.Date,
            TotalAmount = r.TotalAmount
        }).ToList();

        return new PaginatedApiResponse<PurchaseOrderListItemDto>(items, request.PageNumber, request.PageSize, totalCount);
    }
}
