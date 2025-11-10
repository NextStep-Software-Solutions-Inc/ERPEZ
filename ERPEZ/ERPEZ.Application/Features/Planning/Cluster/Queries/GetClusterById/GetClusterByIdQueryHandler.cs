using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Cluster.Queries.GetClusterById;

public class GetClusterByIdQueryHandler(IUnitOfWork _unitOfWork) : IRequestHandler<GetClusterByIdQuery, ApiResponse<Domain.Entities.Planning.Cluster>>
{
    public async Task<ApiResponse<Domain.Entities.Planning.Cluster>> Handle(GetClusterByIdQuery request, CancellationToken cancellationToken)
    {
        var cluster = await _unitOfWork.ClusterRepository.FindAsync(
           t => t.Id == request.Id,
            cancellationToken: cancellationToken) ?? throw new NotFoundException("No data found.");

        return ApiResponse<Domain.Entities.Planning.Cluster>.Success(cluster, "Retrieved successfully");
    }
}
