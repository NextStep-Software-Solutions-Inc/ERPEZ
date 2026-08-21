using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.PPMPExpenditureItem.Commands.UpdatePPMPExpenditureItem;

public record UpdatePPMPExpenditureItemCommand : IRequest<ApiResponse<Guid>>
{
    public Guid Id { get; init; }
    public Guid? PPMPActivityId { get; init; }
    public Guid? ObjectId { get; init; }
    public bool? IsProcurable { get; init; }
    public decimal? TotalCost { get; init; }
}
