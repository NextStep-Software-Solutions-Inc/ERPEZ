using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.KPIAssignment.Commands.DeleteKPIAssignment;

public class DeleteKPIAssignmentCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<DeleteKPIAssignmentCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(DeleteKPIAssignmentCommand request, CancellationToken cancellationToken)
    {
        var kPIAssignment = await unitOfWork.KPIAssignmentRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken) ?? throw new NotFoundException("KPI Assignment not found.");

        unitOfWork.KPIAssignmentRepository.Remove(kPIAssignment);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, $"KPI Assignment with ID {request.Id} deleted successfully.");
    }
}
