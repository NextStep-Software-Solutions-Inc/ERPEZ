using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Budgeting.MarketScoping.Commands.ReturnMarketScoping;

public class ReturnMarketScopingCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<ReturnMarketScopingCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(ReturnMarketScopingCommand command, CancellationToken cancellationToken)
    {
        var marketScoping = await unitOfWork.MarketScopingRepository.GetByIdAsync(command.Id, cancellationToken)
            ?? throw new NotFoundException($"Market Scoping with ID {command.Id} not found.");

        if (marketScoping.Status != StatusEnum.Submitted)
        {
            throw new BadRequestException($"Cannot return Market Scoping with status '{marketScoping.Status}'. Only Submitted forms can be returned for revision.");
        }

        var previousStatus = marketScoping.Status;
        marketScoping.Status = StatusEnum.Returned;
        unitOfWork.MarketScopingRepository.Update(marketScoping);

        var history = new MarketScopingHistory
        {
            Id = Guid.NewGuid(),
            MarketScopingId = command.Id,
            PreviousStatus = previousStatus,
            NewStatus = StatusEnum.Returned,
            ChangeReason = string.IsNullOrWhiteSpace(command.Remarks) ? "Returned for revision" : command.Remarks,
            ChangedAt = DateTime.UtcNow,
            ChangedBy = "System",
            CreatedAt = DateTime.UtcNow,
        };

        await unitOfWork.MarketScopingHistoryRepository.AddAsync(history, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "Market Scoping form returned for revision successfully.");
    }
}
