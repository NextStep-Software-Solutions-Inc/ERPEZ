using ERPEZ.Application.Features.Planning.ActivityBudgetRequirement.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.ActivityBudgetRequirement.Queries.GetABRById;

public class GetActivityBudgetRequirementByIdQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetActivityBudgetRequirementByIdQuery, ApiResponse<ActivityBudgetRequirementResponse>>
{
    public async Task<ApiResponse<ActivityBudgetRequirementResponse>> Handle(GetActivityBudgetRequirementByIdQuery request, CancellationToken cancellationToken)
    {
        var abr = await unitOfWork.ActivityBudgetRequirementRepository.FindAsync(
           t => t.Id == request.Id,
            cancellationToken: cancellationToken) ?? throw new NotFoundException("No data found.");
        var result = new ActivityBudgetRequirementResponse()
        {
            Id = abr.Id,
            WFPObjectiveTargetId = abr.WFPObjectiveTargetId,
            Object = new()
            {
                Id = abr.Object.Id,
                ParentId = abr.Object.ParentId,
                Name = abr.Object.Name,
                Code = abr.Object.Code,
            },
            ItemDescription = abr.ItemDescription ?? string.Empty,
            Quantity = abr.Quantity,
            CostEstimates = abr.CostEstimates,
            CreatedBy = abr.CreatedBy ?? string.Empty,
            CreatedAt = abr.CreatedAt
        };
        return ApiResponse<ActivityBudgetRequirementResponse>.Success(result, "Retrieved successfully");
    }
}
