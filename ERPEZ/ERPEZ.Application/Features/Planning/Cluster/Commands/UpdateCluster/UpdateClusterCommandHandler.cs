using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Cluster.Commands.UpdateCluster;

public class UpdateClusterCommandHandler(IUnitOfWork _unitOfWork) : IRequestHandler<UpdateClusterCommand, ApiResponse<Domain.Entities.Planning.Cluster>>
{
    public async Task<ApiResponse<Domain.Entities.Planning.Cluster>> Handle(UpdateClusterCommand request, CancellationToken cancellationToken)
    {
        var dto = request.UpdateCluster;
        var cluster = await _unitOfWork.ClusterRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken)
            ?? throw new NotFoundException("Cluster not found.");

        var duplicate = await _unitOfWork.ClusterRepository.FindAsync(
            x => x.Name == dto.Name &&
            x.Description == dto.Description,
            cancellationToken
        );

        if (duplicate != null && duplicate.Id != request.Id)
            throw new ConflictException("Cluster already exists.");

        cluster.Name = dto.Name ?? cluster.Name;
        cluster.Description = dto.Description ?? cluster.Description;

        _unitOfWork.ClusterRepository.Update(cluster);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Domain.Entities.Planning.Cluster>.Success(cluster, "Cluster updated successfully.");
    }
}
