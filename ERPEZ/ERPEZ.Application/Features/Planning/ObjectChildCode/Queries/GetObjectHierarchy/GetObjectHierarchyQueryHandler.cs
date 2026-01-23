using ERPEZ.Application.Features.Planning.ObjectChildCode.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.ObjectChildCode.Queries.GetObjectHierarchy;

/// <summary>
/// Handler for GetObjectHierarchyQuery that returns the full hierarchy tree.
/// </summary>
public class GetObjectHierarchyQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetObjectHierarchyQuery, ApiResponse<ObjectHierarchyNode>>
{
    public async Task<ApiResponse<ObjectHierarchyNode>> Handle(GetObjectHierarchyQuery request, CancellationToken cancellationToken)
    {
        var obj = await unitOfWork.ObjectRepository.GetByIdAsync(request.ObjectId, cancellationToken);
        if (obj == null)
        {
            throw new NotFoundException($"Object with ID {request.ObjectId} not found.");
        }

        var hierarchy = await BuildHierarchyAsync(request.ObjectId, cancellationToken);

        return ApiResponse<ObjectHierarchyNode>.Success(hierarchy, "Object hierarchy retrieved successfully.");
    }

    private async Task<ObjectHierarchyNode> BuildHierarchyAsync(Guid objectId, CancellationToken cancellationToken)
    {
        var obj = await unitOfWork.ObjectRepository.GetByIdAsync(objectId, cancellationToken);
        var node = new ObjectHierarchyNode
        {
            ObjectId = objectId,
            ObjectCode = obj?.Code ?? string.Empty,
            ObjectName = obj?.Name ?? string.Empty,
            Children = []
        };

        var children = await unitOfWork.ObjectChildCodeRepository.GetChildrenAsync(objectId, cancellationToken);
        foreach (var child in children)
        {
            var childNode = await BuildHierarchyAsync(child.ChildObjectId, cancellationToken);
            node.Children.Add(childNode);
        }

        return node;
    }
}
