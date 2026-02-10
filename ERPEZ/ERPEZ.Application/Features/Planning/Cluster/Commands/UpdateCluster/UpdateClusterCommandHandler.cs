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

        if (dto.Code != null && dto.Code != cluster.Code)
        {
            var duplicate = await unitOfWork.ClusterRepository.FindAsync(
                x => x.Code == dto.Code,
                cancellationToken
            );

            if (duplicate != null && duplicate.Id != request.Id)
                throw new ConflictException("Cluster with this code already exists.");
        }

        cluster.Name = dto.Name ?? cluster.Name;
        cluster.Code = dto.Code ?? cluster.Code;
        cluster.Address = dto.Address ?? cluster.Address;
        cluster.MaxSubUnits = dto.MaxSubUnits ?? cluster.MaxSubUnits;
        if (dto.IsActive.HasValue) cluster.IsActive = dto.IsActive.Value;

        unitOfWork.ClusterRepository.Update(cluster);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return ApiResponse<Unit>.Success(Unit.Value, "Cluster updated successfully.");
    }
}
