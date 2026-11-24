using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Budgeting.MarketScoping.Commands.ApproveMarketScoping;

public record ApproveMarketScopingCommand : IRequest<ApiResponse<Unit>>
{
    public Guid Id { get; init; }
    public ApproveMarketScopingRequest? Request { get; init; }
}

public record ApproveMarketScopingRequest
{
    public Guid? SignedDocumentFileId { get; init; }
}
