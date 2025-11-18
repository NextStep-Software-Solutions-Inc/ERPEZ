using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Cluster.Commands.DeleteCluster;

public class DeleteClusterCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<DeleteClusterCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(DeleteClusterCommand request, CancellationToken cancellationToken)
    {
        var cluster = await unitOfWork.ClusterRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken) ?? throw new NotFoundException("Cluster not found.");

        unitOfWork.ClusterRepository.Remove(cluster);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, $"Cluster with ID {request.Id} deleted successfully.");
    }
}
