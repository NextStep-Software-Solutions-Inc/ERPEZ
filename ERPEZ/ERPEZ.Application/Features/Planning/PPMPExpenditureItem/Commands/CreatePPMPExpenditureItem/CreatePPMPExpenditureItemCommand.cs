using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.PPMPExpenditureItem.Commands.CreatePPMPExpenditureItem;

public record CreatePPMPExpenditureItemCommand : IRequest<ApiResponse<Guid>>
{
    public Guid PPMPActivityId { get; init; }
    public bool IsProcurable { get; init; }
    public decimal TotalCost { get; init; }
}
