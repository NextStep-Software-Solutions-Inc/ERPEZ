using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.MarketScopingParameterSettings.Commands.CreateMarketScopingParameterSettings;

public class CreateMarketScopingParameterSettingsCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<CreateMarketScopingParameterSettingsCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreateMarketScopingParameterSettingsCommand request, CancellationToken cancellationToken)
    {
        var duplicate = await unitOfWork.MarketScopingParameterSettingsRepository.FindAsync(
            x => x.Name == request.Name,
            cancellationToken);

        if (duplicate != null)
            throw new ConflictException("Market Scoping Parameter Settings with this name already exists.");

        var parameterSettings = new Domain.Entities.Planning.MarketScopingParameterSettings
        {
            Name = request.Name,
            GuidedQuestion = request.GuidedQuestion,
            Description = request.Description,
            SortOrder = request.SortOrder,
            IsActive = true
        };

        await unitOfWork.MarketScopingParameterSettingsRepository.AddAsync(parameterSettings, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(parameterSettings.Id, "Market Scoping Parameter Settings created successfully.");
    }
}
