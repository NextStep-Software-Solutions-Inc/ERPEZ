using ERPEZ.Application.Features.Planning.EconomicIndicator.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ERPEZ.Application.Features.Planning.EconomicIndicator.Queries.GetEconomicIndicatorById;

public class GetEconomicIndicatorByIdQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetEconomicIndicatorByIdQuery, ApiResponse<EconomicIndicatorResponse>>
{
    public async Task<ApiResponse<EconomicIndicatorResponse>> Handle(GetEconomicIndicatorByIdQuery request, CancellationToken cancellationToken)
    {
        var entity = await unitOfWork.EconomicIndicatorRepository.Query()
            .Include(x => x.FiscalYear)
            .FirstOrDefaultAsync(x => x.Id == request.Id && !x.IsDeleted, cancellationToken);

        if (entity == null)
            throw new NotFoundException("Economic Indicator not found.");

        var response = new EconomicIndicatorResponse
        {
            Id = entity.Id,
            FiscalYearId = entity.FiscalYearId,
            FiscalYearYear = entity.FiscalYear?.Year ?? 0,
            VATRate = entity.VATRate,
            InflationRate = entity.InflationRate,
            IncomeTaxRate = entity.IncomeTaxRate,
            CreatedAt = entity.CreatedAt,
            CreatedBy = entity.CreatedBy,
            UpdatedAt = entity.UpdatedAt,
            UpdatedBy = entity.UpdatedBy
        };

        return ApiResponse<EconomicIndicatorResponse>.Success(response);
    }
}
