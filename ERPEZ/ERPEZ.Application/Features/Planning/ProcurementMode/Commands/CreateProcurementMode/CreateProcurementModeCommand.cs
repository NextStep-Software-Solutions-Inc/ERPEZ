using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.ProcurementMode.Commands.CreateProcurementMode;

public record CreateProcurementModeCommand : IRequest<ApiResponse<Guid>>
{
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
    public Guid ProcurementCategoryId { get; init; }
}
