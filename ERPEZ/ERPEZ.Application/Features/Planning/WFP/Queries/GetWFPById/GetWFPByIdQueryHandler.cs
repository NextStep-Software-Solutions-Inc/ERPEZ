using ERPEZ.Application.Features.Planning.WFPObjectiveTargetExpenditure.Dtos;
using ERPEZ.Application.Features.Planning.DeliveryUnit.Dtos;
using ERPEZ.Application.Features.Planning.FiscalYear.Dtos;
using ERPEZ.Application.Features.Planning.MFOPAP.Dtos;
using ERPEZ.Application.Features.Planning.Object.Dtos;
using ERPEZ.Application.Features.Planning.WFP.Dtos;
using ERPEZ.Application.Features.Planning.WFPObjective.Dtos;
using ERPEZ.Application.Features.Planning.WFPObjectiveTarget.Dtos;
using ERPEZ.Application.Features.Planning.WFPObjectiveTimeline.Dtos;
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
                DeliveryUnit = new()
                {
                    Id = w.DeliveryUnit.Id,
                    Office = new()
                    {
                        Id = w.DeliveryUnit.Office.Id,
                        Name = w.DeliveryUnit.Office.Name,
                        Code = w.DeliveryUnit.Office.Code,
                        Address = w.DeliveryUnit.Office.Address,
                        ClusterId = w.DeliveryUnit.Office.ClusterId,
                        Description = w.DeliveryUnit.Office.Description,
                        ResponsibilityCenterCode = w.DeliveryUnit.Office.ResponsibilityCenterCode,
                        CreatedBy = w.DeliveryUnit.Office.CreatedBy,
                        CreatedAt = w.DeliveryUnit.Office.CreatedAt,
                        Cluster = w.DeliveryUnit.Office.Cluster != null ? new()
                            {
                                Id = w.DeliveryUnit.Office.Cluster.Id,
                                Name = w.DeliveryUnit.Office.Cluster.Name,
                                CreatedBy = w.DeliveryUnit.Office.Cluster.CreatedBy,
                                CreatedAt = w.DeliveryUnit.Office.Cluster.CreatedAt,
                            } : null,
                    },
                   
                    CreatedAt = w.DeliveryUnit.CreatedAt,
                    ParentId = w.DeliveryUnit.ParentId,
                    KPITargetAssignments = w.DeliveryUnit.KPITargetAssignments.Select(ka => new KPITargetAssignmentResponse
                    {
                        Id = ka.Id,
                        KPI = new()
                        {
                            Id = ka.KPI.Id,
                            Name = ka.KPI.Name,
                            Description = ka.KPI.Description,
                            FunctionType = ka.KPI.FunctionType,
                            MFOPAP = ka.KPI.MFOPAP != null ? new MFOPAPResponse
                            {
                                Id = ka.KPI.MFOPAP.Id,
                                Name = ka.KPI.MFOPAP.Name,
                                Code = ka.KPI.MFOPAP.Code,
                                Type = ka.KPI.MFOPAP.Type,
                                IsActive = ka.KPI.MFOPAP.IsActive,
                                ParentId = ka.KPI.MFOPAP.ParentId,
                            } : null,
                            SDGs = ka.KPI.SDGs.Select(s => s.Name).ToList(),
                        },
                    }).ToList(),
                    SubDeliveryUnits = w.DeliveryUnit.SubDeliveryUnits.Select(sdu => new DeliveryUnitResponse
                    {
                        Id = sdu.Id,
                        Office = new()
                        {
                            Id = sdu.Office.Id,
                            Name = sdu.Office.Name,
                            Code = sdu.Office.Code,
                            Address = sdu.Office.Address,
                            ClusterId = sdu.Office.ClusterId,
                            Description = sdu.Office.Description,
                            ResponsibilityCenterCode = sdu.Office.ResponsibilityCenterCode,
                            CreatedBy = sdu.Office.CreatedBy,
                            CreatedAt = sdu.Office.CreatedAt,
                            Cluster = sdu.Office.Cluster != null ? new()
                                {
                                    Id = sdu.Office.Cluster.Id,
                                    Name = sdu.Office.Cluster.Name,
                                    CreatedBy = sdu.Office.Cluster.CreatedBy,
                                    CreatedAt = sdu.Office.Cluster.CreatedAt,
                                } : null,
                        },
                       
                        CreatedAt = sdu.CreatedAt,
                        ParentId = sdu.ParentId,
                    }).ToList(),
                },
                ProjectTitle = w.ProjectTitle,
                GeneralObjective = w.GeneralObjective,
                Status = w.Status.ToString(),
                CreatedBy = w.CreatedBy,
                CreatedAt = w.CreatedAt,
                ObjectiveCount = w.WFPObjectives.Count,
                ActivityCount = w.WFPObjectives.SelectMany(o => o.WFPObjectiveTargets).Count(),
                WFPObjectives = w.WFPObjectives.Select(o => new WFPObjectiveResponse
                {
                    Id = o.Id,
                    Outcome = o.Outcome,
                    Weight = o.Weight,
                    Description = o.Description,
                    CreatedAt = o.CreatedAt,
                    CreatedBy = o.CreatedBy,
                    WFPObjectiveTargets = o.WFPObjectiveTargets.Select(t => new WFPObjectiveTargetResponse
                    {
                        Id = t.Id,
                        ActivityName = t.ActivityName,
                        Indicator = t.Indicator,
                        Weight = t.Weight,
                        CreatedAt = t.CreatedAt,
                        CreatedBy = t.CreatedBy,
                        WFPObjectiveTimelines = t.WFPObjectiveTimelines.Select(ot => new WFPObjectiveTimelineResponse
                        {
                            Id = ot.Id,
                            TimelineType = ot.TimelineType.ToString(),
                            EndDate = ot.EndDate,
                            StartDate = ot.StartDate,
                            TargetValue = ot.TargetValue,
                            CreatedAt = ot.CreatedAt,
                            CreatedBy = ot.CreatedBy,
                        }).ToList(),
                        WFPObjectiveTargetExpenditures = t.WFPObjectiveTargetExpenditures.Select(ab => new WFPObjectiveTargetExpenditureResponse
                        {
                            Id = ab.Id,
                            ItemDescription = ab.ItemDescription,
                            Quantity = ab.Quantity,
                            CostEstimates = ab.CostEstimates,
                            CreatedAt = ab.CreatedAt,
                            CreatedBy = ab.CreatedBy,
                            Object = new ObjectResponse
                            {
                                Id = ab.Object.Id,
                                Name = ab.Object.Name,
                                Code = ab.Object.Code,
                                IsActive = ab.Object.IsActive,
                                ChildObjectCount = ab.Object.ChildObjects.Count,
                                WFPObjectiveTargetExpenditureCount = ab.Object.WFPObjectiveTargetExpenditures.Count,
                                TransactionCount = ab.Object.Transactions.Count,
                                Parent = ab.Object.ParentObject != null ? new ObjectResponse
                                {
                                    Id = ab.Object.ParentObject.Id,
                                    Name = ab.Object.ParentObject.Name,
                                    Code = ab.Object.ParentObject.Code,
                                    IsActive = ab.Object.ParentObject.IsActive,
                                    ChildObjectCount = ab.Object.ParentObject.ChildObjects.Count,
                                    WFPObjectiveTargetExpenditureCount = ab.Object.ParentObject.WFPObjectiveTargetExpenditures.Count,
                                    TransactionCount = ab.Object.ParentObject.Transactions.Count,
                                    Parent = ab.Object.ParentObject.ParentObject != null ? new ObjectResponse
                                    {
                                        Id = ab.Object.ParentObject.ParentObject.Id,
                                        Name = ab.Object.ParentObject.ParentObject.Name,
                                        Code = ab.Object.ParentObject.ParentObject.Code,
                                        IsActive = ab.Object.ParentObject.ParentObject.IsActive,
                                        ChildObjectCount = ab.Object.ParentObject.ParentObject.ChildObjects.Count,
                                        WFPObjectiveTargetExpenditureCount = ab.Object.ParentObject.ParentObject.WFPObjectiveTargetExpenditures.Count,
                                        TransactionCount = ab.Object.ParentObject.ParentObject.Transactions.Count,
                                        Parent = ab.Object.ParentObject.ParentObject.ParentObject != null ? new ObjectResponse
                                        {
                                            Id = ab.Object.ParentObject.ParentObject.ParentObject.Id,
                                            Name = ab.Object.ParentObject.ParentObject.ParentObject.Name,
                                            Code = ab.Object.ParentObject.ParentObject.ParentObject.Code,
                                            IsActive = ab.Object.ParentObject.ParentObject.ParentObject.IsActive,
                                            ChildObjectCount = ab.Object.ParentObject.ParentObject.ParentObject.ChildObjects.Count,
                                            WFPObjectiveTargetExpenditureCount = ab.Object.ParentObject.ParentObject.ParentObject.WFPObjectiveTargetExpenditures.Count,
                                            TransactionCount = ab.Object.ParentObject.ParentObject.ParentObject.Transactions.Count
                                        } : null!
                                    } : null!
                                } : null!,
                            }
                        }).ToList(),
                    }).ToList(),
                }).ToList(),
                Description = w.Description,
                ProjectStartDate = w.ProjectStartDate,
                ProjectEndDate = w.ProjectEndDate,
                ProposedBudget = w.ProposedBudget,
                FiscalYear = w.FiscalYear != null ? new FiscalYearResponse
                {
                    Id = w.FiscalYear.Id,
                    Year = w.FiscalYear.Year,
                    Description = w.FiscalYear.Description,
                    FunctionAllocations = w.FiscalYear.FunctionAllocations.Select(fa => new FunctionAllocationResponse
                    {
                        Id = fa.Id,
                        FunctionType = fa.FunctionType.ToString(),
                        Percentage = fa.Percentage,
                    }).ToList(),
                } : null,
            });
        
    
        var wfp = await unitOfWork.WFPRepository.GetFirstAsync(wfpQuery, cancellationToken: cancellationToken) ?? throw new NotFoundException("No data found.");

        return ApiResponse<WFPResponse>.Success(wfp, "WFP retrieved successfully.");
    }
}
