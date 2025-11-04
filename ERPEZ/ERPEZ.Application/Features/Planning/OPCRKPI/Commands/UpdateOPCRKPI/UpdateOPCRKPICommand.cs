using ERPEZ.Application.Features.Planning.OPCRKPI.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCRKPI.Commands.UpdateOPCRKPI;

public class UpdateOPCRKPICommand : IRequest<ApiResponse<Domain.Entities.Planning.OPCRKPI>>
{
    public Guid Id { get; set; }
    public required UpdateOPCRKPIDto UpdateOPCRKPI { get; set; }
}

