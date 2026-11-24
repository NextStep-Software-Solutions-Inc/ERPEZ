using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.PPMPExpenditureItem.Commands.CreatePPMPExpenditureItem;

public record CreatePPMPExpenditureItemCommand : IRequest<ApiResponse<Guid>>
{
    public Guid PPMPId { get; init; }
    public Guid? PPMPActivityId { get; init; }
    public Guid ObjectId { get; init; } // ← replaces LineItemBudgetDetailId
    public bool IsProcurable { get; init; }
}