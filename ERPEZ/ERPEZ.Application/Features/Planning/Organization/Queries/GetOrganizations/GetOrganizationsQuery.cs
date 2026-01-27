using ERPEZ.Application.Common.Queries;
using ERPEZ.Application.Features.Planning.Organization.Dtos;
using ERPEZ.Shared.Common;

namespace ERPEZ.Application.Features.Planning.Organization.Queries.GetOrganizations;

public record GetOrganizationsQuery : PaginatedQuery<PaginatedApiResponse<OrganizationResponse>>
{
}
