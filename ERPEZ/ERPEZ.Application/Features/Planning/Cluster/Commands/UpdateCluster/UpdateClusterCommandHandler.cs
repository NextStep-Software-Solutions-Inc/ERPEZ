using ERPEZ.Application.Features.Planning.Cluster.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Cluster.Commands.UpdateCluster;

public class UpdateClusterCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<UpdateClusterCommand, ApiResponse<ClusterResponse>>
{
    public async Task<ApiResponse<ClusterResponse>> Handle(UpdateClusterCommand request, CancellationToken cancellationToken)
    {
        var dto = request.UpdateCluster;
        var cluster = await unitOfWork.ClusterRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken)
            ?? throw new NotFoundException("Cluster not found.");

        var duplicate = await unitOfWork.ClusterRepository.FindAsync(
            x => x.Name == dto.Name &&
            x.Description == dto.Description,
            cancellationToken
        );

        if (duplicate != null && duplicate.Id != request.Id)
            throw new ConflictException("Cluster already exists.");

        cluster.Name = dto.Name ?? cluster.Name;
        cluster.Description = dto.Description ?? cluster.Description;

        unitOfWork.ClusterRepository.Update(cluster);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        var result = new ClusterResponse()
        {
            Id = cluster.Id,
            Name = cluster.Name,
            Description = cluster.Description,
            CreatedAt = cluster.CreatedAt,
            CreatedBy = cluster.CreatedBy
        };

        return ApiResponse<ClusterResponse>.Success(result, "Cluster updated successfully.");
    }
}
