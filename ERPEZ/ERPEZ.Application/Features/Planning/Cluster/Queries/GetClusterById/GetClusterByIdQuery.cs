using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Cluster.Queries.GetClusterById;

public record class GetClusterByIdQuery(Guid Id) : IRequest<ApiResponse<Domain.Entities.Planning.Cluster>>;
