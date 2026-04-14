using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Budgeting.AgencyMasterBudget.Commands.DeleteAgencyMasterBudget;

public class DeleteAgencyMasterBudgetCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<DeleteAgencyMasterBudgetCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(DeleteAgencyMasterBudgetCommand command, CancellationToken cancellationToken)
    {
        var entity = await unitOfWork.AgencyMasterBudgetRepository.GetByIdAsync(command.Id, cancellationToken)
            ?? throw new NotFoundException($"Agency Master Budget with ID {command.Id} not found.");

        unitOfWork.AgencyMasterBudgetRepository.Remove(entity);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "Agency Master Budget deleted successfully.");
    }
}

