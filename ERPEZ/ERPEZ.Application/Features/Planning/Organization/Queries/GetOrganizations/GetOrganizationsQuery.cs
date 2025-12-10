using ERPEZ.Application.Common.Queries;
using ERPEZ.Shared.Common;

namespace ERPEZ.Application.Features.Planning.Organization.Queries.GetOrganizations;

public record GetOrganizationsQuery : PaginatedQuery<PaginatedApiResponse<Domain.Entities.Planning.Organization>>
{
}
