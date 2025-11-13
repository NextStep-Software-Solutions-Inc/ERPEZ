using ERPEZ.Application.Features.Planning.KPITarget.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.KPITarget.Commands.CreateKPITarget;

public class CreateKPITargetCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<CreateKPITargetCommand, ApiResponse<KPITargetResponse>>
{
    public async Task<ApiResponse<KPITargetResponse>> Handle(CreateKPITargetCommand request, CancellationToken cancellationToken)
    {
        var kpi = await unitOfWork.KPIRepository.GetByIdAsync(request.KPIId, cancellationToken: cancellationToken) ??
            throw new NotFoundException("KPI not found.");

        decimal targetValueToSave = request.TargetValue;

        if (kpi.IsPercentage)
        {
            targetValueToSave = request.TargetValue / 100;
        }

        var kPITarget = await unitOfWork.KPITargetRepository.FindAsync(
            t => t.KPIId == request.KPIId && t.QuarterName == request.QuarterName,
            cancellationToken: cancellationToken
        );
        if (kPITarget != null)
            throw new ConflictException("KPI Target already exists.");

        var kpiTarget = new Domain.Entities.Planning.KPITarget
        {
            KPIId = request.KPIId,
            TargetValue = targetValueToSave,
            Period = request.Period,
            QuarterName = request.QuarterName
        };

        await unitOfWork.KPITargetRepository.AddAsync(kpiTarget, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        var result = new KPITargetResponse()
        {
            Id = kpiTarget.Id,
            KPIId = kpiTarget.KPIId,
            TargetValue = kpiTarget.KPI.IsPercentage
                ? kpiTarget.TargetValue * 100M
                : kpiTarget.TargetValue,
            Period = kpiTarget.Period,
            QuarterName= kpiTarget.QuarterName,
            CreatedAt = kpiTarget.CreatedAt,
            CreatedBy = kpiTarget.CreatedBy
        };

        return ApiResponse<KPITargetResponse>.Success(result, "KPI Target created successfully.");
    }
}
