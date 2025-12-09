using ERPEZ.Application.Features.Planning.OPCR.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCR.Commands.UpdateOPCRStatus;

public record UpdateOPCRStatusCommand : IRequest<ApiResponse<Unit>>
{
    public Guid Id { get; set; }
    public required UpdateOPCRStatusRequest UpdateOPCRStatus { get; set; }
}