using ERPEZ.Application.Features.Planning.Cluster.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Cluster.Queries.GetClusters;

public class GetClustersQuery : IRequest<PaginatedApiResponse<ClusterResponse>>
{
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 10;
    public string? Filters { get; set; }
    public string? Sorts { get; set; }
}
