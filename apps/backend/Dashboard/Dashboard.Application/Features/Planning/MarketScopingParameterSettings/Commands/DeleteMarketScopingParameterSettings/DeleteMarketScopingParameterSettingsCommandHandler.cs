using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.MarketScopingParameterSettings.Commands.DeleteMarketScopingParameterSettings;

public class DeleteMarketScopingParameterSettingsCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<DeleteMarketScopingParameterSettingsCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(DeleteMarketScopingParameterSettingsCommand request, CancellationToken cancellationToken)
    {
        var parameterSettings = await unitOfWork.MarketScopingParameterSettingsRepository.GetByIdAsync(request.Id, cancellationToken);

        if (parameterSettings == null)
            throw new NotFoundException("Market Scoping Parameter Settings not found.");

        unitOfWork.MarketScopingParameterSettingsRepository.Remove(parameterSettings);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "Market Scoping Parameter Settings deleted successfully.");
    }
}
