using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.KPITarget.Commands.UpdateKPITarget;

public class UpdateKPITargetCommandHandler(IUnitOfWork _unitOfWork) : IRequestHandler<UpdateKPITargetCommand, ApiResponse<Domain.Entities.Planning.KPITarget>>
{
    public async Task<ApiResponse<Domain.Entities.Planning.KPITarget>> Handle(UpdateKPITargetCommand request, CancellationToken cancellationToken)
    {
        var dto = request.UpdateKPITarget;

        var kpiTarget = await _unitOfWork.KPITargetRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken)
            ?? throw new NotFoundException("KPI Target not found.");

        var duplicate = await _unitOfWork.KPITargetRepository
            .FindAsync(x => x.KPIId == dto.KPIId && x.QuarterName == dto.QuarterName, cancellationToken);

        if (duplicate != null)
            throw new ConflictException("KPI Target with the same KPI already exists.");

        kpiTarget.KPIId = dto?.KPIId ?? kpiTarget.KPIId;
        kpiTarget.QuarterName = dto?.QuarterName ?? kpiTarget.QuarterName;
        kpiTarget.TargetValue = dto?.TargetValue ?? kpiTarget.TargetValue;
        kpiTarget.Period = dto?.Period ?? kpiTarget.Period;

        _unitOfWork.KPITargetRepository.Update(kpiTarget);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Domain.Entities.Planning.KPITarget>.Success(kpiTarget, "KPI Target updated successfully.");
    }
}