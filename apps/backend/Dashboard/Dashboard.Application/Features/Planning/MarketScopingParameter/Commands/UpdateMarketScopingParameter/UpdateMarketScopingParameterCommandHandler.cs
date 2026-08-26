using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.MarketScopingParameter.Commands.UpdateMarketScopingParameter;

public class UpdateMarketScopingParameterCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<UpdateMarketScopingParameterCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(UpdateMarketScopingParameterCommand request, CancellationToken cancellationToken)
    {
        var parameter = await unitOfWork.MarketScopingParameterRepository.GetByIdAsync(request.Id, cancellationToken);

        if (parameter == null)
            throw new NotFoundException("Market Scoping Parameter not found.");

        parameter.IsConsidered = request.UpdateData.IsConsidered;
        parameter.Remarks = request.UpdateData.Remarks;

        unitOfWork.MarketScopingParameterRepository.Update(parameter);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "Market Scoping Parameter updated successfully.");
    }
}
