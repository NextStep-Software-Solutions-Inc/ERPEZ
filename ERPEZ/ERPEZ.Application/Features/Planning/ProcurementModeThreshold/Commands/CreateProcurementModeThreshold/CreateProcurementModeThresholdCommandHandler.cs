using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.ProcurementModeThreshold.Commands.CreateProcurementModeThreshold;

public class CreateProcurementModeThresholdCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<CreateProcurementModeThresholdCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreateProcurementModeThresholdCommand request, CancellationToken cancellationToken)
    {
        // Validate procurement mode exists
        _ = await unitOfWork.ProcurementModeRepository.GetByIdAsync(request.ProcurementModeId, cancellationToken)
            ?? throw new NotFoundException("Procurement mode not found.");

        // Check for overlapping date ranges
        var overlapping = await unitOfWork.ProcurementModeThresholdRepository.HasOverlappingDateRangeAsync(
            request.ProcurementModeId,
            request.EffectivityStart,
            request.EffectivityEnd,
            null,
            cancellationToken);

        if (overlapping)
            throw new ConflictException("Effectivity date range overlaps with an existing threshold for this procurement mode.");

        var entity = new Domain.Entities.Planning.ProcurementModeThreshold
        {
            Id = Guid.NewGuid(),
            ProcurementModeId = request.ProcurementModeId,
            MinThreshold = request.MinThreshold,
            MaxThreshold = request.MaxThreshold,
            EffectivityStart = request.EffectivityStart,
            EffectivityEnd = request.EffectivityEnd
        };

        await unitOfWork.ProcurementModeThresholdRepository.AddAsync(entity, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(entity.Id, "Procurement mode threshold created successfully.");
    }
}
