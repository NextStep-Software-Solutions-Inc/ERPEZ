using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.DUKPITargetAssignment.Commands.DeleteDUKPITargetAssignment;

public class DeleteDUKPITargetAssignmentCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<DeleteDUKPITargetAssignmentCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(DeleteDUKPITargetAssignmentCommand request, CancellationToken cancellationToken)
    {
        var kPITargetAssignment = await unitOfWork.DUKPITargetAssignmentRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken) ?? throw new NotFoundException("DU KPI Target Assignment not found.");

        unitOfWork.DUKPITargetAssignmentRepository.Remove(kPITargetAssignment);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, $"DU KPI Target Assignment with ID {request.Id} deleted successfully.");
    }
}
