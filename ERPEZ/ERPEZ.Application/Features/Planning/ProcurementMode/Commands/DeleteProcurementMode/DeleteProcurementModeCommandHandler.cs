using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ERPEZ.Application.Features.Planning.ProcurementMode.Commands.DeleteProcurementMode;

public class DeleteProcurementModeCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<DeleteProcurementModeCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(DeleteProcurementModeCommand request, CancellationToken cancellationToken)
    {
        var entity = await unitOfWork.ProcurementModeRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("Procurement mode not found.");

        // Check if in use
        var hasThresholds = await unitOfWork.ProcurementModeThresholdRepository.Query()
            .AnyAsync(pmt => pmt.ProcurementModeId == request.Id, cancellationToken);

        if (hasThresholds)
            throw new ConflictException("Cannot delete procurement mode that has thresholds assigned.");

        unitOfWork.ProcurementModeRepository.Remove(entity);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "Procurement mode deleted successfully.");
    }
}
