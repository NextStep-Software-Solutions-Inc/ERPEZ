using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.KPIPerformanceMeasure.Commands.UpdateKPIPerformanceMeasure;

public class UpdateKPIPerformanceMeasureHandler(IUnitOfWork unitOfWork) : IRequestHandler<UpdateKPIPerformanceMeasureCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(UpdateKPIPerformanceMeasureCommand request, CancellationToken cancellationToken)
    {
        var kpiPerformanceMeasure = await unitOfWork.KPIPerformanceMeasureRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken)
            ?? throw new NotFoundException("KPI Performance Measure not found.");

        if (request.Dto.KPIId.HasValue)
        {
            _ = await unitOfWork.KPIRepository.GetByIdAsync(request.Dto.KPIId.Value, cancellationToken: cancellationToken)
                ?? throw new NotFoundException("KPI not found.");

            kpiPerformanceMeasure.KPIId = request.Dto.KPIId.Value;
        }

        if (request.Dto.PerformanceMeasureId.HasValue)
        {
            _ = await unitOfWork.PerformanceMeasureRepository.FindAsync(
                t => t.Id == request.Dto.PerformanceMeasureId.Value,
                cancellationToken: cancellationToken) ?? throw new NotFoundException("Performance Measure not found.");

            kpiPerformanceMeasure.PerformanceMeasureId = request.Dto.PerformanceMeasureId.Value;
        }

        unitOfWork.KPIPerformanceMeasureRepository.Update(kpiPerformanceMeasure);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "KPI Performance Measure updated successfully.");
    }
}
