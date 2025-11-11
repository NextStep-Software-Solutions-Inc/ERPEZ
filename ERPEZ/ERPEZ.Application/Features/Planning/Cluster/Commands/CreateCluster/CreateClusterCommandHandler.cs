using ERPEZ.Application.Features.Planning.Cluster.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Cluster.Commands.CreateCluster;

public class CreateClusterCommandHandler(IUnitOfWork _unitOfWork) : IRequestHandler<CreateClusterCommand, ApiResponse<ClusterResponse>>
{
    public async Task<ApiResponse<ClusterResponse>> Handle(CreateClusterCommand request, CancellationToken cancellationToken)
    {
        var duplicate = await _unitOfWork.ClusterRepository.FindAsync(w => w.Name == request.Name, cancellationToken);
        if (duplicate != null) throw new ConflictException("Cluster already exists.");

        var cluster = new Domain.Entities.Planning.Cluster
        {
            Name = request.Name,
            Description = request.Description

        };

        await _unitOfWork.ClusterRepository.AddAsync(cluster, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        var res = new ClusterResponse()
        {
            Id = cluster.Id,
            Name = cluster.Name,
            Description = cluster.Description,
            CreatedAt = cluster.CreatedAt,
            CreatedBy = cluster.CreatedBy
        };
        return ApiResponse<ClusterResponse>.Success(res, "Cluster created successfully.");
    }
}
