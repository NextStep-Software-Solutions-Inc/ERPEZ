using ERPEZ.Application.Features.Planning.Cluster.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Cluster.Queries.GetClusterById;

public record GetClusterByIdQuery(Guid Id) : IRequest<ApiResponse<ClusterResponse>>;
