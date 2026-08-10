using ERPEZ.Application.Features.Procurement.PurchaseOrders.DTOs;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using Sieve.Models;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace ERPEZ.Application.Features.Procurement.PurchaseOrders.Queries.GetPurchaseOrderItems;

public class GetPurchaseOrderItemsQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetPurchaseOrderItemsQuery, PaginatedApiResponse<PurchaseOrderItemDto>>
{
    public async Task<PaginatedApiResponse<PurchaseOrderItemDto>> Handle(GetPurchaseOrderItemsQuery request, CancellationToken cancellationToken)
    {
        var baseFilter = $"PurchaseOrderId=={request.PurchaseOrderId}";
        var finalFilters = string.IsNullOrWhiteSpace(request.Filters) 
            ? baseFilter 
            : $"{baseFilter},{request.Filters}";

        var sieveModel = new SieveModel
        {
            Page = request.PageNumber,
            PageSize = request.PageSize,
            Filters = finalFilters,
            Sorts = request.Sorts
        };

        var (entities, totalCount) = await unitOfWork.PurchaseOrderItemRepository.GetAllAsync(sieveModel, cancellationToken);

        var items = entities.Select(i => new PurchaseOrderItemDto
        {
            Id = i.Id,
            SourceItemId = i.SourceItemId,
            Description = i.Description,
            Quantity = i.Quantity,
            Unit = i.Unit,
            UnitPrice = i.UnitPrice,
            Amount = i.Amount
        }).ToList();

        return new PaginatedApiResponse<PurchaseOrderItemDto>(items, request.PageNumber, request.PageSize, totalCount);
    }
}
