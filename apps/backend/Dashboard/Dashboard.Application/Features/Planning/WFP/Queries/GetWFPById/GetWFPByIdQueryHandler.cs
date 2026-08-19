using ERPEZ.Application.Features.Planning.WFPObjectiveActivityExpenditure.Dtos;
using ERPEZ.Application.Features.Planning.Office.Dtos;
using ERPEZ.Application.Features.Planning.Object.Dtos;
using ERPEZ.Application.Features.Planning.WFP.Dtos;
using ERPEZ.Application.Features.Planning.WFPObjective.Dtos;
using ERPEZ.Application.Features.Planning.WFPObjectiveActivity.Dtos;
using ERPEZ.Application.Features.Planning.WFPObjectiveTimeline.Dtos;
using ERPEZ.Application.Features.Planning.OPCR.Dtos;
using ERPEZ.Application.Features.Planning.OPCREvaluation.Dtos;
using ERPEZ.Application.Features.Planning.OPCRActivity.Dtos;
using ERPEZ.Application.Features.Planning.FundSource.Dtos;
using ERPEZ.Application.Features.Planning.FiscalYear.Dtos;
using ERPEZ.Application.Features.Planning.OPCRItemRating.Dtos;
using ERPEZ.Application.Features.Planning.OPCRItemMOV.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.WFP.Queries.GetWFPById;

