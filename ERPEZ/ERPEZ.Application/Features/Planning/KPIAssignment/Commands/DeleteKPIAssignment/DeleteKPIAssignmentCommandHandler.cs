using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.KPIAssignment.Commands.DeleteKPIAssignment;

public class DeleteKPIAssignmentCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<DeleteKPIAssignmentCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(DeleteKPIAssignmentCommand request, CancellationToken cancellationToken)
    {
        var assignment = await unitOfWork.KPIAssignmentRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken)
            ?? throw new NotFoundException("KPI Assignment not found.");

        if (assignment.IsLocked)
            throw new ConflictException("Cannot delete a locked KPI Assignment.");

        unitOfWork.KPIAssignmentRepository.Remove(assignment);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "KPI Assignment deleted successfully.");
    }
}
