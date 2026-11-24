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
        var marketScoping = await unitOfWork.MarketScopingRepository.GetByIdWithDetailsAsync(command.Id, cancellationToken)
            ?? throw new NotFoundException($"Market Scoping with ID {command.Id} not found.");

        if (marketScoping.Status != StatusEnum.Draft && marketScoping.Status != StatusEnum.Returned)
        {
            throw new BadRequestException($"Cannot submit Market Scoping with status '{marketScoping.Status}'. Only Draft or Returned forms can be submitted.");
        }

        if (marketScoping.ActivitiesConducted.Count == 0)
        {
            throw new BadRequestException("At least one market scoping activity must be conducted before submitting for approval.");
        }

        if (marketScoping.ActivitiesConducted.Any(a => a.Attachments.Count == 0))
        {
            throw new BadRequestException("All conducted activities must have supporting documents before submitting for approval.");
        }

        var activeParameters = await unitOfWork.MarketScopingParameterSettingsRepository
            .FindAllAsync(p => p.IsActive, cancellationToken);
        var requiredParamCount = activeParameters.Count > 0 ? activeParameters.Count : 6;

        if (marketScoping.ParameterEvaluations.Count < requiredParamCount)
        {
            throw new BadRequestException($"All {requiredParamCount} NGPA parameters must be evaluated before submitting for approval.");
        }

        if (marketScoping.ParameterEvaluations.Any(p => string.IsNullOrWhiteSpace(p.Remarks)))
        {
            throw new BadRequestException("All NGPA parameters must have recommendations/findings provided before submitting for approval.");
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
