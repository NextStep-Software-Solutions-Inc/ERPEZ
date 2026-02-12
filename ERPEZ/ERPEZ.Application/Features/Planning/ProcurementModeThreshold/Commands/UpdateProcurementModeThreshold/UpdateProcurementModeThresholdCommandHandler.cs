using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.ProcurementModeThreshold.Commands.UpdateProcurementModeThreshold;

public class UpdateProcurementModeThresholdCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<UpdateProcurementModeThresholdCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(UpdateProcurementModeThresholdCommand request, CancellationToken cancellationToken)
    {
        var entity = await unitOfWork.ProcurementModeThresholdRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("Procurement mode threshold not found.");

        if (request.MinThreshold.HasValue)
            entity.MinThreshold = request.MinThreshold.Value;

        if (request.MaxThreshold.HasValue)
            entity.MaxThreshold = request.MaxThreshold.Value;

        if (request.EffectivityStart.HasValue)
            entity.EffectivityStart = request.EffectivityStart.Value;

        if (request.EffectivityEnd.HasValue)
            entity.EffectivityEnd = request.EffectivityEnd.Value;

        unitOfWork.ProcurementModeThresholdRepository.Update(entity);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "Procurement mode threshold updated successfully.");
    }
}
