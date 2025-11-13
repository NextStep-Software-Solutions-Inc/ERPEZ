using ERPEZ.Application.Features.Planning.KPITarget.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.KPITarget.Commands.UpdateKPITarget;

public class UpdateKPITargetCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<UpdateKPITargetCommand, ApiResponse<KPITargetResponse>>
{
    public async Task<ApiResponse<KPITargetResponse>> Handle(UpdateKPITargetCommand request, CancellationToken cancellationToken)
    {
        var dto = request.UpdateKPITarget;

        var kpiTarget = await unitOfWork.KPITargetRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken)
            ?? throw new NotFoundException("KPI Target not found.");
        var kpi = await unitOfWork.KPIRepository.GetByIdAsync(kpiTarget.KPIId, cancellationToken: cancellationToken);

        var duplicate = await unitOfWork.KPITargetRepository.FindAsync(x =>
            x.KPIId == kpiTarget.KPIId &&
            x.QuarterName == dto.QuarterName &&
            x.Period == dto.Period &&
            x.Id != request.Id, cancellationToken);
        if (duplicate != null)
            throw new ConflictException($"A KPI Target with Quarter '{dto.QuarterName}' and Period '{dto.Period}' already exists for this KPI.");

        var targetValue = dto?.TargetValue ?? kpiTarget.TargetValue;

        decimal targetValueToSave;
        if (dto != null && dto.TargetValue.HasValue)
        {
            targetValueToSave = dto.TargetValue.Value;
            if (kpi != null && kpi.IsPercentage)
            {
                targetValueToSave = dto.TargetValue.Value / 100;
            }
        }
        else
        {
            targetValueToSave = kpiTarget.TargetValue;
        }

        kpiTarget.QuarterName = dto?.QuarterName ?? kpiTarget.QuarterName;
        kpiTarget.TargetValue = targetValueToSave;
        kpiTarget.Period = dto?.Period ?? kpiTarget.Period;

        unitOfWork.KPITargetRepository.Update(kpiTarget);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        var result = new KPITargetResponse()
        {
            Id = kpiTarget.Id,
            KPIId = kpiTarget.KPIId,
            TargetValue = kpiTarget.KPI.IsPercentage
                ? kpiTarget.TargetValue * 100M
                : kpiTarget.TargetValue,
            Period = kpiTarget.Period,
            QuarterName = kpiTarget.QuarterName,
            CreatedAt = kpiTarget.CreatedAt,
            CreatedBy = kpiTarget.CreatedBy
        };

        return ApiResponse<KPITargetResponse>.Success(result, "KPI Target updated successfully.");
    }
}
