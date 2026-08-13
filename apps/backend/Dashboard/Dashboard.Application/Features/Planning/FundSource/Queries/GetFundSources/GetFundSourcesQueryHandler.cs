using ERPEZ.Application.Features.Planning.FiscalYear.Dtos;
using ERPEZ.Application.Features.Planning.FundSource.Dtos;
using ERPEZ.Application.Features.Planning.FundSource.Queries.FundSources;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using Sieve.Models;

namespace ERPEZ.Application.Features.Planning.FundSource.Queries.GetFundSources;

public class GetFundSourcesQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetFundSourcesQuery, PaginatedApiResponse<FundSourceResponse>>
{
    public async Task<PaginatedApiResponse<FundSourceResponse>> Handle(GetFundSourcesQuery query, CancellationToken cancellationToken)
    {
        var page = query.PageNumber < 1 ? 1 : query.PageNumber;
        var pageSize = query.PageSize <= 0 ? 10 : query.PageSize;

        var sieveModel = new SieveModel
        {
            PageSize = pageSize,
            Page = page,
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

        // Add organization filter if provided
        if (query.OrganizationId.HasValue)
        {
            var assignedLinks = await unitOfWork.OrganizationFundSourceRepository.ToListAsync(
                unitOfWork.OrganizationFundSourceRepository.Query(l => l.OrganizationId == query.OrganizationId.Value && l.IsActive),
                cancellationToken);
            var assignedIds = assignedLinks.Select(l => l.FundSourceId).ToList();

            if (assignedIds.Count == 0)
            {
                var emptyFilter = $"Id=={Guid.Empty}";
                sieveModel.Filters = string.IsNullOrEmpty(sieveModel.Filters)
                    ? emptyFilter
                    : $"{sieveModel.Filters},{emptyFilter}";
            }
            else
            {
                var orgFilter = string.Join("|", assignedIds.Select(id => $"Id=={id}"));
                sieveModel.Filters = string.IsNullOrEmpty(sieveModel.Filters)
                    ? orgFilter
                    : $"{sieveModel.Filters},({orgFilter})";
            }
        }

        var (fundSources, totalCount) = await unitOfWork.FundSourceRepository.GetPagedWithNavigationAsync(sieveModel, cancellationToken);

        var response = fundSources.Select(fundSource => new FundSourceResponse
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
        }).ToList();

        return new PaginatedApiResponse<FundSourceResponse>(
            [.. response],
            page,
            pageSize,
            totalCount);
    }
}
