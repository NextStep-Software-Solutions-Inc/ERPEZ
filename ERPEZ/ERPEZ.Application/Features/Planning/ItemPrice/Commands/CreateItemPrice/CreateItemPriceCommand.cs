using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.ItemPrice.Commands.CreateItemPrice;

public record CreateItemPriceCommand : IRequest<ApiResponse<Guid>>
{
    public Guid ProcurementItemId { get; init; }
    public Guid FiscalYearId { get; init; }
    public decimal UnitPrice { get; init; }
}
