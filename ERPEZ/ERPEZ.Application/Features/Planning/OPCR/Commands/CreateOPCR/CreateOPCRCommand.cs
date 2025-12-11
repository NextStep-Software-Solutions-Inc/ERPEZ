using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCR.Commands.CreateOPCR;

public record CreateOPCRCommand : IRequest<ApiResponse<Guid>>
{
    public Guid DeliveryUnitId { get; set; }
    public Guid FiscalYearId { get; set; }
}
