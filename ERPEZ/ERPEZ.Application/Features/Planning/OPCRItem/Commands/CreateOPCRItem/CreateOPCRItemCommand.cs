using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCRItem.Commands.CreateOPCRItem;

public record CreateOPCRItemCommand : IRequest<ApiResponse<Guid>>
{
    public Guid OPCRId { get; init; }
    public Guid KPIAssignmentId { get; init; }
    public bool IsShopped { get; init; }
    public int? Q1Target { get; init; }
    public int? Q2Target { get; init; }
    public int? Q3Target { get; init; }
    public int? Q4Target { get; init; }
}