public class GetWFPByIdQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetWFPByIdQuery, ApiResponse<WFPResponse>>
{
    public async Task<ApiResponse<WFPResponse>> Handle(GetWFPByIdQuery request, CancellationToken cancellationToken)
    {

        var wfpQuery = unitOfWork.WFPRepository
            .Query(w => w.Id == request.Id)
            .Select(w => new WFPResponse
            {
                Id = w.Id,
                Office = new()
                {
                    Id = w.Office.Id,
                    Name = w.Office.Name,
                    Code = w.Office.Code,
                    Address = w.Office.Address,
                    Description = w.Office.Description,
                    ResponsibilityCenterCode = w.Office.ResponsibilityCenterCode,
                    BudgetCostCenter = w.Office.BudgetCostCenter,
                    OfficeTypeId = w.Office.OfficeTypeId,
                    OrganizationId = w.Office.OrganizationId,
                    CategoryId = w.Office.CategoryId,
                    AdministrativeLevelId = w.Office.AdministrativeLevelId,
                    ClusterId = w.Office.ClusterId,
                    ProcurementWorkflowId = w.Office.ProcurementWorkflowId,
                    ParentId = w.Office.ParentId,
                },
                ProjectTitle = w.ProjectTitle,
                OPCRId = w.OPCRId,
                OPCR = w.OPCR != null ? new OPCRDetailedResponse
                {
                    Id = w.OPCR.Id,
                    Name = w.OPCR.Name,
                    Code = w.OPCR.Code,
                    Office = new()
                    {
                        Id = w.OPCR.Office.Id,
                        Name = w.OPCR.Office.Name,
                        Code = w.OPCR.Office.Code,
                        Address = w.OPCR.Office.Address,
                        Description = w.OPCR.Office.Description,
                        ResponsibilityCenterCode = w.OPCR.Office.ResponsibilityCenterCode,
                        BudgetCostCenter = w.OPCR.Office.BudgetCostCenter,
                        OfficeTypeId = w.OPCR.Office.OfficeTypeId,
                        OrganizationId = w.OPCR.Office.OrganizationId,
                        CategoryId = w.OPCR.Office.CategoryId,
                        AdministrativeLevelId = w.OPCR.Office.AdministrativeLevelId,
                        ClusterId = w.OPCR.Office.ClusterId,
                        ProcurementWorkflowId = w.OPCR.Office.ProcurementWorkflowId,
                        ParentId = w.OPCR.Office.ParentId,
                    },
                    FiscalYear = new FiscalYearResponse
                    {
                        Id = w.OPCR.FiscalYear.Id,
                        Year = w.OPCR.FiscalYear.Year,
                        Description = w.OPCR.FiscalYear.Description,
                        Status = w.OPCR.FiscalYear.Status,
                        IsLocked = w.OPCR.FiscalYear.IsLocked,
                        StartDate = w.OPCR.FiscalYear.StartDate,
                        EndDate = w.OPCR.FiscalYear.EndDate,
                        FunctionAllocations = w.OPCR.FiscalYear.FunctionAllocations.Select(fa => new FunctionAllocationResponse
                        {
                            Id = fa.Id,
                            FunctionType = fa.FunctionType.ToString(),
                            Percentage = fa.Percentage,
                        }).ToList(),
                    },
                    CommitmentStatus = w.OPCR.CommitmentStatus,
                    ReviewStatus = w.OPCR.ReviewStatus,
                    SubmittedDate = w.OPCR.SubmittedDate.HasValue ? DateOnly.FromDateTime(w.OPCR.SubmittedDate.Value) : null,
                    ReturnedDate = null,
                    TotalBudget = w.OPCR.OPCRItems
                        .SelectMany(i => i.OPCRActivities)
                        .Sum(a => a.Budget),
                    EvaluationCount = w.OPCR.OPCREvaluations.Count,
                    KPIAssignmentCount = w.OPCR.OPCRItems
                        .Select(i => i.KPIAssignmentId)
                        .Distinct()
                        .Count(),
                    ActivityCount = w.OPCR.OPCRItems
                        .SelectMany(i => i.OPCRActivities)
                        .Count(),
                    OPCREvaluations = w.OPCR.OPCREvaluations.Select(oe => new OPCREvaluationResponse
                    {
                        Id = oe.Id,
                        OPCRId = oe.OPCRId,
                        EvaluatorId = oe.EvaluatorId,
                        EvaluationDate = oe.EvaluationDate,
                        Comments = oe.Comments,
                        Status = oe.Status,
                        CreatedAt = oe.CreatedAt,
                        CreatedBy = oe.CreatedBy,
                    }).ToList(),
                    OPCRItems = w.OPCR.OPCRItems.Select(oi => new OPCRItemResponse
                    {
                        Id = oi.Id,
                        OPCRId = oi.OPCRId,
                        KPIAssignmentId = oi.KPIAssignmentId,
                        Q1Target = oi.Q1Target,
                        Q2Target = oi.Q2Target,
                        Q3Target = oi.Q3Target,
                        Q4Target = oi.Q4Target,
                        IsShopped = oi.IsShopped,
                        KPIAssignment = null,
                        OPCRActivities = new List<OPCRActivityResponse>(),
                        CreatedAt = oi.CreatedAt,
                        CreatedBy = oi.CreatedBy,
                    }).ToList(),
                    CreatedAt = w.OPCR.CreatedAt,
                    CreatedBy = w.OPCR.CreatedBy,
                    UpdatedAt = w.OPCR.UpdatedAt,
                    UpdatedBy = w.OPCR.UpdatedBy,
                } : null,
                FundSourceId = w.FundSourceId,
                FundSource = w.FundSource != null ? new FundSourceResponse
                {
                    Id = w.FundSource.Id,
                    ParentId = w.FundSource.ParentId,
                    Parent = w.FundSource.ParentSource != null ? new FundSourceResponse
                    {
                        Id = w.FundSource.ParentSource.Id,
                        ParentId = w.FundSource.ParentSource.ParentId,
                        Parent = null,
                        Name = w.FundSource.ParentSource.Name,
                        Code = w.FundSource.ParentSource.Code,
                        Type = w.FundSource.ParentSource.Type.ToString(),
                        IsActive = w.FundSource.ParentSource.IsActive,
                        FiscalYearId = w.FundSource.ParentSource.FiscalYearId,
                        FiscalYear = null,
                        TotalReceivedFunds = 0m,
                        TotalDUAllocatedFunds = 0m,
                        CreatedAt = w.FundSource.ParentSource.CreatedAt,
                        CreatedBy = w.FundSource.ParentSource.CreatedBy,
                    } : null,
                    Name = w.FundSource.Name,
                    Code = w.FundSource.Code,
                    Type = w.FundSource.Type.ToString(),
                    IsActive = w.FundSource.IsActive,
                    FiscalYearId = w.FundSource.FiscalYearId,
                    FiscalYear = w.FundSource.FiscalYear != null ? new FiscalYearResponse
                    {
                        Id = w.FundSource.FiscalYear.Id,
                        Year = w.FundSource.FiscalYear.Year,
                        Description = w.FundSource.FiscalYear.Description,
                        Status = w.FundSource.FiscalYear.Status,
                        IsLocked = w.FundSource.FiscalYear.IsLocked,
                        StartDate = w.FundSource.FiscalYear.StartDate,
                        EndDate = w.FundSource.FiscalYear.EndDate,
                        FunctionAllocations = w.FundSource.FiscalYear.FunctionAllocations.Select(fa => new FunctionAllocationResponse
                        {
                            Id = fa.Id,
                            FunctionType = fa.FunctionType.ToString(),
                            Percentage = fa.Percentage,
                        }).ToList(),
                    } : null,
                    TotalReceivedFunds = 0m,
                    TotalDUAllocatedFunds = 0m,
                    CreatedAt = w.FundSource.CreatedAt,
                    CreatedBy = w.FundSource.CreatedBy,
                } : null,
                GeneralObjective = w.GeneralObjective,
                Mode = w.Mode.ToString(),
                Status = w.Status.ToString(),
                CreatedBy = w.CreatedBy,
                CreatedAt = w.CreatedAt,
                UpdatedAt = w.UpdatedAt,
                UpdatedBy = w.UpdatedBy,
                SubmittedDate = w.SubmittedDate,
                ApprovedDate = w.ApprovedDate,
                ObjectiveCount = w.WFPObjectives.Count,
                ActivityCount = w.WFPObjectives.SelectMany(o => o.WFPObjectiveActivities).Count(),
                WFPObjectives = w.WFPObjectives.Select(o => new WFPObjectiveResponse
                {
                    Id = o.Id,
                    Outcome = o.Outcome,
                    Weight = o.Weight,
                    Description = o.Description,
                    CreatedAt = o.CreatedAt,
                    CreatedBy = o.CreatedBy,
                    UpdatedAt = o.UpdatedAt,
                    UpdatedBy = o.UpdatedBy,
                    WFPObjectiveActivities = o.WFPObjectiveActivities.Select(t => new WFPObjectiveActivityResponse
                    {
                        Id = t.Id,
                        ActivityName = t.ActivityName,
                        Indicator = t.Indicator,
                        Weight = t.Weight,
                        CreatedAt = t.CreatedAt,
                        CreatedBy = t.CreatedBy,
                        UpdatedAt = t.UpdatedAt,
                        UpdatedBy = t.UpdatedBy,
                        WFPObjectiveTimelines = t.WFPObjectiveTimelines.Select(ot => new WFPObjectiveTimelineResponse
                        {
                            Id = ot.Id,
                            TimelineType = ot.TimelineType.ToString(),
                            EndDate = ot.EndDate,
                            StartDate = ot.StartDate,
                            TargetValue = ot.TargetValue,
                            CreatedAt = ot.CreatedAt,
                            CreatedBy = ot.CreatedBy,
                            UpdatedAt = ot.UpdatedAt,
                            UpdatedBy = ot.UpdatedBy,
                        }).ToList(),
                        WFPObjectiveActivityExpenditures = t.WFPObjectiveActivityExpenditures.Select(ab => new WFPObjectiveActivityExpenditureResponse
                        {
                            Id = ab.Id,
                            ItemDescription = ab.ItemDescription,
                            Quantity = ab.Quantity ?? 0,
                            UnitCost = ab.UnitCost ?? 0,
                            CreatedAt = ab.CreatedAt,
                            CreatedBy = ab.CreatedBy,
                            UpdatedAt = ab.UpdatedAt,
                            UpdatedBy = ab.UpdatedBy,
                            Object = new ObjectResponse
                            {
                                Id = ab.Object.Id,
                                Name = ab.Object.Name,
                                Code = ab.Object.Code,
                                IsActive = ab.Object.IsActive,
                                ChildObjectCount = ab.Object.ChildObjects.Count,
                                WFPObjectiveActivityExpenditureCount = ab.Object.WFPObjectiveActivityExpenditures.Count,
                                TransactionCount = ab.Object.Transactions.Count,
                                Parent = ab.Object.ParentObject != null ? new ObjectResponse
                                {
                                    Id = ab.Object.ParentObject.Id,
                                    Name = ab.Object.ParentObject.Name,
                                    Code = ab.Object.ParentObject.Code,
                                    IsActive = ab.Object.ParentObject.IsActive,
                                    ChildObjectCount = ab.Object.ParentObject.ChildObjects.Count,
                                    WFPObjectiveActivityExpenditureCount = ab.Object.ParentObject.WFPObjectiveActivityExpenditures.Count,
                                    TransactionCount = ab.Object.ParentObject.Transactions.Count,
                                    Parent = ab.Object.ParentObject.ParentObject != null ? new ObjectResponse
                                    {
                                        Id = ab.Object.ParentObject.ParentObject.Id,
                                        Name = ab.Object.ParentObject.ParentObject.Name,
                                        Code = ab.Object.ParentObject.ParentObject.Code,
                                        IsActive = ab.Object.ParentObject.ParentObject.IsActive,
                                        ChildObjectCount = ab.Object.ParentObject.ParentObject.ChildObjects.Count,
                                        WFPObjectiveActivityExpenditureCount = ab.Object.ParentObject.ParentObject.WFPObjectiveActivityExpenditures.Count,
                                        TransactionCount = ab.Object.ParentObject.ParentObject.Transactions.Count,
                                        Parent = ab.Object.ParentObject.ParentObject.ParentObject != null ? new ObjectResponse
                                        {
                                            Id = ab.Object.ParentObject.ParentObject.ParentObject.Id,
                                            Name = ab.Object.ParentObject.ParentObject.ParentObject.Name,
                                            Code = ab.Object.ParentObject.ParentObject.ParentObject.Code,
                                            IsActive = ab.Object.ParentObject.ParentObject.ParentObject.IsActive,
                                            ChildObjectCount = ab.Object.ParentObject.ParentObject.ParentObject.ChildObjects.Count,
                                            WFPObjectiveActivityExpenditureCount = ab.Object.ParentObject.ParentObject.ParentObject.WFPObjectiveActivityExpenditures.Count,
                                            TransactionCount = ab.Object.ParentObject.ParentObject.ParentObject.Transactions.Count
                                        } : null!
                                    } : null!
                                } : null!,
                            }
                        }).ToList(),
                    }).ToList(),
                }).ToList(),
                ProjectStartDate = w.ProjectStartDate,
                ProjectEndDate = w.ProjectEndDate,
                ProposedBudget = w.ProposedBudget,
            });
        
    
        var wfp = await unitOfWork.WFPRepository.GetFirstAsync(wfpQuery, cancellationToken: cancellationToken) ?? throw new NotFoundException("No data found.");

        return ApiResponse<WFPResponse>.Success(wfp, "WFP retrieved successfully.");
    }
}
