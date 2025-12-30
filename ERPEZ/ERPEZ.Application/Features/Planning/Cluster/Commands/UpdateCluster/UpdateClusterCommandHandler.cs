using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Cluster.Commands.UpdateCluster;

public class UpdateClusterCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<UpdateClusterCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(UpdateClusterCommand request, CancellationToken cancellationToken)
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
        return ApiResponse<Unit>.Success(Unit.Value, "Cluster updated successfully.");
    }
}
