using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.ItemPrice.Commands.UpdateItemPrice;

public record UpdateItemPriceCommand(Guid Id) : IRequest<ApiResponse<Unit>>
{
    public Guid ProcurementItemId { get; init; }
    public Guid FiscalYearId { get; init; }
    public decimal UnitPrice { get; init; }
}
