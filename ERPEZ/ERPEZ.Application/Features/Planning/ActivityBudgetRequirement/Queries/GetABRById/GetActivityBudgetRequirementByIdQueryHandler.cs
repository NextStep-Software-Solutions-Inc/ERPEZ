using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.ActivityBudgetRequirement.Queries.GetABRById;

public class GetActivityBudgetRequirementByIdQueryHandler(IUnitOfWork _unitOfWork) : IRequestHandler<GetActivityBudgetRequirementByIdQuery, ApiResponse<Domain.Entities.Planning.ActivityBudgetRequirement>>
{
    public async Task<ApiResponse<Domain.Entities.Planning.ActivityBudgetRequirement>> Handle(GetActivityBudgetRequirementByIdQuery request, CancellationToken cancellationToken)
    {
        var abr = await _unitOfWork.ActivityBudgetRequirementRepository.FindAsync(
           t => t.Id == request.Id,
            cancellationToken: cancellationToken) ?? throw new NotFoundException("No data found.");

        return ApiResponse<Domain.Entities.Planning.ActivityBudgetRequirement>.Success(abr, "Retrieved successfully");
    }
}
