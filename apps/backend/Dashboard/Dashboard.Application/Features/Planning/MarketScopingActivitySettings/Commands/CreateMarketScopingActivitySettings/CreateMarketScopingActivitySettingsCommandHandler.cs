using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.MarketScopingActivitySettings.Commands.CreateMarketScopingActivitySettings;

public class CreateMarketScopingActivitySettingsCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<CreateMarketScopingActivitySettingsCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreateMarketScopingActivitySettingsCommand request, CancellationToken cancellationToken)
    {
        var duplicate = await unitOfWork.MarketScopingActivitySettingsRepository.FindAsync(
            x => x.Label == request.Label,
            cancellationToken);

        if (duplicate != null)
            throw new ConflictException("Market Scoping Activity Settings with this label already exists.");

        var activitySettings = new Domain.Entities.Planning.MarketScopingActivitySettings
        {
            ActivityType = request.ActivityType,
            Label = request.Label,
            Description = request.Description,
            SortOrder = request.SortOrder,
            IsActive = true
        };

        await unitOfWork.MarketScopingActivitySettingsRepository.AddAsync(activitySettings, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(activitySettings.Id, "Market Scoping Activity Settings created successfully.");
    }
}
