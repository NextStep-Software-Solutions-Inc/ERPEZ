using ERPEZ.Application.Features.Planning.Cluster.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Cluster.Queries.GetClusterById;

public class GetClusterByIdQueryHandler(IUnitOfWork _unitOfWork) : IRequestHandler<GetClusterByIdQuery, ApiResponse<ClusterResponse>>
{
    public async Task<ApiResponse<ClusterResponse>> Handle(GetClusterByIdQuery request, CancellationToken cancellationToken)
    {
        var cluster = await _unitOfWork.ClusterRepository.FindAsync(
           t => t.Id == request.Id,
            cancellationToken: cancellationToken) ?? throw new NotFoundException("No data found.");

        var res = new ClusterResponse()
        {
            Id = cluster.Id,
            Name = cluster.Name,
            Description = cluster.Description,
            CreatedAt = cluster.CreatedAt,
            CreatedBy = cluster.CreatedBy
        };
        return ApiResponse<ClusterResponse>.Success(res, "Retrieved successfully");
    }
}
