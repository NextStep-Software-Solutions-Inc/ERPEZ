using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.AOBs.Commands.LinkRFQs;

public record LinkRFQsCommand : IRequest<ApiResponse<Unit>>
{
    public required Guid AOBId { get; init; }
    public required List<Guid> RFQIds { get; init; } = [];
}
