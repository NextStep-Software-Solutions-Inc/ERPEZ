using ERPEZ.Application.Features.Planning.WFPObjectiveTargetExpenditure.Dtos;
using ERPEZ.Application.Features.Planning.Object.Dtos;
using ERPEZ.Application.Features.Planning.WFPObjective.Dtos;
using ERPEZ.Application.Features.Planning.WFPObjectiveTimeline.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;
using ERPEZ.Application.Features.Planning.WFPObjectiveTarget.Dtos;

namespace ERPEZ.Application.Features.Planning.WFPObjective.Queries.GetWFPObjectiveById;

public class GetWFPObjectiveByIdQueryHandler(IUnitOfWork unitOfWork) 
    : IRequestHandler<GetWFPObjectiveByIdQuery, ApiResponse<WFPObjectiveDetailedResponse>>
{
    public async Task<ApiResponse<WFPObjectiveDetailedResponse>> Handle(
        GetWFPObjectiveByIdQuery request, 
        CancellationToken cancellationToken)
    {
        var wfpObjectiveQuery = unitOfWork.WFPObjectiveRepository
            .Query(o => o.Id == request.Id)
            .Select(o => new WFPObjectiveDetailedResponse
            {
                Id = o.Id,
                Description = o.Description,
                Weight = o.Weight,
                Outcome = o.Outcome,
                CreatedAt = o.CreatedAt,
                CreatedBy = o.CreatedBy,
                WFP = new ()
                {
                    Id = o.WFP.Id,
                    Description = o.WFP.Description,
                    GeneralObjective = o.WFP.GeneralObjective,
                    ProjectEndDate = o.WFP.ProjectEndDate,
                    ProjectStartDate = o.WFP.ProjectStartDate,
                    ProjectTitle = o.WFP.ProjectTitle,
                    ProposedBudget = o.WFP.ProposedBudget,
                    Mode = o.WFP.Mode,
                    Status = o.WFP.Status.ToString(),
                    ObjectiveCount = o.WFP.WFPObjectives.Count,
                    Office = new ()
                    {
                        Id = o.WFP.Office.Id,
                        Name = o.WFP.Office.Name,
                        Code = o.WFP.Office.Code,
                        Address = o.WFP.Office.Address,
                        OfficeTypeId = o.WFP.Office.OfficeTypeId,
                        OrganizationId = o.WFP.Office.OrganizationId,
                        CategoryId = o.WFP.Office.CategoryId,
                        AdministrativeLevelId = o.WFP.Office.AdministrativeLevelId
                    },
                    CreatedAt = o.WFP.CreatedAt,
                    CreatedBy = o.WFP.CreatedBy,
                    FiscalYear = o.WFP.FiscalYear != null ? new ()
                    {   
                        Id = o.WFP.FiscalYear.Id,
                        Year = o.WFP.FiscalYear.Year,
                        Description = o.WFP.FiscalYear.Description,
                    } : null,
                },
                WFPObjectiveTargets = o.WFPObjectiveTargets.Select(t => new WFPObjectiveTargetDetailedResponse
                {
                    Id = t.Id,
                    ActivityName = t.ActivityName,
                    Indicator = t.Indicator,
                    Weight = t.Weight,
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
                        }
                    }).ToList(),
                    WFPObjectiveTimelines = t.WFPObjectiveTimelines.Select(ot => new WFPObjectiveTimelineResponse
                    {
                        Id = ot.Id,
                        TimelineType = ot.TimelineType.ToString(),
                        StartDate = ot.StartDate,
                        EndDate = ot.EndDate,
                        TargetValue = ot.TargetValue,
                        CreatedAt = ot.CreatedAt,
                        CreatedBy = ot.CreatedBy,
                    }).ToList()
                }).ToList()
            });

        var wfpObjective = await unitOfWork.WFPObjectiveRepository.GetFirstAsync(wfpObjectiveQuery, cancellationToken: cancellationToken) 
            ?? throw new NotFoundException("Work and Financial Plan Objective not found.");

        return ApiResponse<WFPObjectiveDetailedResponse>.Success(wfpObjective, "Retrieved successfully");
    }
}
