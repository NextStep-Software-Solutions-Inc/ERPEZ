using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.DUKPIAssignment.Commands.DeleteDUKPIAssignment;

public class DeleteDUKPIAssignmentCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<DeleteDUKPIAssignmentCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(DeleteDUKPIAssignmentCommand request, CancellationToken cancellationToken)
    {
        var kPIAssignment = await unitOfWork.DUKPIAssignmentRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken) ?? throw new NotFoundException("DU KPI Assignment not found.");

        unitOfWork.DUKPIAssignmentRepository.Remove(kPIAssignment);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, $"DU KPI Assignment with ID {request.Id} deleted successfully.");
    }
}
