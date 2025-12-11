using ERPEZ.Application.Features.Planning.OPCRPAPDepartment.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCRPAPDepartment.Commands.CreateOPCRPAPDepartment;

public class CreateOPCRPAPDepartmentCommand : IRequest<ApiResponse<OPCRPAPDepartmentResponse>>
{
    public Guid OPCRActivityId { get; set; }
    public Guid DeliveryUnitId { get; set; }
}
