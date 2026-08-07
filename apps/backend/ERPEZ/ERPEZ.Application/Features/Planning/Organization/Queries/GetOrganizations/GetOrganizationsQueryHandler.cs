using ERPEZ.Application.Features.Planning.Organization.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using System.Linq.Expressions;

namespace ERPEZ.Application.Features.Planning.Organization.Queries.GetOrganizations;

public class GetOrganizationsQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetOrganizationsQuery, PaginatedApiResponse<OrganizationResponse>>
{
    public async Task<PaginatedApiResponse<OrganizationResponse>> Handle(GetOrganizationsQuery query, CancellationToken cancellationToken)
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

        Expression<Func<Domain.Entities.Planning.Organization, OrganizationResponse>> projection = org => new OrganizationResponse
        {
            Id = org.Id,
            ParentId = org.ParentId,
            Name = org.Name,
            Code = org.Code,
            Type = org.Type,
            IsActive = org.IsActive,
            FiscalYearId = org.FiscalYearId
        };

        var (organizations, totalCount) = await unitOfWork.OrganizationRepository.GetAllAsync(sieveModel, projection, cancellationToken);
        return new PaginatedApiResponse<OrganizationResponse>(
            [.. organizations],
            query.PageNumber,
            query.PageSize,
            totalCount);
    }
}
