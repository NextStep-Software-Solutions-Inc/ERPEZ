using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Budgeting.LIBActivity.Commands.DeleteLIBActivity;

public class DeleteLIBActivityCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<DeleteLIBActivityCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(DeleteLIBActivityCommand command, CancellationToken cancellationToken)
    {
        var entity = await unitOfWork.LineItemBudgetActivityRepository.GetByIdAsync(command.Id, cancellationToken)
            ?? throw new NotFoundException($"LIB Activity with ID {command.Id} not found.");

        unitOfWork.LineItemBudgetActivityRepository.Remove(entity);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "LIB Activity deleted successfully.");
    }
}

