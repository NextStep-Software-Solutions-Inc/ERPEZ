using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.AgencyProcurementRequest.Commands.AddCatalogItems;

public record AddCatalogItemsToAPRCommand : IRequest<ApiResponse<Guid>>
{
    public Guid APRId { get; init; }
    public List<CatalogItemToAddDto> Items { get; init; } = [];
}

public record CatalogItemToAddDto
{
    public required string ItemCode { get; init; }
    public required string Description { get; init; }
    public string? Unit { get; init; }
    public decimal UnitPrice { get; init; }
    public decimal Quantity { get; init; }
}
