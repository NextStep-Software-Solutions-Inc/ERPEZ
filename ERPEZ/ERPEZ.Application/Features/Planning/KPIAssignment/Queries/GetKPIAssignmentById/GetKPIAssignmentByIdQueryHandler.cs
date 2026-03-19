using ERPEZ.Application.Features.Planning.KPIAssignment.Dtos;
using ERPEZ.Application.Features.Planning.AdministrativeLevel.Dtos;
using ERPEZ.Application.Features.Planning.Attribute.Dtos;
using ERPEZ.Application.Features.Planning.Category.Dtos;
using ERPEZ.Application.Features.Planning.Cluster.Dtos;
using ERPEZ.Application.Features.Planning.FYActiveKPI.Dtos;
using ERPEZ.Application.Features.Planning.FYActiveKPIMeasurement.Dtos;
using ERPEZ.Application.Features.Planning.MFOPAP.Dtos;
using ERPEZ.Application.Features.Planning.Office.Dtos;
using ERPEZ.Application.Features.Planning.OfficeType.Dtos;
using ERPEZ.Application.Features.Planning.Organization.Dtos;
using ERPEZ.Application.Features.Planning.ProcurementWorkflow.Dtos;
using ERPEZ.Application.Features.Planning.SDG.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.KPIAssignment.Queries.GetKPIAssignmentById;

public class GetKPIAssignmentByIdQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetKPIAssignmentByIdQuery, ApiResponse<KPIAssignmentResponse>>
{
    public async Task<ApiResponse<KPIAssignmentResponse>> Handle(GetKPIAssignmentByIdQuery request, CancellationToken cancellationToken)
    {
        var assignment = await unitOfWork.KPIAssignmentRepository.GetByIdWithDetailsAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("KPI Assignment not found.");

        var sourceMFOPAP = assignment.FYActiveKPI?.MasterKPI?.MFOPAP ?? assignment.FYActiveKPI?.MFOPAP;

        var response = new KPIAssignmentResponse
        {
            Id = assignment.Id,
            FYActiveKPIId = assignment.FYActiveKPIId,
            OfficeId = assignment.OfficeId,
            OfficeName = assignment.Office?.Name ?? string.Empty,
            AssignedTargetAnnual = assignment.AssignedTargetAnnual,
            AssignedTargetQ1 = assignment.AssignedTargetQ1,
            AssignedTargetQ2 = assignment.AssignedTargetQ2,
            AssignedTargetQ3 = assignment.AssignedTargetQ3,
            AssignedTargetQ4 = assignment.AssignedTargetQ4,
            IsLocked = assignment.IsLocked,
            FYActiveKPI = assignment.FYActiveKPI == null ? null : new FYActiveKPIResponse
            {
                Id = assignment.FYActiveKPI.Id,
                FiscalYearId = assignment.FYActiveKPI.FiscalYearId,
                MasterKPIId = assignment.FYActiveKPI.MasterKPIId,
                ParentKPIId = assignment.FYActiveKPI.ParentKPIId,
                MFOPAPId = assignment.FYActiveKPI.MFOPAPId,
                Name = assignment.FYActiveKPI.Name,
                Code = assignment.FYActiveKPI.Code,
                Description = assignment.FYActiveKPI.Description,
                MeasurementUnit = assignment.FYActiveKPI.MeasurementUnit,
                DistributionBehavior = assignment.FYActiveKPI.DistributionBehavior,
                FunctionCategory = assignment.FYActiveKPI.FunctionCategory,
                MonitoringFrequency = assignment.FYActiveKPI.MonitoringFrequency,
                IsOptInAvailable = assignment.FYActiveKPI.IsOptInAvailable,
                IsGAD = assignment.FYActiveKPI.IsGAD,
                Status = assignment.FYActiveKPI.Status,
                AgencyTargetAnnual = assignment.FYActiveKPI.AgencyTargetAnnual,
                AgencyTargetQ1 = assignment.FYActiveKPI.AgencyTargetQ1,
                AgencyTargetQ2 = assignment.FYActiveKPI.AgencyTargetQ2,
                AgencyTargetQ3 = assignment.FYActiveKPI.AgencyTargetQ3,
                AgencyTargetQ4 = assignment.FYActiveKPI.AgencyTargetQ4,
                CreatedAt = assignment.FYActiveKPI.CreatedAt,
                CreatedBy = assignment.FYActiveKPI.CreatedBy,
                FYActiveKPIMeasurements = assignment.FYActiveKPI.FYActiveKPIMeasurements?.Select(m => new FYActiveKPIMeasurementResponse
                {
                    Id = m.Id,
                    FYActiveKPIId = m.FYActiveKPIId,
                    Dimension = m.Dimension,
                    MOVs = m.MOVs,
                    RatingScaleTemplateId = m.RatingScaleTemplateId,
                    IsMOVEditable = m.IsMOVEditable,
                    IsScaleEditable = m.IsScaleEditable,
                    CreatedAt = m.CreatedAt,
                    CreatedBy = m.CreatedBy
                }).ToList() ?? [],
                MFOPAP = sourceMFOPAP != null ? new MFOPAPResponse
                {
                    Id = sourceMFOPAP.Id,
                    ParentId = sourceMFOPAP.ParentId,
                    Name = sourceMFOPAP.Name,
                    Code = sourceMFOPAP.Code,
                    Type = sourceMFOPAP.Type,
                    IsActive = sourceMFOPAP.IsActive
                } : null,
                Attributes = assignment.FYActiveKPI.MasterKPI?.Attributes?.Select(a => new AttributeResponse
                {
                    Id = a.Id,
                    Name = a.Name,
                    Code = a.Code,
                    Description = a.Description,
                    ParentAttributeId = a.ParentAttributeId
                }).ToList() ?? [],
                SDGs = assignment.FYActiveKPI.MasterKPI?.SDGs?.Select(s => new SDGResponse
                {
                    Id = s.Id,
                    Name = s.Name,
                    Description = s.Description
                }).ToList() ?? []
            },
            Office = assignment.Office == null ? null : new OfficeResponse
            {
                Id = assignment.Office.Id,
                PositionCount = assignment.Office.Positions?.Count(p => !p.IsDeleted) ?? 0,
                Name = assignment.Office.Name,
                Code = assignment.Office.Code,
                Address = assignment.Office.Address,
                Description = assignment.Office.Description,
                ResponsibilityCenterCode = assignment.Office.ResponsibilityCenterCode,
                BudgetCostCenter = assignment.Office.BudgetCostCenter,
                OfficeTypeId = assignment.Office.OfficeTypeId,
                OrganizationId = assignment.Office.OrganizationId,
                CategoryId = assignment.Office.CategoryId,
                AdministrativeLevelId = assignment.Office.AdministrativeLevelId,
                ClusterId = assignment.Office.ClusterId,
                ProcurementWorkflowId = assignment.Office.ProcurementWorkflowId,
                ParentId = assignment.Office.ParentId,
                OfficeType = assignment.Office.OfficeType != null ? new OfficeTypeResponse
                {
                    Id = assignment.Office.OfficeType.Id,
                    Name = assignment.Office.OfficeType.Name,
                    Code = assignment.Office.OfficeType.Code,
                    CanHaveChildren = assignment.Office.OfficeType.CanHaveChildren,
                    IsActive = assignment.Office.OfficeType.IsActive
                } : null,
                Organization = assignment.Office.Organization != null ? new OrganizationResponse
                {
                    Id = assignment.Office.Organization.Id,
                    Name = assignment.Office.Organization.Name,
                    Code = assignment.Office.Organization.Code,
                    Type = assignment.Office.Organization.Type,
                    IsActive = assignment.Office.Organization.IsActive,
                    ParentId = assignment.Office.Organization.ParentId
                } : null,
                Category = assignment.Office.Category != null ? new CategoryResponse
                {
                    Id = assignment.Office.Category.Id,
                    Name = assignment.Office.Category.Name,
                    Code = assignment.Office.Category.Code,
                    CanHaveChildren = assignment.Office.Category.CanHaveChildren,
                    IsActive = assignment.Office.Category.IsActive
                } : null,
                AdministrativeLevel = assignment.Office.AdministrativeLevel != null ? new AdministrativeLevelResponse
                {
                    Id = assignment.Office.AdministrativeLevel.Id,
                    Name = assignment.Office.AdministrativeLevel.Name,
                    Code = assignment.Office.AdministrativeLevel.Code,
                    CanHaveChildren = assignment.Office.AdministrativeLevel.CanHaveChildren,
                    IsActive = assignment.Office.AdministrativeLevel.IsActive
                } : null,
                Cluster = assignment.Office.Cluster != null ? new ClusterResponse
                {
                    Id = assignment.Office.Cluster.Id,
                    Name = assignment.Office.Cluster.Name,
                    Code = assignment.Office.Cluster.Code,
                    Address = assignment.Office.Cluster.Address,
                    IsActive = assignment.Office.Cluster.IsActive,
                    MaxSubUnits = assignment.Office.Cluster.MaxSubUnits
                } : null,
                ProcurementWorkflow = assignment.Office.ProcurementWorkflow != null ? new ProcurementWorkflowResponse
                {
                    Id = assignment.Office.ProcurementWorkflow.Id,
                    Name = assignment.Office.ProcurementWorkflow.Name,
                    Code = assignment.Office.ProcurementWorkflow.Code,
                    ApprovalLevel = assignment.Office.ProcurementWorkflow.ApprovalLevel,
                    IsActive = assignment.Office.ProcurementWorkflow.IsActive
                } : null,
                ParentOffice = assignment.Office.Parent != null ? new ParentOfficeResponse
                {
                    Id = assignment.Office.Parent.Id,
                    Name = assignment.Office.Parent.Name,
                    Code = assignment.Office.Parent.Code
                } : null
            },
            CreatedAt = assignment.CreatedAt,
            CreatedBy = assignment.CreatedBy
        };

        return ApiResponse<KPIAssignmentResponse>.Success(response);
    }
}
