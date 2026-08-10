using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Cluster.Commands.CreateCluster;

public class CreateClusterCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<CreateClusterCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreateClusterCommand request, CancellationToken cancellationToken)
    {
        var duplicate = await unitOfWork.ClusterRepository.FindAsync(w => w.Code == request.Code, cancellationToken);
        if (duplicate != null) throw new ConflictException("Cluster with this code already exists.");

        var cluster = new Domain.Entities.Planning.Cluster
        {
            Name = request.Name,
            Code = request.Code,
            Address = request.Address,
            MaxSubUnits = request.MaxSubUnits,
            IsActive = true
        };

        await unitOfWork.ClusterRepository.AddAsync(cluster, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(cluster.Id, "Cluster created successfully.");
    }
}
