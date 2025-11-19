using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Organization.Queries.GetOrganizations;

public class GetOrganizationsQuery : IRequest<PaginatedApiResponse<Domain.Entities.Planning.Organization>>
{
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 10;
    public string? Filters { get; set; }
    public string? Sorts { get; set; }
}
