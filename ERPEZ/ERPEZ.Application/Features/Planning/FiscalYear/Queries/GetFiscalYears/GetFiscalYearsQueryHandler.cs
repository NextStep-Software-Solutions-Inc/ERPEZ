using ERPEZ.Application.Features.Planning.FiscalYear.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using Sieve.Models;
using System.Linq.Expressions;
using System.Linq;

namespace ERPEZ.Application.Features.Planning.FiscalYear.Queries.GetFiscalYears;

public class GetFiscalYearsQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetFiscalYearsQuery, PaginatedApiResponse<FiscalYearResponse>>
{
    public async Task<PaginatedApiResponse<FiscalYearResponse>> Handle(GetFiscalYearsQuery query, CancellationToken cancellationToken)
    {
        var sieveModel = new SieveModel
        {
            Page = query.PageNumber,
            PageSize = query.PageSize,
            Filters = query.Filters,
            Sorts = query.Sorts
        };

        Expression<Func<Domain.Entities.Planning.FiscalYear, FiscalYearResponse>> projection = fy => new FiscalYearResponse
        {
            Id = fy.Id,
            Year = fy.Year,
            Description = fy.Description,
            IsLocked = fy.IsLocked,
            FunctionAllocations = fy.FunctionAllocations.Select(fa => new FunctionAllocationResponse
            {
                Id = fa.Id,
                FunctionType = fa.FunctionType,
                Percentage = fa.Percentage
            }).ToList()
        };

        var (items, totalCount) = await unitOfWork.FiscalYearRepository.GetAllAsync(sieveModel, projection, cancellationToken: cancellationToken);

        return new PaginatedApiResponse<FiscalYearResponse>(items.ToList(), query.PageNumber, query.PageSize, totalCount);
    }
}
