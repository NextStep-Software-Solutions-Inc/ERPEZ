using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.ProcurementPolicyConfig.Commands.UpdateProcurementPolicyConfig;

public class UpdateProcurementPolicyConfigCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<UpdateProcurementPolicyConfigCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(UpdateProcurementPolicyConfigCommand request, CancellationToken cancellationToken)
    {
        var entity = await unitOfWork.ProcurementPolicyConfigRepository.GetByIdAsync(request.Id, cancellationToken);
        if (entity == null)
            throw new NotFoundException("Procurement Policy Configuration not found.");

        var threshold = await unitOfWork.ProcurementModeThresholdRepository.GetByIdAsync(request.ProcurementModeThresholdId, cancellationToken);
        if (threshold == null)
            throw new NotFoundException("Procurement Mode Threshold not found.");

        entity.ProcurementModeThresholdId = request.ProcurementModeThresholdId;
        entity.MinAmount = request.MinAmount;
        entity.MaxAmount = request.MaxAmount;

        unitOfWork.ProcurementPolicyConfigRepository.Update(entity);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(entity.Id);
    }
}
