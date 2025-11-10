using ERPEZ.Application.Features.Planning.Cluster.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Cluster.Commands.UpdateCluster;

public class UpdateClusterCommand : IRequest<ApiResponse<Domain.Entities.Planning.Cluster>>
{
    public Guid Id { get; set; }
    public required UpdateClusterDto UpdateCluster { get; set; }
}

