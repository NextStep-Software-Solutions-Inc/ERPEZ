using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.KPITarget.Commands.DeleteKPITarget;

public class DeleteKPITargetCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<DeleteKPITargetCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(DeleteKPITargetCommand request, CancellationToken cancellationToken)
    {
        var kpiTarget = await unitOfWork.KPITargetRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken) ?? throw new NotFoundException("KPI Target not found.");

        unitOfWork.KPITargetRepository.Remove(kpiTarget);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, $"KPI Target with ID {request.Id} deleted successfully.");
    }
}