using ERPEZ.Application.Features.Planning.Budgeting.MarketScoping.Validators;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Budgeting.MarketScoping.Commands.LinkMarketScoping;

/// <summary>
/// Lightweight command that only updates the MSF linkage FK(s).
/// Does NOT touch activities or parameters — use UpdateMarketScopingCommand for that.
/// </summary>
public class LinkMarketScopingCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<LinkMarketScopingCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(LinkMarketScopingCommand command, CancellationToken cancellationToken)
    {
        var request = command.Request;

        var marketScoping = await unitOfWork.MarketScopingRepository.GetByIdAsync(command.MarketScopingId, cancellationToken)
            ?? throw new NotFoundException($"Market scoping with ID {command.MarketScopingId} not found.");

        var user = await unitOfWork.UserRepository.GetByIdAsync(marketScoping.UserId, cancellationToken);
        var effectiveOfficeId = user?.OfficeId ?? (request.OfficeId != Guid.Empty ? request.OfficeId : (Guid?)null);

        // Validate mutual exclusivity, LIB scope, and office compatibility
        await MarketScopingTargetValidator.ValidateAsync(
            request.TargetLineItemBudgetId,
            request.TargetLineItemBudgetActivityId,
            effectiveOfficeId,
            unitOfWork,
            cancellationToken,
            command.MarketScopingId);

        // Only update linkage fields — no other MSF data is modified
        marketScoping.TargetLineItemBudgetId = request.TargetLineItemBudgetId;
        marketScoping.TargetLineItemBudgetActivityId = request.TargetLineItemBudgetActivityId;
        marketScoping.UpdatedAt = DateTime.UtcNow;

        await unitOfWork.SaveChangesAsync(cancellationToken);

        return new ApiResponse<Unit>
        {
            Succeeded = true,
            Data = Unit.Value,
            Message = "Market scoping linked successfully."
        };
    }
}
