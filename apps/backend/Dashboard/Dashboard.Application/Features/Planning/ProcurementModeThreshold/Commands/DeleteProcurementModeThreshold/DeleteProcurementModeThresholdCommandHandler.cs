using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.ProcurementModeThreshold.Commands.DeleteProcurementModeThreshold;

public class DeleteProcurementModeThresholdCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<DeleteProcurementModeThresholdCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(DeleteProcurementModeThresholdCommand request, CancellationToken cancellationToken)
    {
        var entity = await unitOfWork.ProcurementModeThresholdRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("Procurement mode threshold not found.");

        unitOfWork.ProcurementModeThresholdRepository.Remove(entity);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "Procurement mode threshold deleted successfully.");
    }
}
