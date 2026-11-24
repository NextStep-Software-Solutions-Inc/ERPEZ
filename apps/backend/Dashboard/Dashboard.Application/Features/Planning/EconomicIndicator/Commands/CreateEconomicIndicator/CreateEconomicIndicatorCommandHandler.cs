using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.EconomicIndicator.Commands.CreateEconomicIndicator;

public class CreateEconomicIndicatorCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<CreateEconomicIndicatorCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreateEconomicIndicatorCommand request, CancellationToken cancellationToken)
    {
        var fiscalYear = await unitOfWork.FiscalYearRepository.GetByIdAsync(request.FiscalYearId, cancellationToken);
        if (fiscalYear == null)
            throw new NotFoundException("Fiscal Year not found.");

        var existingIndicator = await unitOfWork.EconomicIndicatorRepository.FindAsync(
            x => x.FiscalYearId == request.FiscalYearId,
            cancellationToken);

        if (existingIndicator != null)
            throw new ConflictException("Economic Indicator already exists for this Fiscal Year. Only one Economic Indicator is allowed per Fiscal Year.");

        var entity = new Domain.Entities.Planning.EconomicIndicator
        {
            Id = Guid.NewGuid(),
            FiscalYearId = request.FiscalYearId,
            VATRate = request.VATRate,
            InflationRate = request.InflationRate,
            IncomeTaxRate = request.IncomeTaxRate
        };

        await unitOfWork.EconomicIndicatorRepository.AddAsync(entity, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(entity.Id);
    }
}
