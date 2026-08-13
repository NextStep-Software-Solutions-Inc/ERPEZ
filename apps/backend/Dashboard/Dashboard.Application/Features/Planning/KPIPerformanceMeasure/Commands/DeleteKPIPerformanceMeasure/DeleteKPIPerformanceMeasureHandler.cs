using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.KPIPerformanceMeasure.Commands.DeleteKPIPerformanceMeasure;

public class DeleteKPIPerformanceMeasureHandler(IUnitOfWork unitOfWork) : IRequestHandler<DeleteKPIPerformanceMeasureCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(DeleteKPIPerformanceMeasureCommand request, CancellationToken cancellationToken)
    {
        var kpiPerformanceMeasure = await unitOfWork.KPIPerformanceMeasureRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken)
            ?? throw new NotFoundException("KPI Performance Measure not found.");

        unitOfWork.KPIPerformanceMeasureRepository.Remove(kpiPerformanceMeasure);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "KPI Performance Measure deleted successfully.");
    }
}
