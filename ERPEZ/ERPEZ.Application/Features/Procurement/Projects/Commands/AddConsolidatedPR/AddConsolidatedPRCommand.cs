using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.Projects.Commands.AddConsolidatedPR;

public record AddConsolidatedPRCommand : IRequest<ApiResponse<Unit>>
{
    public Guid ProjectId { get; init; }
    public required AddConsolidatedPRRequest Request { get; init; }
}
