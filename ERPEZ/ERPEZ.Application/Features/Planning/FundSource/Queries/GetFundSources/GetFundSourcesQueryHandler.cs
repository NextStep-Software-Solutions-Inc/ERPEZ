using ERPEZ.Application.Features.Planning.FiscalYear.Dtos;
using ERPEZ.Application.Features.Planning.FundSource.Dtos;
using ERPEZ.Application.Features.Planning.FundSource.Queries.FundSources;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Sieve.Services;

namespace ERPEZ.Application.Features.Planning.FundSource.Queries.GetFundSources;

public class GetFundSourcesQueryHandler(IUnitOfWork unitOfWork, ISieveProcessor sieveProcessor) : IRequestHandler<GetFundSourcesQuery, PaginatedApiResponse<FundSourceResponse>>
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

        // Get query with navigation properties included (handled in repository)
        var baseQuery = unitOfWork.FundSourceRepository.GetAllWithNavigation();

        // Apply Sieve filtering/sorting
        var filteredQuery = sieveProcessor.Apply(sieveModel, baseQuery, applyPagination: false);
        var totalCount = await filteredQuery.CountAsync(cancellationToken);

        // Apply pagination
        var paginatedQuery = sieveProcessor.Apply(sieveModel, filteredQuery, applyFiltering: false, applySorting: false);

        // Project to DTO
        var fundSources = await paginatedQuery
            .Select(fundSource => new FundSourceResponse
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
            })
            .ToListAsync(cancellationToken);

        return new PaginatedApiResponse<FundSourceResponse>(
            [.. fundSources],
            query.PageNumber,
            query.PageSize,
            totalCount);
    }
}
