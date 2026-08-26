using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.MarketScopingParameterSettings.Commands.UpdateMarketScopingParameterSettings;

public class UpdateMarketScopingParameterSettingsCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<UpdateMarketScopingParameterSettingsCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(UpdateMarketScopingParameterSettingsCommand request, CancellationToken cancellationToken)
    {
        var parameterSettings = await unitOfWork.MarketScopingParameterSettingsRepository.GetByIdAsync(request.Id, cancellationToken);

        if (parameterSettings == null)
            throw new NotFoundException("Market Scoping Parameter Settings not found.");

        var duplicate = await unitOfWork.MarketScopingParameterSettingsRepository.FindAsync(
            x => x.Name == request.UpdateData.Name && x.Id != request.Id,
            cancellationToken);

        if (duplicate != null)
            throw new ConflictException("Market Scoping Parameter Settings with this name already exists.");

        parameterSettings.Name = request.UpdateData.Name;
        parameterSettings.GuidedQuestion = request.UpdateData.GuidedQuestion;
        parameterSettings.Description = request.UpdateData.Description;
        parameterSettings.SortOrder = request.UpdateData.SortOrder;
        parameterSettings.IsActive = request.UpdateData.IsActive;

        unitOfWork.MarketScopingParameterSettingsRepository.Update(parameterSettings);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "Market Scoping Parameter Settings updated successfully.");
    }
}
