using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.KPIRating.Commands.UpdateKPIRating;

public class UpdateKPIRatingCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<UpdateKPIRatingCommand, ApiResponse<Domain.Entities.Planning.KPIRating>>
{
    public async Task<ApiResponse<Domain.Entities.Planning.KPIRating>> Handle(UpdateKPIRatingCommand request, CancellationToken cancellationToken)
    {
        var dto = request.UpdateKPIRating;

        if (dto.PerformanceMeasureId.HasValue && dto.PerformanceMeasureId.Value != Guid.Empty)
        {
            _ = await unitOfWork.PerformanceMeasureRepository.GetByIdAsync(dto.PerformanceMeasureId.Value, cancellationToken: cancellationToken)
                ?? throw new NotFiniteNumberException("Performance Measure not found.");
        }

        var kpiRating = await unitOfWork.KPIRatingRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken)
            ?? throw new NotFoundException("KPI Assignment not found.");

        kpiRating.PerformanceMeasureId = dto?.PerformanceMeasureId ?? kpiRating.PerformanceMeasureId;
        kpiRating.KPIId = dto?.KPIId ?? kpiRating.KPIId;
        kpiRating.Remarks = dto?.Remarks ?? kpiRating.Remarks;
        kpiRating.NumericalRating = dto?.NumericalRating ?? kpiRating.NumericalRating;

        unitOfWork.KPIRatingRepository.Update(kpiRating);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Domain.Entities.Planning.KPIRating>.Success(kpiRating, "KPI Rating updated successfully.");
    }
}
