using ERPEZ.Application.Features.Planning.OPCRKPI.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCRKPI.Commands.CreateOPCRKPI;

public class CreateOPCRKPICommand : IRequest<ApiResponse<OPCRKPIDto>>
{
    public Guid KPIId { get; set; }
    public Guid OPCRId { get; set; }
}
