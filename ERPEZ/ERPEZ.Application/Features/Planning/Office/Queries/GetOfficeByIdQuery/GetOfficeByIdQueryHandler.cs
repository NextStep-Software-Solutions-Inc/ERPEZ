using ERPEZ.Application.Features.Planning.AdministrativeLevel.Dtos;
using ERPEZ.Application.Features.Planning.Category.Dtos;
using ERPEZ.Application.Features.Planning.Cluster.Dtos;
using ERPEZ.Application.Features.Planning.Office.Dtos;
using ERPEZ.Application.Features.Planning.OfficeType.Dtos;
using ERPEZ.Application.Features.Planning.Organization.Dtos;
using ERPEZ.Application.Features.Planning.ProcurementWorkflow.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Office.Queries.GetOfficeByIdQuery;

public class GetOfficeByIdQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetOfficeByIdQuery, ApiResponse<OfficeResponse>>
{
    public async Task<ApiResponse<OfficeResponse>> Handle(GetOfficeByIdQuery request, CancellationToken cancellationToken)
    {
        var office = await unitOfWork.OfficeRepository.GetByIdWithDetailsAsync(request.Id, cancellationToken) 
            ?? throw new NotFoundException("No data found.");

        var result = new OfficeResponse()
        {
            Id = office.Id,
            PositionCounts = office.Positions.Count(p => !p.IsDeleted),
            Name = office.Name,
            Code = office.Code,
            Address = office.Address,
            Description = office.Description,
            ResponsibilityCenterCode = office.ResponsibilityCenterCode,
            BudgetCostCenter = office.BudgetCostCenter,
            OfficeTypeId = office.OfficeTypeId,
            OrganizationId = office.OrganizationId,
            CategoryId = office.CategoryId,
            AdministrativeLevelId = office.AdministrativeLevelId,
            ClusterId = office.ClusterId,
            ProcurementWorkflowId = office.ProcurementWorkflowId,
            ParentId = office.ParentId,
            OfficeType = office.OfficeType != null ? new OfficeTypeResponse
            {
                Id = office.OfficeType.Id,
                Name = office.OfficeType.Name,
                Code = office.OfficeType.Code,
                CanHaveChildren = office.OfficeType.CanHaveChildren,
                IsActive = office.OfficeType.IsActive
            } : null,
            Organization = office.Organization != null ? new OrganizationResponse
            {
                Id = office.Organization.Id,
                Name = office.Organization.Name,
                Code = office.Organization.Code,
                Type = office.Organization.Type,
                IsActive = office.Organization.IsActive,
                ParentId = office.Organization.ParentId
            } : null,
            Category = office.Category != null ? new CategoryResponse
            {
                Id = office.Category.Id,
                Name = office.Category.Name,
                Code = office.Category.Code,
                CanHaveChildren = office.Category.CanHaveChildren,
                IsActive = office.Category.IsActive
            } : null,
            AdministrativeLevel = office.AdministrativeLevel != null ? new AdministrativeLevelResponse
            {
                Id = office.AdministrativeLevel.Id,
                Name = office.AdministrativeLevel.Name,
                Code = office.AdministrativeLevel.Code,
                CanHaveChildren = office.AdministrativeLevel.CanHaveChildren,
                IsActive = office.AdministrativeLevel.IsActive
            } : null,
            Cluster = office.Cluster != null ? new ClusterResponse
            {
                Id = office.Cluster.Id,
                Name = office.Cluster.Name,
                Code = office.Cluster.Code,
                Address = office.Cluster.Address,
                IsActive = office.Cluster.IsActive,
                MaxSubUnits = office.Cluster.MaxSubUnits
            } : null,
            ProcurementWorkflow = office.ProcurementWorkflow != null ? new ProcurementWorkflowResponse
            {
                Id = office.ProcurementWorkflow.Id,
                Name = office.ProcurementWorkflow.Name,
                Code = office.ProcurementWorkflow.Code,
                ApprovalLevel = office.ProcurementWorkflow.ApprovalLevel,
                IsActive = office.ProcurementWorkflow.IsActive
            } : null,
            ParentOffice = office.Parent != null ? new ParentOfficeResponse
            {
                Id = office.Parent.Id,
                Name = office.Parent.Name,
                Code = office.Parent.Code
            } : null
        };

        return ApiResponse<OfficeResponse>.Success(result, "Retrieved successfully");
    }
}
