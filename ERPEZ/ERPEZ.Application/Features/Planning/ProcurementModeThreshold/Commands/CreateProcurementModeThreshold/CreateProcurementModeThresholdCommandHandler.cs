using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ERPEZ.Application.Features.Planning.ProcurementModeThreshold.Commands.CreateProcurementModeThreshold;

public class CreateProcurementModeThresholdCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<CreateProcurementModeThresholdCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreateProcurementModeThresholdCommand request, CancellationToken cancellationToken)
    {
        // Validate procurement mode exists
        var mode = await unitOfWork.ProcurementModeRepository.GetByIdAsync(request.ProcurementModeId, cancellationToken)
            ?? throw new NotFoundException("Procurement mode not found.");

        // Check for overlapping date ranges
        var overlapping = await unitOfWork.ProcurementModeThresholdRepository.Query()
            .AnyAsync(x => x.ProcurementModeId == request.ProcurementModeId &&
                          ((request.EffectivityStart >= x.EffectivityStart && request.EffectivityStart <= (x.EffectivityEnd ?? DateTime.MaxValue)) ||
                           ((request.EffectivityEnd ?? DateTime.MaxValue) >= x.EffectivityStart && (request.EffectivityEnd ?? DateTime.MaxValue) <= (x.EffectivityEnd ?? DateTime.MaxValue)) ||
                           (request.EffectivityStart <= x.EffectivityStart && (request.EffectivityEnd ?? DateTime.MaxValue) >= (x.EffectivityEnd ?? DateTime.MaxValue))),
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
