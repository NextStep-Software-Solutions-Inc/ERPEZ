using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Cluster.Commands.CreateCluster;

public class CreateClusterCommand : IRequest<ApiResponse<Domain.Entities.Planning.Cluster>>
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
}
