using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.MarketScopingActivitySettings.Commands.UpdateMarketScopingActivitySettings;

public class UpdateMarketScopingActivitySettingsCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<UpdateMarketScopingActivitySettingsCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(UpdateMarketScopingActivitySettingsCommand request, CancellationToken cancellationToken)
    {
        var activitySettings = await unitOfWork.MarketScopingActivitySettingsRepository.GetByIdAsync(request.Id, cancellationToken);

        if (activitySettings == null)
            throw new NotFoundException("Market Scoping Activity Settings not found.");

        var duplicate = await unitOfWork.MarketScopingActivitySettingsRepository.FindAsync(
            x => x.Label == request.UpdateData.Label && x.Id != request.Id,
            cancellationToken);

        if (duplicate != null)
            throw new ConflictException("Market Scoping Activity Settings with this label already exists.");

        activitySettings.ActivityType = request.UpdateData.ActivityType;
        activitySettings.Label = request.UpdateData.Label;
        activitySettings.Description = request.UpdateData.Description;
        activitySettings.SortOrder = request.UpdateData.SortOrder;
        activitySettings.IsActive = request.UpdateData.IsActive;

        unitOfWork.MarketScopingActivitySettingsRepository.Update(activitySettings);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "Market Scoping Activity Settings updated successfully.");
    }
}
