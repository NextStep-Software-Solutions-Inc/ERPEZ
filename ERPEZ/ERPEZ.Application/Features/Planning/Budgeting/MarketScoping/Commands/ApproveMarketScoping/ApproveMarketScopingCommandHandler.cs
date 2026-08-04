using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Budgeting.MarketScoping.Commands.ApproveMarketScoping;

public class ApproveMarketScopingCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<ApproveMarketScopingCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(ApproveMarketScopingCommand command, CancellationToken cancellationToken)
    {
        var marketScoping = await unitOfWork.MarketScopingRepository.GetByIdAsync(command.Id, cancellationToken)
            ?? throw new NotFoundException($"Market Scoping with ID {command.Id} not found.");

        if (marketScoping.Status != StatusEnum.Submitted)
        {
            throw new BadRequestException($"Cannot approve Market Scoping with status '{marketScoping.Status}'. Only Submitted forms can be approved.");
        }

        var previousStatus = marketScoping.Status;
        marketScoping.Status = StatusEnum.Approved;
        unitOfWork.MarketScopingRepository.Update(marketScoping);

        var history = new MarketScopingHistory
        {
            Id = Guid.NewGuid(),
            MarketScopingId = command.Id,
            PreviousStatus = previousStatus,
            NewStatus = StatusEnum.Approved,
            ChangeReason = "Approved",
            ChangedAt = DateTime.UtcNow,
            ChangedBy = "System",
            CreatedAt = DateTime.UtcNow,
        };

        await unitOfWork.MarketScopingHistoryRepository.AddAsync(history, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "Market Scoping form approved successfully.");
    }
}
