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
        var allOffices = await unitOfWork.OfficeRepository.GetAllWithDetailsAsync(request.IncludeDeleted, cancellationToken);

        // If RootOfficeId is specified, validate it exists and build hierarchy from that root
        if (request.RootOfficeId.HasValue)
        {
            var rootOffice = allOffices.FirstOrDefault(o => o.Id == request.RootOfficeId.Value);
            if (rootOffice == null)
            {
                throw new NotFoundException($"Office with ID {request.RootOfficeId.Value} not found.");
            }

            // Build hierarchy including the root office itself
            var rootHierarchy = new OfficeHierarchyResponse
            {
                Id = rootOffice.Id,
                Name = rootOffice.Name,
                Code = rootOffice.Code,
                ParentId = rootOffice.ParentId,
                OfficeTypeName = rootOffice.OfficeType.Name,
                CategoryName = rootOffice.Category.Name,
                AdministrativeLevelName = rootOffice.AdministrativeLevel.Name,
                ClusterName = rootOffice.Cluster?.Name,
                IsDeleted = rootOffice.IsDeleted,
                Children = BuildHierarchy(allOffices, request.RootOfficeId.Value)
            };
            
            return ApiResponse<List<OfficeHierarchyResponse>>.Success(new List<OfficeHierarchyResponse> { rootHierarchy });
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
}
