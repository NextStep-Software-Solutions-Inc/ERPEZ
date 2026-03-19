using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.FYActiveKPI.Commands.DeleteFYActiveKPI;

public class DeleteFYActiveKPICommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<DeleteFYActiveKPICommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(DeleteFYActiveKPICommand request, CancellationToken cancellationToken)
    {
        var fyActiveKpi = await unitOfWork.FYActiveKPIRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken)
            ?? throw new NotFoundException("FY Active KPI not found.");

        // Check for dependent KPI Assignments
        var hasAssignments = await unitOfWork.KPIAssignmentRepository.FindAsync(
            a => a.FYActiveKPIId == request.Id,
            cancellationToken);

        if (hasAssignments != null)
            throw new ConflictException("Cannot delete FY Active KPI because it has associated KPI Assignments.");

        unitOfWork.FYActiveKPIRepository.Remove(fyActiveKpi);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "FY Active KPI deleted successfully.");
    }
}
