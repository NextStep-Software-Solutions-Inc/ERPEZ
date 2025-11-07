using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.ActivityBudgetRequirement.Commands.DeleteABR;

public class DeleteActivityBudgetRequirementCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<DeleteActivityBudgetRequirementCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(DeleteActivityBudgetRequirementCommand request, CancellationToken cancellationToken)
    {
        var abr = await unitOfWork.ActivityBudgetRequirementRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken) ?? throw new NotFoundException("Activity Budget Requirement not found.");

        unitOfWork.ActivityBudgetRequirementRepository.Remove(abr);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, $"Activity Budget Requirement with ID {request.Id} deleted successfully.");
    }
}
