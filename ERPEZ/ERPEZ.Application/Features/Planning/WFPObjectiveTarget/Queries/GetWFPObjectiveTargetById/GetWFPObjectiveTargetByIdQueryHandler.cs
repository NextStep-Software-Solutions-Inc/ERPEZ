using ERPEZ.Application.Features.Planning.Object.Dtos;
using ERPEZ.Application.Features.Planning.WFPObjective.Dtos;
using ERPEZ.Application.Features.Planning.WFPObjectiveTarget.Dtos;
using ERPEZ.Application.Features.Planning.WFPObjectiveTargetExpenditure.Dtos;
using ERPEZ.Application.Features.Planning.WFPObjectiveTimeline.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.WFPObjectiveTarget.Queries.GetWFPObjectiveTargetById;

public class GetWFPObjectiveTargetByIdQueryHandler(IUnitOfWork unitOfWork) 
    : IRequestHandler<GetWFPObjectiveTargetByIdQuery, ApiResponse<WFPObjectiveTargetFullResponse>>
{
    public async Task<ApiResponse<WFPObjectiveTargetFullResponse>> Handle(
        GetWFPObjectiveTargetByIdQuery request, 
        CancellationToken cancellationToken)
    {
#pragma warning disable CS8601 // Possible null reference assignment.
        var targetQuery = unitOfWork.WFPObjectiveTargetRepository
            .Query(t => t.Id == request.Id)
            .Select(target => new WFPObjectiveTargetFullResponse
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
                    WFPObjectiveTargets = new List<WFPObjectiveTargetResponse>()
                } : null,
                WFPObjectiveTargetExpenditures = target.WFPObjectiveTargetExpenditures.Select(exp => new WFPObjectiveTargetExpenditureResponse
                {
                    Id = exp.Id,
                    WFPObjectiveTargetId = exp.WFPObjectiveTargetId,
                    ItemDescription = exp.ItemDescription,
                    Quantity = exp.Quantity,
                    CostEstimates = exp.CostEstimates,
                    CreatedAt = exp.CreatedAt,
                    CreatedBy = exp.CreatedBy,
                    Object = exp.Object != null ? new ObjectResponse
                    {
                        Id = exp.Object.Id,
                        Name = exp.Object.Name,
                        Code = exp.Object.Code,
                        ParentId = exp.Object.ParentId,
                        IsActive = exp.Object.IsActive
                    } : null
                }).ToList(),
                WFPObjectiveTimelines = target.WFPObjectiveTimelines.Select(tl => new WFPObjectiveTimelineResponse
                {
                    Id = tl.Id,
                    WFPObjectiveTargetId = tl.WFPObjectiveTargetId,
                    StartDate = tl.StartDate,
                    EndDate = tl.EndDate,
                    CreatedAt = tl.CreatedAt,
                    CreatedBy = tl.CreatedBy
                }).ToList()
            });

        var response = await unitOfWork.WFPObjectiveTargetRepository.GetSingleAsync(targetQuery, cancellationToken) ?? throw new NotFoundException("WFP Objective Target not found.");

        // Validate required data after projection
        foreach (var expenditure in response.WFPObjectiveTargetExpenditures)
        {
            if (expenditure.Object is null)
            {
                throw new InvalidOperationException("Object is required for all expenditures.");
            }
        }

        return ApiResponse<WFPObjectiveTargetFullResponse>.Success(response, "Retrieved successfully.");
    }
}
