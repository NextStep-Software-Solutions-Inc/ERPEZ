using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Budgeting.MarketScoping.Commands.UnlinkMarketScoping;

/// <summary>
/// Clears both MSF target FK fields without deleting the MSF.
/// Invariant: unlink must never delete the MarketScoping record.
/// </summary>
public class UnlinkMarketScopingCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<UnlinkMarketScopingCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(UnlinkMarketScopingCommand command, CancellationToken cancellationToken)
    {
        var marketScoping = await unitOfWork.MarketScopingRepository.GetByIdAsync(command.MarketScopingId, cancellationToken)
            ?? throw new NotFoundException($"Market scoping with ID {command.MarketScopingId} not found.");

        // Clear both target FKs — MSF continues to exist as an independent record
        marketScoping.TargetLineItemBudgetId = null;
        marketScoping.TargetLineItemBudgetActivityId = null;
        marketScoping.UpdatedAt = DateTime.UtcNow;

        await unitOfWork.SaveChangesAsync(cancellationToken);

        return new ApiResponse<Unit>
        {
            Succeeded = true,
            Data = Unit.Value,
            Message = "Market scoping unlinked successfully. The MSF record has not been deleted."
        };
    }
}
