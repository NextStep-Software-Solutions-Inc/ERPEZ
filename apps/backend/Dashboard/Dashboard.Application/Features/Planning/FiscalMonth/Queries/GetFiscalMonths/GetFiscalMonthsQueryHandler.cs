using ERPEZ.Application.Features.Planning.FiscalMonth.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using Sieve.Models;
using System.Linq.Expressions;
using FiscalMonthEntity = ERPEZ.Domain.Entities.Planning.FiscalMonth;

namespace ERPEZ.Application.Features.Planning.FiscalMonth.Queries.GetFiscalMonths;

public class GetFiscalMonthsQueryHandler(IUnitOfWork unitOfWork) 
    : IRequestHandler<GetFiscalMonthsQuery, PaginatedApiResponse<FiscalMonthResponse>>
{
    public async Task<PaginatedApiResponse<FiscalMonthResponse>> Handle(GetFiscalMonthsQuery query, CancellationToken cancellationToken)
    {
        var sieveModel = new SieveModel
        {
            PageSize = query.PageSize,
            Page = query.PageNumber,
            Filters = query.Filters,
            Sorts = query.Sorts ?? "MonthIndex"
        };

        Expression<Func<FiscalMonthEntity, FiscalMonthResponse>> projection = month => new FiscalMonthResponse
        {
            Id = month.Id,
            FiscalYearId = month.FiscalYearId,
            Name = month.Name,
            MonthIndex = month.MonthIndex,
            IsLocked = month.IsLocked,
            ModifiedByUserId = month.ModifiedByUserId,
            CreatedAt = month.CreatedAt
        };

        var (fiscalMonths, totalCount) = await unitOfWork.FiscalMonthRepository.GetAllAsync(sieveModel, projection, cancellationToken);

        return new PaginatedApiResponse<FiscalMonthResponse>(
            [.. fiscalMonths],
            query.PageNumber,
            query.PageSize,
            totalCount);
    }
}
