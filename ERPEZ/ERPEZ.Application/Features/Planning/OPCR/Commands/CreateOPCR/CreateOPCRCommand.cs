using ERPEZ.Application.Features.Planning.OPCR.Dtos;
using ERPEZ.Shared.Common;
using MediatR;
using Sieve.Attributes;

namespace ERPEZ.Application.Features.Planning.OPCR.Commands.CreateOPCR;

public class CreateOPCRCommand : IRequest<ApiResponse<OPCRDto>>
{
    public Guid DeliveryUnitId { get; set; }
    public int FiscalYear { get; set; }
    public string Status { get; set; } = string.Empty;
}
