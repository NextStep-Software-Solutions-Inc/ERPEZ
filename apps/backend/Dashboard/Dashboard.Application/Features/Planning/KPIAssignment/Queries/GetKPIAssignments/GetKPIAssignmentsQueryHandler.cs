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
using MediatR;
using Sieve.Models;
using System.Data;

namespace ERPEZ.Application.Features.Planning.KPIAssignment.Queries.GetKPIAssignments;

public class GetKPIAssignmentsQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetKPIAssignmentsQuery, PaginatedApiResponse<KPIAssignmentResponse>>
{
    public async Task<PaginatedApiResponse<KPIAssignmentResponse>> Handle(GetKPIAssignmentsQuery request, CancellationToken cancellationToken)
    {
        var sieveModel = new SieveModel
        {
            PageSize = request.PageSize,
            Page = request.PageNumber,
            Filters = request.Filters,
            Sorts = request.Sorts
        };

        var (items, totalCount) = await unitOfWork.KPIAssignmentRepository.GetAllWithDetailsAsync(sieveModel, cancellationToken);
        var responses = items.Select(MapToResponse).ToList();

        return new PaginatedApiResponse<KPIAssignmentResponse>(responses, request.PageNumber, request.PageSize, totalCount);
    }

    private static KPIAssignmentResponse MapToResponse(Domain.Entities.Planning.KPIAssignment assignment)
    {
        return new KPIAssignmentResponse
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
            FYActiveKPI = MapFYActiveKPI(assignment.FYActiveKPI),
            Office = MapOffice(assignment.Office),
            CreatedAt = assignment.CreatedAt,
            CreatedBy = assignment.CreatedBy,
            FiscalYearId = assignment.FYActiveKPI?.FiscalYearId,
            Year = assignment.FYActiveKPI?.FiscalYear?.Year,
            FunctionCategory = assignment.FYActiveKPI?.FunctionCategory,
            FiscalYear = assignment.FYActiveKPI?.FiscalYear == null ? null : new ERPEZ.Application.Features.Planning.FiscalYear.Dtos.FiscalYearResponse
            {
                Id = assignment.FYActiveKPI.FiscalYear.Id,
                Year = assignment.FYActiveKPI.FiscalYear.Year,
                Description = assignment.FYActiveKPI.FiscalYear.Description,
                Status = assignment.FYActiveKPI.FiscalYear.Status,
                IsLocked = assignment.FYActiveKPI.FiscalYear.IsLocked,
                StartDate = assignment.FYActiveKPI.FiscalYear.StartDate,
                EndDate = assignment.FYActiveKPI.FiscalYear.EndDate
            }
        };
    }

    private static FYActiveKPIResponse? MapFYActiveKPI(Domain.Entities.Planning.FYActiveKPI? fyActiveKPI)
    {
        if (fyActiveKPI == null)
            return null;

        var sourceMFOPAP = fyActiveKPI.MasterKPI?.MFOPAP ?? fyActiveKPI.MFOPAP;

        return new FYActiveKPIResponse
        {
            Id = fyActiveKPI.Id,
            FiscalYearId = fyActiveKPI.FiscalYearId,
            MasterKPIId = fyActiveKPI.MasterKPIId,
            ParentKPIId = fyActiveKPI.ParentKPIId,
            MFOPAPId = fyActiveKPI.MFOPAPId,
            Name = fyActiveKPI.Name,
            Code = fyActiveKPI.Code,
            Description = fyActiveKPI.Description,
            MeasurementUnit = fyActiveKPI.MeasurementUnit,
            DistributionBehavior = fyActiveKPI.DistributionBehavior,
            FunctionCategory = fyActiveKPI.FunctionCategory,
            MonitoringFrequency = fyActiveKPI.MonitoringFrequency,
            IsOptInAvailable = fyActiveKPI.IsOptInAvailable,
            IsGAD = fyActiveKPI.IsGAD,
            Status = fyActiveKPI.Status,
            AgencyTargetAnnual = fyActiveKPI.AgencyTargetAnnual,
            AgencyTargetQ1 = fyActiveKPI.AgencyTargetQ1,
            AgencyTargetQ2 = fyActiveKPI.AgencyTargetQ2,
            AgencyTargetQ3 = fyActiveKPI.AgencyTargetQ3,
            AgencyTargetQ4 = fyActiveKPI.AgencyTargetQ4,
            CreatedAt = fyActiveKPI.CreatedAt,
            CreatedBy = fyActiveKPI.CreatedBy,
            FYActiveKPIMeasurements = fyActiveKPI.FYActiveKPIMeasurements?.Select(m => new FYActiveKPIMeasurementResponse
            {
                Id = m.Id,
                FYActiveKPIId = m.FYActiveKPIId,
                Name = m.Name,
                Statement = m.Statement,
                Dimensions = m.Dimensions,
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
            Attributes = fyActiveKPI.MasterKPI?.Attributes?.Select(a => new AttributeResponse
            {
                Id = a.Id,
                Name = a.Name,
                Code = a.Code,
                Description = a.Description,
                ParentAttributeId = a.ParentAttributeId
            }).ToList() ?? [],
            SDGs = fyActiveKPI.MasterKPI?.SDGs?.Select(s => new SDGResponse
            {
                Id = s.Id,
                Name = s.Name,
                Description = s.Description,
                SdgCode = s.SdgCode   // ← add
            }).ToList() ?? []
        };
    }

    private static OfficeResponse? MapOffice(Domain.Entities.Planning.Office? office)
    {
        if (office == null)
            return null;

        return new OfficeResponse
        {
            Id = office.Id,
            PositionCount = office.Positions?.Count(p => !p.IsDeleted) ?? 0,
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
    }
}
