using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Budgeting.MarketScoping.Commands.ChangeMarketScopingStatus;

public class ChangeMarketScopingStatusCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<ChangeMarketScopingStatusCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(ChangeMarketScopingStatusCommand command, CancellationToken cancellationToken)
    {
        var request = command.Request;

        var marketScoping = await unitOfWork.MarketScopingRepository.GetByIdAsync(request.MarketScopingId, cancellationToken)
            ?? throw new NotFoundException($"Market Scoping with ID {request.MarketScopingId} not found.");

        // Parse string Status to StatusEnum (validation ensures this will succeed)
        var newStatusEnum = Enum.Parse<StatusEnum>(request.Status, ignoreCase: true);

        // Validate status transition rules
        ValidateStatusTransition(marketScoping.Status, newStatusEnum);

        var previousStatus = marketScoping.Status;
        marketScoping.Status = newStatusEnum;
        unitOfWork.MarketScopingRepository.Update(marketScoping);

        // Record status change in history
        var history = new MarketScopingHistory
        {
            Id = Guid.NewGuid(),
            MarketScopingId = request.MarketScopingId,
            PreviousStatus = previousStatus,
            NewStatus = newStatusEnum,
            ChangeReason = request.ChangeReason,
            ChangedAt = DateTime.UtcNow,
            ChangedBy = "System", // TODO: Get actual user from context
            CreatedAt = DateTime.UtcNow,
        };

        await unitOfWork.MarketScopingHistoryRepository.AddAsync(history, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, $"Market Scoping status updated to {request.Status} successfully.");
    }

    private static void ValidateStatusTransition(StatusEnum currentStatus, StatusEnum newStatus)
    {
        // Define valid status transitions
        var validTransitions = new Dictionary<StatusEnum, StatusEnum[]>
        {
            { StatusEnum.Draft, [StatusEnum.Submitted, StatusEnum.Archived] },
            { StatusEnum.Submitted, [StatusEnum.Approved, StatusEnum.Returned, StatusEnum.Archived] },
            { StatusEnum.Returned, [StatusEnum.Draft, StatusEnum.Submitted, StatusEnum.Archived] },
            { StatusEnum.Approved, [StatusEnum.Active, StatusEnum.Returned, StatusEnum.Archived] },
            { StatusEnum.Active, [StatusEnum.Archived] },
            { StatusEnum.Archived, [StatusEnum.Draft] }
        };

        if (currentStatus == newStatus)
            return; // No change needed

        if (!validTransitions.TryGetValue(currentStatus, out var allowedStatuses))
            throw new BadRequestException($"Status transition from {currentStatus} is not supported.");

        if (!allowedStatuses.Contains(newStatus))
            throw new BadRequestException(
                $"Cannot transition from {currentStatus} to {newStatus}. " +
                $"Valid transitions from {currentStatus}: {string.Join(", ", allowedStatuses)}.");
    }
}
