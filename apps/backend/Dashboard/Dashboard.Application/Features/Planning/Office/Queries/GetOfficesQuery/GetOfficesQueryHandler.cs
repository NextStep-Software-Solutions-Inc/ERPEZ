using ERPEZ.Application.Features.Planning.AdministrativeLevel.Dtos;
using ERPEZ.Application.Features.Planning.Category.Dtos;
using ERPEZ.Application.Features.Planning.Cluster.Dtos;
using ERPEZ.Application.Features.Planning.Office.Dtos;
using ERPEZ.Application.Features.Planning.OfficeType.Dtos;
using ERPEZ.Application.Features.Planning.Organization.Dtos;
using ERPEZ.Application.Features.Planning.ProcurementWorkflow.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Office.Queries.GetOfficesQuery;

public class GetOfficesQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetOfficesQuery, PaginatedApiResponse<OfficeResponse>>
{
    public async Task<PaginatedApiResponse<OfficeResponse>> Handle(GetOfficesQuery query, CancellationToken cancellationToken)
    {
        var sieveModel = new Sieve.Models.SieveModel
        {
            PageSize = query.PageSize,
            Page = query.PageNumber,
            Filters = query.Filters,
            Sorts = query.Sorts
        };

        var (offices, totalCount) = await unitOfWork.OfficeRepository.GetAllWithDetailsAsync(sieveModel, cancellationToken);

        var officeResponses = offices.Select(o => new OfficeResponse
        {
            Id = o.Id,
            PositionCount = o.Positions.Count(p => !p.IsDeleted),
            Name = o.Name,
            Code = o.Code,
            Address = o.Address,
            Description = o.Description,
            ResponsibilityCenterCode = o.ResponsibilityCenterCode,
            BudgetCostCenter = o.BudgetCostCenter,
            OfficeTypeId = o.OfficeTypeId,
            OrganizationId = o.OrganizationId,
            CategoryId = o.CategoryId,
            AdministrativeLevelId = o.AdministrativeLevelId,
            ClusterId = o.ClusterId,
            ProcurementWorkflowId = o.ProcurementWorkflowId,
            ParentId = o.ParentId,
            OfficeType = o.OfficeType != null ? new OfficeTypeResponse
            {
                Id = o.OfficeType.Id,
                Name = o.OfficeType.Name,
                Code = o.OfficeType.Code,
                CanHaveChildren = o.OfficeType.CanHaveChildren,
                IsActive = o.OfficeType.IsActive
            } : null,
            Organization = o.Organization != null ? new OrganizationResponse
            {
                Id = o.Organization.Id,
                Name = o.Organization.Name,
                Code = o.Organization.Code,
                Type = o.Organization.Type,
                IsActive = o.Organization.IsActive,
                ParentId = o.Organization.ParentId
            } : null,
            Category = o.Category != null ? new CategoryResponse
            {
                Id = o.Category.Id,
                Name = o.Category.Name,
                Code = o.Category.Code,
                CanHaveChildren = o.Category.CanHaveChildren,
                IsActive = o.Category.IsActive
            } : null,
            AdministrativeLevel = o.AdministrativeLevel != null ? new AdministrativeLevelResponse
            {
                Id = o.AdministrativeLevel.Id,
                Name = o.AdministrativeLevel.Name,
                Code = o.AdministrativeLevel.Code,
                CanHaveChildren = o.AdministrativeLevel.CanHaveChildren,
                IsActive = o.AdministrativeLevel.IsActive
            } : null,
            Cluster = o.Cluster != null ? new ClusterResponse
            {
                Id = o.Cluster.Id,
                Name = o.Cluster.Name,
                Code = o.Cluster.Code,
                Address = o.Cluster.Address,
                IsActive = o.Cluster.IsActive,
                MaxSubUnits = o.Cluster.MaxSubUnits
            } : null,
            ProcurementWorkflow = o.ProcurementWorkflow != null ? new ProcurementWorkflowResponse
            {
                Id = o.ProcurementWorkflow.Id,
                Name = o.ProcurementWorkflow.Name,
                Code = o.ProcurementWorkflow.Code,
                ApprovalLevel = o.ProcurementWorkflow.ApprovalLevel,
                IsActive = o.ProcurementWorkflow.IsActive
            } : null,
            ParentOffice = o.Parent != null ? new ParentOfficeResponse
            {
                Id = o.Parent.Id,
                Name = o.Parent.Name,
                Code = o.Parent.Code
            } : null
        }).ToList();

        return new PaginatedApiResponse<OfficeResponse>(
            [.. officeResponses],
            query.PageNumber,
            query.PageSize,
            totalCount);
    }
}
