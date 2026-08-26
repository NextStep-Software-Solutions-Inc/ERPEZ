using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Cluster.Commands.DeleteCluster;

public record DeleteClusterCommand(Guid Id) : IRequest<ApiResponse<Unit>>;
