using ERPEZ.Application.Features.Planning.OPCRPAPDepartment.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCRPAPDepartment.Commands.UpdateOPCRPAPDepartment;

public class UpdateOPCRPAPDepartmentCommand : IRequest<ApiResponse<Domain.Entities.Planning.OPCRPAPDepartment>>
{
    public Guid Id { get; set; }
    public required UpdateOPCRPAPDepartmentDto UpdateOPCRPAPDepartment { get; set; }
}
