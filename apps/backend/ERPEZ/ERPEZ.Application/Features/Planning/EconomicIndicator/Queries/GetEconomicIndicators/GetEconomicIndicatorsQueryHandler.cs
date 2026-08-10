using ERPEZ.Application.Features.Planning.EconomicIndicator.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using Sieve.Models;
using System.Linq.Expressions;

namespace ERPEZ.Application.Features.Planning.EconomicIndicator.Queries.GetEconomicIndicators;

public class GetEconomicIndicatorsQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetEconomicIndicatorsQuery, PaginatedApiResponse<EconomicIndicatorResponse>>
{
    public async Task<PaginatedApiResponse<EconomicIndicatorResponse>> Handle(GetEconomicIndicatorsQuery request, CancellationToken cancellationToken)
    {
        var sieveModel = new SieveModel
        {
            Filters = request.Filters,
            Sorts = request.Sorts,
            Page = request.Page,
            PageSize = request.PageSize
        };

        Expression<Func<Domain.Entities.Planning.EconomicIndicator, EconomicIndicatorResponse>> projection = ei => new EconomicIndicatorResponse
        {
            Id = ei.Id,
            FiscalYearId = ei.FiscalYearId,
            FiscalYearYear = ei.FiscalYear != null ? ei.FiscalYear.Year : 0,
            VATRate = ei.VATRate,
            InflationRate = ei.InflationRate,
            IncomeTaxRate = ei.IncomeTaxRate,
            CreatedAt = ei.CreatedAt,
            CreatedBy = ei.CreatedBy,
            UpdatedAt = ei.UpdatedAt,
            UpdatedBy = ei.UpdatedBy
        };

        var (items, totalCount) = await unitOfWork.EconomicIndicatorRepository.GetAllAsync(sieveModel, projection, cancellationToken: cancellationToken);

        return new PaginatedApiResponse<EconomicIndicatorResponse>(items.ToList(), request.Page ?? 1, request.PageSize ?? 10, totalCount);
    }
}
