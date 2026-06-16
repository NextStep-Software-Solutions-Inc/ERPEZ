// UpdateOPCRCommitmentStatusCommand.cs
using ERPEZ.Application.Features.Planning.OPCR.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCR.Commands.UpdateOPCRCommitmentStatus;

public record UpdateOPCRCommitmentStatusCommand : IRequest<ApiResponse<Unit>>
{
    public Guid Id { get; set; }
    public required UpdateOPCRCommitmentStatusRequest Request { get; set; }
}
