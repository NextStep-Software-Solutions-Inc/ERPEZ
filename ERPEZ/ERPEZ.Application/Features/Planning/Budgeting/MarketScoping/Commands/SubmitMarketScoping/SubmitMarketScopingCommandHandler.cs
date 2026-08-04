using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Budgeting.MarketScoping.Commands.SubmitMarketScoping;

public class SubmitMarketScopingCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<SubmitMarketScopingCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(SubmitMarketScopingCommand command, CancellationToken cancellationToken)
    {
        var marketScoping = await unitOfWork.MarketScopingRepository.GetByIdAsync(command.Id, cancellationToken)
            ?? throw new NotFoundException($"Market Scoping with ID {command.Id} not found.");

        if (marketScoping.Status != StatusEnum.Draft && marketScoping.Status != StatusEnum.Returned)
        {
            throw new BadRequestException($"Cannot submit Market Scoping with status '{marketScoping.Status}'. Only Draft or Returned forms can be submitted.");
        }

        var previousStatus = marketScoping.Status;
        marketScoping.Status = StatusEnum.Submitted;
        unitOfWork.MarketScopingRepository.Update(marketScoping);

        var history = new MarketScopingHistory
        {
            Id = Guid.NewGuid(),
            MarketScopingId = command.Id,
            PreviousStatus = previousStatus,
            NewStatus = StatusEnum.Submitted,
            ChangeReason = "Submitted for approval",
            ChangedAt = DateTime.UtcNow,
            ChangedBy = "System",
            CreatedAt = DateTime.UtcNow,
        };

        await unitOfWork.MarketScopingHistoryRepository.AddAsync(history, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "Market Scoping form submitted for approval successfully.");
    }
}
