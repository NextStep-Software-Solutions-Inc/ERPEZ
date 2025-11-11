using ERPEZ.Application.Features.Planning.Cluster.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Cluster.Commands.CreateCluster;

public class CreateClusterCommand : IRequest<ApiResponse<ClusterResponse>>
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
}
