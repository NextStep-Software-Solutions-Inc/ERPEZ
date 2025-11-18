using ERPEZ.Application.Features.Planning.MFOKPI.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.MFOKPI.Commands.CreateMFOKPI;

public class CreateMFOKPICommand : IRequest<ApiResponse<MFOKPIDto>>
{
    public Guid KPIId { get; set; }
    public Guid MFOPAPId { get; set; }
}
