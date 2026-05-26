using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.MarketScopingParameter.Commands.CreateMarketScopingParameter;

public class CreateMarketScopingParameterCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<CreateMarketScopingParameterCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreateMarketScopingParameterCommand request, CancellationToken cancellationToken)
    {
        var marketScoping = await unitOfWork.MarketScopingRepository.GetByIdAsync(request.MarketScopingId, cancellationToken);
        if (marketScoping == null)
            throw new NotFoundException("Market Scoping not found.");

        var parameterSettings = await unitOfWork.MarketScopingParameterSettingsRepository.GetByIdAsync(
            request.ParameterSettingsId, cancellationToken);
        if (parameterSettings == null)
            throw new NotFoundException("Market Scoping Parameter Settings not found.");

        var parameter = new Domain.Entities.Planning.MarketScopingParameter
        {
            MarketScopingId = request.MarketScopingId,
            ParameterSettingsId = request.ParameterSettingsId,
            ParameterId = request.ParameterSettingsId,
            IsConsidered = request.IsConsidered,
            Remarks = request.Remarks
        };

        await unitOfWork.MarketScopingParameterRepository.AddAsync(parameter, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(parameter.Id, "Market Scoping Parameter created successfully.");
    }
}
