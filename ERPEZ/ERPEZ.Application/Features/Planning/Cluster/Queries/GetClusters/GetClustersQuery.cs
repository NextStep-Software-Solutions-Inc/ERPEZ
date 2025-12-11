using ERPEZ.Application.Common.Queries;
using ERPEZ.Application.Features.Planning.Cluster.Dtos;
using ERPEZ.Shared.Common;

namespace ERPEZ.Application.Features.Planning.Cluster.Queries.GetClusters;

public record GetClustersQuery : PaginatedQuery<PaginatedApiResponse<ClusterResponse>>
{
}
