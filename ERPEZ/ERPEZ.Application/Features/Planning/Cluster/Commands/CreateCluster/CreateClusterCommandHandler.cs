using ERPEZ.Application.Features.Planning.Cluster.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Cluster.Commands.CreateCluster;

public class CreateClusterCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<CreateClusterCommand, ApiResponse<ClusterResponse>>
{
    public async Task<ApiResponse<ClusterResponse>> Handle(CreateClusterCommand request, CancellationToken cancellationToken)
    {
        var duplicate = await unitOfWork.ClusterRepository.FindAsync(w => w.Name == request.Name && w.Description == request.Description, cancellationToken);
        if (duplicate != null) throw new ConflictException("Cluster already exists.");

        var cluster = new Domain.Entities.Planning.Cluster
        {
            Name = request.Name,
            Description = request.Description

        };

        await unitOfWork.ClusterRepository.AddAsync(cluster, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        var result = new ClusterResponse()
        {
            Id = cluster.Id,
            Name = cluster.Name,
            Description = cluster.Description,
            CreatedAt = cluster.CreatedAt,
            CreatedBy = cluster.CreatedBy
        };
        return ApiResponse<ClusterResponse>.Success(result, "Cluster created successfully.");
    }
}
