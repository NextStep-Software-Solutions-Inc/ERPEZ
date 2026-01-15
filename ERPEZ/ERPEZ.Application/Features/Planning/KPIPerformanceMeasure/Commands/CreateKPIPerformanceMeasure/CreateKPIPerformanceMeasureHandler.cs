using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.KPIPerformanceMeasure.Commands.CreateKPIPerformanceMeasure;

public class CreateKPIPerformanceMeasureHandler(IUnitOfWork unitOfWork) : IRequestHandler<CreateKPIPerformanceMeasureCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreateKPIPerformanceMeasureCommand request, CancellationToken cancellationToken)
    {
        // Verify KPI exists
        _ = await unitOfWork.KPIRepository.GetByIdAsync(request.KPIId, cancellationToken: cancellationToken)
            ?? throw new NotFoundException("KPI not found.");

        // Verify PerformanceMeasure exists
        _ = await unitOfWork.PerformanceMeasureRepository.FindAsync(
            t => t.Id == request.PerformanceMeasureId,
            cancellationToken: cancellationToken) ?? throw new NotFoundException("Performance Measure not found.");

        // Check for existing association
        var existing = await unitOfWork.KPIPerformanceMeasureRepository.FindAsync(
            x => x.KPIId == request.KPIId && x.PerformanceMeasureId == request.PerformanceMeasureId,
            cancellationToken: cancellationToken);

        if (existing != null)
            throw new ConflictException("This KPI Performance Measure association already exists.");

        var kpiPerformanceMeasure = new Domain.Entities.Planning.KPIPerformanceMeasure
        {
            KPIId = request.KPIId,
            PerformanceMeasureId = request.PerformanceMeasureId
        };

        await unitOfWork.KPIPerformanceMeasureRepository.AddAsync(kpiPerformanceMeasure, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(kpiPerformanceMeasure.Id, "KPI Performance Measure created successfully.");
    }
}
