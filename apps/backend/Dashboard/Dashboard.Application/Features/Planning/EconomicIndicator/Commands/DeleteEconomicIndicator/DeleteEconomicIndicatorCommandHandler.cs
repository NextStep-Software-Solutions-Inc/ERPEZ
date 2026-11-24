using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.EconomicIndicator.Commands.DeleteEconomicIndicator;

public class DeleteEconomicIndicatorCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<DeleteEconomicIndicatorCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(DeleteEconomicIndicatorCommand request, CancellationToken cancellationToken)
    {
        var entity = await unitOfWork.EconomicIndicatorRepository.GetByIdAsync(request.Id, cancellationToken);
        if (entity == null)
            throw new NotFoundException("Economic Indicator not found.");

        unitOfWork.EconomicIndicatorRepository.Remove(entity);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value);
    }
}
