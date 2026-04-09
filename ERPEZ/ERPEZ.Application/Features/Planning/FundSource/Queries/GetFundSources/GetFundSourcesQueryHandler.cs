using ERPEZ.Application.Features.Planning.FiscalYear.Dtos;
using ERPEZ.Application.Features.Planning.FundSource.Dtos;
using ERPEZ.Application.Features.Planning.FundSource.Queries.FundSources;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using System.Linq.Expressions;

namespace ERPEZ.Application.Features.Planning.FundSource.Queries.GetFundSources;

public class GetFundSourcesQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetFundSourcesQuery, PaginatedApiResponse<FundSourceResponse>>
{
    public async Task<PaginatedApiResponse<FundSourceResponse>> Handle(GetFundSourcesQuery query, CancellationToken cancellationToken)
    {
        var sieveModel = new Sieve.Models.SieveModel
        {
            PageSize = query.PageSize,
            Page = query.PageNumber,
            Filters = query.Filters,
            Sorts = query.Sorts
        };

        // Add fiscal year filter to Sieve filters if provided
        if (query.FiscalYearId.HasValue)
        {
            var fiscalYearFilter = $"FiscalYearId=={query.FiscalYearId.Value}";
            sieveModel.Filters = string.IsNullOrEmpty(sieveModel.Filters) 
                ? fiscalYearFilter 
                : $"{sieveModel.Filters},{fiscalYearFilter}";
        }

        Expression<Func<Domain.Entities.Planning.FundSource, FundSourceResponse>> projection = fundSource => new FundSourceResponse
        {
            Id = fundSource.Id,
            ParentId = fundSource.ParentId,
            Parent = fundSource.ParentSource != null ? new FundSourceResponse
            {
                Id = fundSource.ParentSource.Id,
                ParentId = fundSource.ParentSource.ParentId,
                Name = fundSource.ParentSource.Name,
                Code = fundSource.ParentSource.Code,
                Type = fundSource.ParentSource.Type.ToString(),
                TotalDUAllocatedFunds = 0m,
                TotalReceivedFunds = 0m,
                IsActive = fundSource.ParentSource.IsActive,
                FiscalYearId = fundSource.ParentSource.FiscalYearId,
                CreatedBy = fundSource.ParentSource.CreatedBy,
                CreatedAt = fundSource.ParentSource.CreatedAt
            } : null,
            Name = fundSource.Name,
            Code = fundSource.Code,
            Type = fundSource.Type.ToString(),
            TotalDUAllocatedFunds = 0m,
            TotalReceivedFunds = 0m,
            IsActive = fundSource.IsActive,
            FiscalYearId = fundSource.FiscalYearId,
            FiscalYear = fundSource.FiscalYear != null ? new FiscalYearResponse
            {
                Id = fundSource.FiscalYear.Id,
                Year = fundSource.FiscalYear.Year,
                Description = fundSource.FiscalYear.Description,
                Status = fundSource.FiscalYear.Status.ToString(),
                IsLocked = fundSource.FiscalYear.IsLocked,
                StartDate = fundSource.FiscalYear.StartDate,
                EndDate = fundSource.FiscalYear.EndDate
            } : null,
            CreatedBy = fundSource.CreatedBy,
            CreatedAt = fundSource.CreatedAt
        };

        var (fundSources, totalCount) = await unitOfWork.FundSourceRepository.GetAllAsync(sieveModel, projection, cancellationToken);
        return new PaginatedApiResponse<FundSourceResponse>(
            [.. fundSources],
            query.PageNumber,
            query.PageSize,
            totalCount);
    }
}
