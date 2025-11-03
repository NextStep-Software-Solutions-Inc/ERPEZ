using ERPEZ.Application.Features.Planning.OPCR.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCR.Commands.UpdateOPCR;

public class UpdateOPCRCommand : IRequest<ApiResponse<Domain.Entities.Planning.OPCR>>
{
    public Guid Id { get; set; }
    public required UpdateOPCRDto UpdateOPCR { get; set; }
}

