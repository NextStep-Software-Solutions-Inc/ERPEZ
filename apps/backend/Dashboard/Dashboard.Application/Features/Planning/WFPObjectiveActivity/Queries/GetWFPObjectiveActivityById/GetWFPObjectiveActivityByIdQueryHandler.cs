using ERPEZ.Application.Features.Planning.Object.Dtos;
using ERPEZ.Application.Features.Planning.WFPObjective.Dtos;
using ERPEZ.Application.Features.Planning.WFPObjectiveActivity.Dtos;
using ERPEZ.Application.Features.Planning.WFPObjectiveActivityExpenditure.Dtos;
using ERPEZ.Application.Features.Planning.WFPObjectiveTimeline.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.WFPObjectiveActivity.Queries.GetWFPObjectiveActivityById;

public class GetWFPObjectiveActivityByIdQueryHandler(IUnitOfWork unitOfWork) 
    : IRequestHandler<GetWFPObjectiveActivityByIdQuery, ApiResponse<WFPObjectiveActivityDetailedResponse>>
{
    public async Task<ApiResponse<WFPObjectiveActivityDetailedResponse>> Handle(
        GetWFPObjectiveActivityByIdQuery request, 
        CancellationToken cancellationToken)
    {
        var targetQuery = unitOfWork.WFPObjectiveActivityRepository
            .Query(t => t.Id == request.Id)
            .Select(target => new WFPObjectiveActivityDetailedResponse
            {
                Id = target.Id,
                ActivityName = target.ActivityName,
                Indicator = target.Indicator,
                Weight = target.Weight,
                CreatedAt = target.CreatedAt,
                CreatedBy = target.CreatedBy,
                WFPObjective = target.WFPObjective != null ? new WFPObjectiveResponse
                {
                    Id = target.WFPObjective.Id,
                    WFPId = target.WFPObjective.WFPId,
                    Description = target.WFPObjective.Description,
                    Weight = target.WFPObjective.Weight,
                    Outcome = target.WFPObjective.Outcome,
                    CreatedAt = target.WFPObjective.CreatedAt,
                    CreatedBy = target.WFPObjective.CreatedBy,
                    WFPObjectiveActivities = new List<WFPObjectiveActivityResponse>()
                } : null,
                WFPObjectiveActivityExpenditures = target.WFPObjectiveActivityExpenditures.Select(exp => new WFPObjectiveActivityExpenditureResponse
                {
                    Id = exp.Id,
                    ItemDescription = exp.ItemDescription,
                    Quantity = exp.Quantity ?? 0,
                    UnitCost = exp.UnitCost ?? 0,
                    CreatedAt = exp.CreatedAt,
                    CreatedBy = exp.CreatedBy,
                    Object = new ObjectResponse
                    {
                        Id = exp.Object.Id,
                        Name = exp.Object.Name,
                        Code = exp.Object.Code,
                        IsActive = exp.Object.IsActive,
                        ChildObjectCount = exp.Object.ChildObjects.Count,
                        TransactionCount = exp.Object.Transactions.Count,
                        WFPObjectiveActivityExpenditureCount = exp.Object.WFPObjectiveActivityExpenditures.Count,
                        Parent = exp.Object.ParentObject != null ? new ObjectResponse
                        {
                            Id = exp.Object.ParentObject.Id,
                            Name = exp.Object.ParentObject.Name,
                            Code = exp.Object.ParentObject.Code,
                            IsActive = exp.Object.ParentObject.IsActive,
                            ChildObjectCount = exp.Object.ParentObject.ChildObjects.Count,
                            TransactionCount = exp.Object.ParentObject.Transactions.Count,
                            WFPObjectiveActivityExpenditureCount = exp.Object.ParentObject.WFPObjectiveActivityExpenditures.Count,
                            Parent = exp.Object.ParentObject.ParentObject != null ? new ObjectResponse
                            {
                                Id = exp.Object.ParentObject.ParentObject.Id,
                                Name = exp.Object.ParentObject.ParentObject.Name,
                                Code = exp.Object.ParentObject.ParentObject.Code,
                                IsActive = exp.Object.ParentObject.ParentObject.IsActive,
                                ChildObjectCount = exp.Object.ParentObject.ParentObject.ChildObjects.Count,
                                TransactionCount = exp.Object.ParentObject.ParentObject.Transactions.Count,
                                WFPObjectiveActivityExpenditureCount = exp.Object.ParentObject.ParentObject.WFPObjectiveActivityExpenditures.Count,
                                Parent = exp.Object.ParentObject.ParentObject.ParentObject != null ? new ObjectResponse
                                {
                                    Id = exp.Object.ParentObject.ParentObject.ParentObject.Id,
                                    Name = exp.Object.ParentObject.ParentObject.ParentObject.Name,
                                    Code = exp.Object.ParentObject.ParentObject.ParentObject.Code,
                                    IsActive = exp.Object.ParentObject.ParentObject.ParentObject.IsActive,
                                    ChildObjectCount = exp.Object.ParentObject.ParentObject.ParentObject.ChildObjects.Count,
                                    TransactionCount = exp.Object.ParentObject.ParentObject.ParentObject.Transactions.Count,
                                    WFPObjectiveActivityExpenditureCount = exp.Object.ParentObject.ParentObject.ParentObject.WFPObjectiveActivityExpenditures.Count,
                                } : null
                            } : null
                        } : null,
                    }
                }).ToList(),
                WFPObjectiveTimelines = target.WFPObjectiveTimelines.Select(tl => new WFPObjectiveTimelineResponse
                {
                    Id = tl.Id,
                    TargetValue = tl.TargetValue,
                    TimelineType = tl.TimelineType.ToString(),
                    StartDate = tl.StartDate,
                    EndDate = tl.EndDate,
                    CreatedAt = tl.CreatedAt,
                    CreatedBy = tl.CreatedBy
                }).ToList()
            });

        var response = await unitOfWork.WFPObjectiveActivityRepository.GetSingleAsync(targetQuery, cancellationToken) ?? throw new NotFoundException("WFP Objective Target not found.");

        // Validate required data after projection
        foreach (var expenditure in response.WFPObjectiveActivityExpenditures)
        {
            if (expenditure.Object is null)
            {
                throw new InvalidOperationException("Object is required for all expenditures.");
            }
        }

        return ApiResponse<WFPObjectiveActivityDetailedResponse>.Success(response, "Retrieved successfully.");
    }
}
