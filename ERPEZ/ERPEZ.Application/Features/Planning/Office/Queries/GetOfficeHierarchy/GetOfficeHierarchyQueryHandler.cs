using ERPEZ.Application.Features.Planning.Office.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Office.Queries.GetOfficeHierarchy;

public class GetOfficeHierarchyQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetOfficeHierarchyQuery, ApiResponse<List<OfficeHierarchyResponse>>>
{
    public async Task<ApiResponse<List<OfficeHierarchyResponse>>> Handle(
        GetOfficeHierarchyQuery request,
        CancellationToken cancellationToken)
    {
        // Load all offices with related entities from repository
        var allOffices = await unitOfWork.OfficeRepository.GetAllAsync(request.IncludeDeleted, cancellationToken);

        // If RootOfficeId is specified, validate it exists
        if (request.RootOfficeId.HasValue)
        {
            var rootOffice = allOffices.FirstOrDefault(o => o.Id == request.RootOfficeId.Value);
            if (rootOffice == null)
            {
                throw new NotFoundException($"Office with ID {request.RootOfficeId.Value} not found.");
            }

            // Get the root office and all its descendants
            var descendants = GetDescendants(allOffices, request.RootOfficeId.Value);
            var rootHierarchy = BuildHierarchy(allOffices, request.RootOfficeId);
            
            return ApiResponse<List<OfficeHierarchyResponse>>.Success(rootHierarchy);
        }

        // Build hierarchy from top-level offices (those with no parent)
        var hierarchy = BuildHierarchy(allOffices, null);

        return ApiResponse<List<OfficeHierarchyResponse>>.Success(hierarchy);
    }

    private List<OfficeHierarchyResponse> BuildHierarchy(
        List<Domain.Entities.Planning.Office> allOffices,
        Guid? parentId)
    {
        var offices = allOffices
            .Where(o => o.ParentId == parentId)
            .Select(o => new OfficeHierarchyResponse
            {
                Id = o.Id,
                Name = o.Name,
                Code = o.Code,
                ParentId = o.ParentId,
                OfficeTypeName = o.OfficeType.Name,
                CategoryName = o.Category.Name,
                AdministrativeLevelName = o.AdministrativeLevel.Name,
                ClusterName = o.Cluster?.Name,
                IsDeleted = o.IsDeleted,
                Children = BuildHierarchy(allOffices, o.Id)
            })
            .OrderBy(o => o.Name)
            .ToList();

        return offices;
    }

    private HashSet<Guid> GetDescendants(List<Domain.Entities.Planning.Office> allOffices, Guid parentId)
    {
        var descendants = new HashSet<Guid> { parentId };
        var children = allOffices.Where(o => o.ParentId == parentId).ToList();

        foreach (var child in children)
        {
            var childDescendants = GetDescendants(allOffices, child.Id);
            descendants.UnionWith(childDescendants);
        }

        return descendants;
    }
}
