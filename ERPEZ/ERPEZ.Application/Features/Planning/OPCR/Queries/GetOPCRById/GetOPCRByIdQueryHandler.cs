using ERPEZ.Application.Features.Planning.Attribute.Dtos;
using ERPEZ.Application.Features.Planning.FiscalYear.Dtos;
using ERPEZ.Application.Features.Planning.FYActiveKPI.Dtos;
using ERPEZ.Application.Features.Planning.FYActiveKPIMeasurement.Dtos;
using ERPEZ.Application.Features.Planning.MFOPAP.Dtos;
using ERPEZ.Application.Features.Planning.OPCRActivity.Dtos;
using ERPEZ.Application.Features.Planning.OPCR.Dtos;
using ERPEZ.Application.Features.Planning.OPCRPAPDepartment.Dtos;
using ERPEZ.Application.Features.Planning.OPCREvaluation.Dtos;
using ERPEZ.Application.Features.Planning.SDG.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCR.Queries.GetOPCRById;

public class GetOPCRByIdQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetOPCRByIdQuery, ApiResponse<OPCRDetailedResponse>>
{
    public async Task<ApiResponse<OPCRDetailedResponse>> Handle(GetOPCRByIdQuery request, CancellationToken cancellationToken)
    {
        var opcrQuery = unitOfWork.OPCRRepository.Query(o => o.Id == request.Id)
            .Select(o => new OPCRDetailedResponse
            {
                Id = o.Id,
                Name = o.Name,
                Code = o.Code,
                Status = o.Status.ToString(),
                RatingStatus = o.RatingStatus.ToString(),
                SubmittedDate = o.RatingSubmittedDate.HasValue ? DateOnly.FromDateTime(o.RatingSubmittedDate.Value) : null,
                ReturnedDate = o.RatingReturnedDate.HasValue ? DateOnly.FromDateTime(o.RatingReturnedDate.Value) : null,
                TotalBudget = o.OPCRItems.SelectMany(i => i.OPCRActivities).Sum(a => a.Budget),
                EvaluationCount = o.OPCREvaluations.Count,
                KPIAssignmentCount = o.OPCRItems.Select(i => i.KPIAssignmentId).Distinct().Count(),
                ActivityCount = o.OPCRItems.SelectMany(i => i.OPCRActivities).Count(),
                CreatedAt = o.CreatedAt,
                CreatedBy = o.CreatedBy,
                UpdatedAt = o.UpdatedAt,
                UpdatedBy = o.UpdatedBy,
                FiscalYear = new()
                {
                    Id = o.FiscalYear.Id,
                    Year = o.FiscalYear.Year,
                    Description = o.FiscalYear.Description,
                    Status = o.FiscalYear.Status,
                    IsLocked = o.FiscalYear.IsLocked,
                    StartDate = o.FiscalYear.StartDate,
                    EndDate = o.FiscalYear.EndDate,
                    FunctionAllocations = o.FiscalYear.FunctionAllocations.Select(fa => new FunctionAllocationResponse
                    {
                        Id = fa.Id,
                        FunctionType = fa.FunctionType.ToString(),
                        Percentage = fa.Percentage,
                    }).ToList(),
                },
                Office = new()
                {
                    Id = o.Office.Id,
                    PositionCount = o.Office.Positions.Count(p => !p.IsDeleted),
                    Name = o.Office.Name,
                    Code = o.Office.Code,
                    Address = o.Office.Address,
                    Description = o.Office.Description,
                    ResponsibilityCenterCode = o.Office.ResponsibilityCenterCode,
                    BudgetCostCenter = o.Office.BudgetCostCenter,
                    OfficeTypeId = o.Office.OfficeTypeId,
                    OrganizationId = o.Office.OrganizationId,
                    CategoryId = o.Office.CategoryId,
                    AdministrativeLevelId = o.Office.AdministrativeLevelId,
                    ClusterId = o.Office.ClusterId,
                    ProcurementWorkflowId = o.Office.ProcurementWorkflowId,
                    ParentId = o.Office.ParentId,
                    OfficeType = o.Office.OfficeType != null ? new()
                    {
                        Id = o.Office.OfficeType.Id,
                        Name = o.Office.OfficeType.Name,
                        Code = o.Office.OfficeType.Code,
                        CanHaveChildren = o.Office.OfficeType.CanHaveChildren,
                        IsActive = o.Office.OfficeType.IsActive
                    } : null,
                    Organization = o.Office.Organization != null ? new()
                    {
                        Id = o.Office.Organization.Id,
                        ParentId = o.Office.Organization.ParentId,
                        Name = o.Office.Organization.Name,
                        Code = o.Office.Organization.Code,
                        Type = o.Office.Organization.Type,
                        IsActive = o.Office.Organization.IsActive
                    } : null,
                    Category = o.Office.Category != null ? new()
                    {
                        Id = o.Office.Category.Id,
                        Name = o.Office.Category.Name,
                        Code = o.Office.Category.Code,
                        CanHaveChildren = o.Office.Category.CanHaveChildren,
                        IsActive = o.Office.Category.IsActive
                    } : null,
                    AdministrativeLevel = o.Office.AdministrativeLevel != null ? new()
                    {
                        Id = o.Office.AdministrativeLevel.Id,
                        Name = o.Office.AdministrativeLevel.Name,
                        Code = o.Office.AdministrativeLevel.Code,
                        CanHaveChildren = o.Office.AdministrativeLevel.CanHaveChildren,
                        IsActive = o.Office.AdministrativeLevel.IsActive
                    } : null,
                    Cluster = o.Office.Cluster != null ? new()
                    {
                        Id = o.Office.Cluster.Id,
                        Name = o.Office.Cluster.Name,
                        Code = o.Office.Cluster.Code,
                        Address = o.Office.Cluster.Address,
                        MaxSubUnits = o.Office.Cluster.MaxSubUnits,
                        IsActive = o.Office.Cluster.IsActive
                    } : null,
                    ProcurementWorkflow = o.Office.ProcurementWorkflow != null ? new()
                    {
                        Id = o.Office.ProcurementWorkflow.Id,
                        Name = o.Office.ProcurementWorkflow.Name,
                        Code = o.Office.ProcurementWorkflow.Code,
                        ApprovalLevel = o.Office.ProcurementWorkflow.ApprovalLevel,
                        IsActive = o.Office.ProcurementWorkflow.IsActive
                    } : null,
                    ParentOffice = o.Office.Parent != null ? new()
                    {
                        Id = o.Office.Parent.Id,
                        Name = o.Office.Parent.Name,
                        Code = o.Office.Parent.Code
                    } : null,
                },
                OPCREvaluations = o.OPCREvaluations.Select(e => new OPCREvaluationResponse
                {
                    Id = e.Id,
                    OPCRId = e.OPCRId,
                    EvaluatorId = e.EvaluatorId,
                    EvaluationDate = e.EvaluationDate,
                    Comments = e.Comments,
                    Status = e.Status,
                    CreatedAt = e.CreatedAt,
                    CreatedBy = e.CreatedBy
                }).ToList(),
                OPCRItems = o.OPCRItems.Select(item => new OPCRItemResponse
                {
                    Id = item.Id,
                    OPCRId = item.OPCRId,
                    KPIAssignmentId = item.KPIAssignmentId,
                    Q1Target = item.Q1Target,
                    Q2Target = item.Q2Target,
                    Q3Target = item.Q3Target,
                    Q4Target = item.Q4Target,
                    IsShopped = item.IsShopped,
                    KPIAssignment = item.KPIAssignment == null ? null : new()
                    {
                        Id = item.KPIAssignment.Id,
                        FYActiveKPIId = item.KPIAssignment.FYActiveKPIId,
                        OfficeId = item.KPIAssignment.OfficeId,
                        OfficeName = item.KPIAssignment.Office != null ? item.KPIAssignment.Office.Name : string.Empty,
                        AssignedTargetAnnual = item.KPIAssignment.AssignedTargetAnnual,
                        AssignedTargetQ1 = item.KPIAssignment.AssignedTargetQ1,
                        AssignedTargetQ2 = item.KPIAssignment.AssignedTargetQ2,
                        AssignedTargetQ3 = item.KPIAssignment.AssignedTargetQ3,
                        AssignedTargetQ4 = item.KPIAssignment.AssignedTargetQ4,
                        IsLocked = item.KPIAssignment.IsLocked,
                        FYActiveKPI = item.KPIAssignment.FYActiveKPI == null ? null : new FYActiveKPIResponse
                        {
                            Id = item.KPIAssignment.FYActiveKPI.Id,
                            FiscalYearId = item.KPIAssignment.FYActiveKPI.FiscalYearId,
                            MasterKPIId = item.KPIAssignment.FYActiveKPI.MasterKPIId,
                            ParentKPIId = item.KPIAssignment.FYActiveKPI.ParentKPIId,
                            MFOPAPId = item.KPIAssignment.FYActiveKPI.MFOPAPId,
                            Name = item.KPIAssignment.FYActiveKPI.Name,
                            Code = item.KPIAssignment.FYActiveKPI.Code,
                            Description = item.KPIAssignment.FYActiveKPI.Description,
                            MeasurementUnit = item.KPIAssignment.FYActiveKPI.MeasurementUnit,
                            DistributionBehavior = item.KPIAssignment.FYActiveKPI.DistributionBehavior,
                            FunctionCategory = item.KPIAssignment.FYActiveKPI.FunctionCategory,
                            MonitoringFrequency = item.KPIAssignment.FYActiveKPI.MonitoringFrequency,
                            IsOptInAvailable = item.KPIAssignment.FYActiveKPI.IsOptInAvailable,
                            IsGAD = item.KPIAssignment.FYActiveKPI.IsGAD,
                            Status = item.KPIAssignment.FYActiveKPI.Status,
                            AgencyTargetAnnual = item.KPIAssignment.FYActiveKPI.AgencyTargetAnnual,
                            AgencyTargetQ1 = item.KPIAssignment.FYActiveKPI.AgencyTargetQ1,
                            AgencyTargetQ2 = item.KPIAssignment.FYActiveKPI.AgencyTargetQ2,
                            AgencyTargetQ3 = item.KPIAssignment.FYActiveKPI.AgencyTargetQ3,
                            AgencyTargetQ4 = item.KPIAssignment.FYActiveKPI.AgencyTargetQ4,
                            CreatedAt = item.KPIAssignment.FYActiveKPI.CreatedAt,
                            CreatedBy = item.KPIAssignment.FYActiveKPI.CreatedBy,
                            FYActiveKPIMeasurements = item.KPIAssignment.FYActiveKPI.FYActiveKPIMeasurements.Select(m => new FYActiveKPIMeasurementResponse
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
                            }).ToList(),
                            MFOPAP = item.KPIAssignment.FYActiveKPI.MasterKPI != null && item.KPIAssignment.FYActiveKPI.MasterKPI.MFOPAP != null
                                ? new MFOPAPResponse
                                {
                                    Id = item.KPIAssignment.FYActiveKPI.MasterKPI.MFOPAP.Id,
                                    ParentId = item.KPIAssignment.FYActiveKPI.MasterKPI.MFOPAP.ParentId,
                                    Name = item.KPIAssignment.FYActiveKPI.MasterKPI.MFOPAP.Name,
                                    Code = item.KPIAssignment.FYActiveKPI.MasterKPI.MFOPAP.Code,
                                    Type = item.KPIAssignment.FYActiveKPI.MasterKPI.MFOPAP.Type,
                                    IsActive = item.KPIAssignment.FYActiveKPI.MasterKPI.MFOPAP.IsActive
                                }
                                : item.KPIAssignment.FYActiveKPI.MFOPAP != null
                                    ? new MFOPAPResponse
                                    {
                                        Id = item.KPIAssignment.FYActiveKPI.MFOPAP.Id,
                                        ParentId = item.KPIAssignment.FYActiveKPI.MFOPAP.ParentId,
                                        Name = item.KPIAssignment.FYActiveKPI.MFOPAP.Name,
                                        Code = item.KPIAssignment.FYActiveKPI.MFOPAP.Code,
                                        Type = item.KPIAssignment.FYActiveKPI.MFOPAP.Type,
                                        IsActive = item.KPIAssignment.FYActiveKPI.MFOPAP.IsActive
                                    }
                                    : null,
                            Attributes = item.KPIAssignment.FYActiveKPI.MasterKPI != null
                                ? item.KPIAssignment.FYActiveKPI.MasterKPI.Attributes.Select(a => new AttributeResponse
                                {
                                    Id = a.Id,
                                    Name = a.Name,
                                    Code = a.Code,
                                    Description = a.Description,
                                    ParentAttributeId = a.ParentAttributeId
                                }).ToList()
                                : new List<AttributeResponse>(),
                            SDGs = item.KPIAssignment.FYActiveKPI.MasterKPI != null
                                ? item.KPIAssignment.FYActiveKPI.MasterKPI.SDGs.Select(s => new SDGResponse
                                {
                                    Id = s.Id,
                                    Name = s.Name,
                                    Description = s.Description
                                }).ToList()
                                : new List<SDGResponse>()
                        },
                        Office = item.KPIAssignment.Office == null ? null : new()
                        {
                            Id = item.KPIAssignment.Office.Id,
                            PositionCount = item.KPIAssignment.Office.Positions.Count(p => !p.IsDeleted),
                            Name = item.KPIAssignment.Office.Name,
                            Code = item.KPIAssignment.Office.Code,
                            Address = item.KPIAssignment.Office.Address,
                            Description = item.KPIAssignment.Office.Description,
                            ResponsibilityCenterCode = item.KPIAssignment.Office.ResponsibilityCenterCode,
                            BudgetCostCenter = item.KPIAssignment.Office.BudgetCostCenter,
                            OfficeTypeId = item.KPIAssignment.Office.OfficeTypeId,
                            OrganizationId = item.KPIAssignment.Office.OrganizationId,
                            CategoryId = item.KPIAssignment.Office.CategoryId,
                            AdministrativeLevelId = item.KPIAssignment.Office.AdministrativeLevelId,
                            ClusterId = item.KPIAssignment.Office.ClusterId,
                            ProcurementWorkflowId = item.KPIAssignment.Office.ProcurementWorkflowId,
                            ParentId = item.KPIAssignment.Office.ParentId,
                            OfficeType = item.KPIAssignment.Office.OfficeType != null ? new()
                            {
                                Id = item.KPIAssignment.Office.OfficeType.Id,
                                Name = item.KPIAssignment.Office.OfficeType.Name,
                                Code = item.KPIAssignment.Office.OfficeType.Code,
                                CanHaveChildren = item.KPIAssignment.Office.OfficeType.CanHaveChildren,
                                IsActive = item.KPIAssignment.Office.OfficeType.IsActive
                            } : null,
                            Organization = item.KPIAssignment.Office.Organization != null ? new()
                            {
                                Id = item.KPIAssignment.Office.Organization.Id,
                                ParentId = item.KPIAssignment.Office.Organization.ParentId,
                                Name = item.KPIAssignment.Office.Organization.Name,
                                Code = item.KPIAssignment.Office.Organization.Code,
                                Type = item.KPIAssignment.Office.Organization.Type,
                                IsActive = item.KPIAssignment.Office.Organization.IsActive
                            } : null,
                            Category = item.KPIAssignment.Office.Category != null ? new()
                            {
                                Id = item.KPIAssignment.Office.Category.Id,
                                Name = item.KPIAssignment.Office.Category.Name,
                                Code = item.KPIAssignment.Office.Category.Code,
                                CanHaveChildren = item.KPIAssignment.Office.Category.CanHaveChildren,
                                IsActive = item.KPIAssignment.Office.Category.IsActive
                            } : null,
                            AdministrativeLevel = item.KPIAssignment.Office.AdministrativeLevel != null ? new()
                            {
                                Id = item.KPIAssignment.Office.AdministrativeLevel.Id,
                                Name = item.KPIAssignment.Office.AdministrativeLevel.Name,
                                Code = item.KPIAssignment.Office.AdministrativeLevel.Code,
                                CanHaveChildren = item.KPIAssignment.Office.AdministrativeLevel.CanHaveChildren,
                                IsActive = item.KPIAssignment.Office.AdministrativeLevel.IsActive
                            } : null,
                            Cluster = item.KPIAssignment.Office.Cluster != null ? new()
                            {
                                Id = item.KPIAssignment.Office.Cluster.Id,
                                Name = item.KPIAssignment.Office.Cluster.Name,
                                Code = item.KPIAssignment.Office.Cluster.Code,
                                Address = item.KPIAssignment.Office.Cluster.Address,
                                MaxSubUnits = item.KPIAssignment.Office.Cluster.MaxSubUnits,
                                IsActive = item.KPIAssignment.Office.Cluster.IsActive
                            } : null,
                            ProcurementWorkflow = item.KPIAssignment.Office.ProcurementWorkflow != null ? new()
                            {
                                Id = item.KPIAssignment.Office.ProcurementWorkflow.Id,
                                Name = item.KPIAssignment.Office.ProcurementWorkflow.Name,
                                Code = item.KPIAssignment.Office.ProcurementWorkflow.Code,
                                ApprovalLevel = item.KPIAssignment.Office.ProcurementWorkflow.ApprovalLevel,
                                IsActive = item.KPIAssignment.Office.ProcurementWorkflow.IsActive
                            } : null,
                            ParentOffice = item.KPIAssignment.Office.Parent != null ? new()
                            {
                                Id = item.KPIAssignment.Office.Parent.Id,
                                Name = item.KPIAssignment.Office.Parent.Name,
                                Code = item.KPIAssignment.Office.Parent.Code
                            } : null
                        },
                        CreatedAt = item.KPIAssignment.CreatedAt,
                        CreatedBy = item.KPIAssignment.CreatedBy
                    },
                    OPCRActivities = item.OPCRActivities.Select(activity => new OPCRActivityResponse
                    {
                        Id = activity.Id,
                        OPCRItemId = activity.OPCRItemId,
                        Name = activity.Name,
                        Description = activity.Description,
                        Budget = activity.Budget,
                        PAPDepartments = activity.OPCRPAPDepartments.Select(dept => new OPCRPAPDepartmentResponse
                        {
                            Id = dept.Id,
                            OPCRActivityId = dept.OPCRActivityId,
                            Office = new()
                            {
                                Id = dept.Office!.Id,
                                PositionCount = dept.Office.Positions.Count(p => !p.IsDeleted),
                                Name = dept.Office.Name,
                                Code = dept.Office.Code,
                                Address = dept.Office.Address,
                                Description = dept.Office.Description,
                                ResponsibilityCenterCode = dept.Office.ResponsibilityCenterCode,
                                BudgetCostCenter = dept.Office.BudgetCostCenter,
                                OfficeTypeId = dept.Office.OfficeTypeId,
                                OrganizationId = dept.Office.OrganizationId,
                                CategoryId = dept.Office.CategoryId,
                                AdministrativeLevelId = dept.Office.AdministrativeLevelId,
                                ClusterId = dept.Office.ClusterId,
                                ProcurementWorkflowId = dept.Office.ProcurementWorkflowId,
                                ParentId = dept.Office.ParentId,
                                OfficeType = dept.Office.OfficeType != null ? new()
                                {
                                    Id = dept.Office.OfficeType.Id,
                                    Name = dept.Office.OfficeType.Name,
                                    Code = dept.Office.OfficeType.Code,
                                    CanHaveChildren = dept.Office.OfficeType.CanHaveChildren,
                                    IsActive = dept.Office.OfficeType.IsActive
                                } : null,
                                Organization = dept.Office.Organization != null ? new()
                                {
                                    Id = dept.Office.Organization.Id,
                                    ParentId = dept.Office.Organization.ParentId,
                                    Name = dept.Office.Organization.Name,
                                    Code = dept.Office.Organization.Code,
                                    Type = dept.Office.Organization.Type,
                                    IsActive = dept.Office.Organization.IsActive
                                } : null,
                                Category = dept.Office.Category != null ? new()
                                {
                                    Id = dept.Office.Category.Id,
                                    Name = dept.Office.Category.Name,
                                    Code = dept.Office.Category.Code,
                                    CanHaveChildren = dept.Office.Category.CanHaveChildren,
                                    IsActive = dept.Office.Category.IsActive
                                } : null,
                                AdministrativeLevel = dept.Office.AdministrativeLevel != null ? new()
                                {
                                    Id = dept.Office.AdministrativeLevel.Id,
                                    Name = dept.Office.AdministrativeLevel.Name,
                                    Code = dept.Office.AdministrativeLevel.Code,
                                    CanHaveChildren = dept.Office.AdministrativeLevel.CanHaveChildren,
                                    IsActive = dept.Office.AdministrativeLevel.IsActive
                                } : null,
                                Cluster = dept.Office.Cluster != null ? new()
                                {
                                    Id = dept.Office.Cluster.Id,
                                    Name = dept.Office.Cluster.Name,
                                    Code = dept.Office.Cluster.Code,
                                    Address = dept.Office.Cluster.Address,
                                    MaxSubUnits = dept.Office.Cluster.MaxSubUnits,
                                    IsActive = dept.Office.Cluster.IsActive
                                } : null,
                                ProcurementWorkflow = dept.Office.ProcurementWorkflow != null ? new()
                                {
                                    Id = dept.Office.ProcurementWorkflow.Id,
                                    Name = dept.Office.ProcurementWorkflow.Name,
                                    Code = dept.Office.ProcurementWorkflow.Code,
                                    ApprovalLevel = dept.Office.ProcurementWorkflow.ApprovalLevel,
                                    IsActive = dept.Office.ProcurementWorkflow.IsActive
                                } : null,
                                ParentOffice = dept.Office.Parent != null ? new()
                                {
                                    Id = dept.Office.Parent.Id,
                                    Name = dept.Office.Parent.Name,
                                    Code = dept.Office.Parent.Code
                                } : null
                            }
                        }).ToList()
                    }).ToList(),
                    CreatedAt = item.CreatedAt,
                    CreatedBy = item.CreatedBy
                }).ToList()
            });
        var opcr = await unitOfWork.OPCRRepository.GetFirstAsync(opcrQuery, cancellationToken) ?? throw new NotFoundException("No data found.");

        return ApiResponse<OPCRDetailedResponse>.Success(opcr, "OPCR retrieved successfully.");
    }
}
