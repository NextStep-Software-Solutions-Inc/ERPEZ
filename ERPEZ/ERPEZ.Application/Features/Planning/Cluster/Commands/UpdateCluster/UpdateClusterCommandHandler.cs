using ERPEZ.Application.Features.Planning.Cluster.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Cluster.Commands.UpdateCluster;

public class UpdateClusterCommandHandler(IUnitOfWork _unitOfWork) : IRequestHandler<UpdateClusterCommand, ApiResponse<ClusterResponse>>
{
    public async Task<ApiResponse<ClusterResponse>> Handle(UpdateClusterCommand request, CancellationToken cancellationToken)
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
        var res = new ClusterResponse()
        {
            Id = cluster.Id,
            Name = cluster.Name,
            Description = cluster.Description,
            CreatedAt = cluster.CreatedAt,
            CreatedBy = cluster.CreatedBy
        };

        return ApiResponse<ClusterResponse>.Success(res, "Cluster updated successfully.");
    }
}
