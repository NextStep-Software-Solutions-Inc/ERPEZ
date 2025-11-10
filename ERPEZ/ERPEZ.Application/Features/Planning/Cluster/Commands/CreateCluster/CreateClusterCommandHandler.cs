using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Cluster.Commands.CreateCluster;

public class CreateClusterCommandHandler(IUnitOfWork _unitOfWork) : IRequestHandler<CreateClusterCommand, ApiResponse<Domain.Entities.Planning.Cluster>>
{
    public async Task<ApiResponse<Domain.Entities.Planning.Cluster>> Handle(CreateClusterCommand request, CancellationToken cancellationToken)
    {
        var duplicate = await _unitOfWork.ClusterRepository.FindAsync(w => w.Name == request.Name && w.Description == request.Description, cancellationToken);
        if (duplicate != null) throw new ConflictException("Cluster already exist.");

        var cluster = new Domain.Entities.Planning.Cluster
        {
            Name = request.Name,
            Description = request.Description

        };

        await _unitOfWork.ClusterRepository.AddAsync(cluster, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return ApiResponse<Domain.Entities.Planning.Cluster>.Success(cluster, "Cluster created successfully.");
    }
}
