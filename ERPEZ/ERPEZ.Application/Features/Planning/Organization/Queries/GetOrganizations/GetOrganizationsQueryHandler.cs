using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Organization.Queries.GetOrganizations;

public class GetOrganizationsQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetOrganizationsQuery, PaginatedApiResponse<Domain.Entities.Planning.Organization>>
{
    public async Task<PaginatedApiResponse<Domain.Entities.Planning.Organization>> Handle(GetOrganizationsQuery query, CancellationToken cancellationToken)
    {
        var sieveModel = new Sieve.Models.SieveModel
        {
            PageSize = query.PageSize,
            Page = query.PageNumber,
            Filters = query.Filters,
            Sorts = query.Sorts
        };
        var (organizations, totalCount) = await unitOfWork.OrganizationRepository.GetAllAsync(sieveModel, cancellationToken: cancellationToken);
        return new PaginatedApiResponse<Domain.Entities.Planning.Organization>(
            [.. organizations],
            query.PageNumber,
            query.PageSize,
            totalCount);
    }
}
