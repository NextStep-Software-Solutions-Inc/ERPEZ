using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.MarketScopingActivitySettings.Commands.DeleteMarketScopingActivitySettings;

public class DeleteMarketScopingActivitySettingsCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<DeleteMarketScopingActivitySettingsCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(DeleteMarketScopingActivitySettingsCommand request, CancellationToken cancellationToken)
    {
        var activitySettings = await unitOfWork.MarketScopingActivitySettingsRepository.GetByIdAsync(request.Id, cancellationToken);

        if (activitySettings == null)
            throw new NotFoundException("Market Scoping Activity Settings not found.");

        unitOfWork.MarketScopingActivitySettingsRepository.Remove(activitySettings);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "Market Scoping Activity Settings deleted successfully.");
    }
}
