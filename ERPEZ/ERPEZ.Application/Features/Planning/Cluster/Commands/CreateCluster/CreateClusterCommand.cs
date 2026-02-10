using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Cluster.Commands.CreateCluster;

public class CreateClusterCommand : IRequest<ApiResponse<Guid>>
{
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string? Address { get; set; }
    public int? MaxSubUnits { get; set; }
}
