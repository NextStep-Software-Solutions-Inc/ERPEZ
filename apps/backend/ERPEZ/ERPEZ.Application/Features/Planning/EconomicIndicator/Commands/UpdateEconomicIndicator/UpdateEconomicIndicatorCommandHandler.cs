using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.EconomicIndicator.Commands.UpdateEconomicIndicator;

public class UpdateEconomicIndicatorCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<UpdateEconomicIndicatorCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(UpdateEconomicIndicatorCommand request, CancellationToken cancellationToken)
    {
        var entity = await unitOfWork.EconomicIndicatorRepository.GetByIdAsync(request.Id, cancellationToken);
        if (entity == null)
            throw new NotFoundException("Economic Indicator not found.");

        entity.VATRate = request.VATRate;
        entity.InflationRate = request.InflationRate;
        entity.IncomeTaxRate = request.IncomeTaxRate;

        unitOfWork.EconomicIndicatorRepository.Update(entity);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value);
    }
}
