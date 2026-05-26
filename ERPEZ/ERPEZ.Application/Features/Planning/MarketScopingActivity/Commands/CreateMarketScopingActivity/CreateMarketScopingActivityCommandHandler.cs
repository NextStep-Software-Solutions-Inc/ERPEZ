using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.MarketScopingActivity.Commands.CreateMarketScopingActivity;

public class CreateMarketScopingActivityCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<CreateMarketScopingActivityCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreateMarketScopingActivityCommand request, CancellationToken cancellationToken)
    {
        var marketScoping = await unitOfWork.MarketScopingRepository.GetByIdAsync(request.MarketScopingId, cancellationToken);
        if (marketScoping == null)
            throw new NotFoundException("Market Scoping not found.");

        var activitySettings = await unitOfWork.MarketScopingActivitySettingsRepository.GetByIdAsync(
            request.ActivitySettingsId, cancellationToken);
        if (activitySettings == null)
            throw new NotFoundException("Market Scoping Activity Settings not found.");

        var activity = new Domain.Entities.Planning.MarketScopingActivity
        {
            MarketScopingId = request.MarketScopingId,
            ActivitySettingsId = request.ActivitySettingsId,
            ActivityId = request.ActivitySettingsId
        };

        await unitOfWork.MarketScopingActivityRepository.AddAsync(activity, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(activity.Id, "Market Scoping Activity created successfully.");
    }
}
