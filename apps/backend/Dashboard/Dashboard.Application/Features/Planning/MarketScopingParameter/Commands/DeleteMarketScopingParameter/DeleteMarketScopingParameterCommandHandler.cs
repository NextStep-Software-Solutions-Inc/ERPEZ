using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.MarketScopingParameter.Commands.DeleteMarketScopingParameter;

public class DeleteMarketScopingParameterCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<DeleteMarketScopingParameterCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(DeleteMarketScopingParameterCommand request, CancellationToken cancellationToken)
    {
        var parameter = await unitOfWork.MarketScopingParameterRepository.GetByIdAsync(request.Id, cancellationToken);

        if (parameter == null)
            throw new NotFoundException("Market Scoping Parameter not found.");

        unitOfWork.MarketScopingParameterRepository.Remove(parameter);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "Market Scoping Parameter deleted successfully.");
    }
}
