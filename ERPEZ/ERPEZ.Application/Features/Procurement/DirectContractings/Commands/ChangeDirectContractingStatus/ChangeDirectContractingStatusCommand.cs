using ERPEZ.Domain.Enums;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.DirectContractings.Commands.ChangeDirectContractingStatus;

public record ChangeDirectContractingStatusCommand : IRequest<ApiResponse<Unit>>
{
    public Guid Id { get; init; }
    public DirectContractingStatusEnum Status { get; init; }
}
