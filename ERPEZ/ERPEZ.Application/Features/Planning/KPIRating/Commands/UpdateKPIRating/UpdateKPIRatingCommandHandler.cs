using ERPEZ.Application.Features.Planning.KPIRating.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.KPIRating.Commands.UpdateKPIRating;

public class UpdateKPIRatingCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<UpdateKPIRatingCommand, ApiResponse<KPIRatingResponse>>
{
    public async Task<ApiResponse<KPIRatingResponse>> Handle(UpdateKPIRatingCommand request, CancellationToken cancellationToken)
    {
        var dto = request.UpdateKPIRating;

        var kpiRating = await unitOfWork.KPIRatingRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken)
            ?? throw new NotFoundException("KPI Assignment not found.");

        kpiRating.Remarks = dto?.Remarks ?? kpiRating.Remarks;
        kpiRating.NumericalRating = dto?.NumericalRating ?? kpiRating.NumericalRating;

        unitOfWork.KPIRatingRepository.Update(kpiRating);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        var result = new KPIRatingResponse()
        {
            Id = kpiRating.Id,
            KPIId = kpiRating.KPIId,
            NumericalRating = kpiRating.NumericalRating,
            PerformanceMeasureId = kpiRating.PerformanceMeasureId,
            Remarks = kpiRating.Remarks,
            CreatedAt = kpiRating.CreatedAt,
            CreatedBy = kpiRating.CreatedBy
        };

        return ApiResponse<KPIRatingResponse>.Success(result, "KPI Rating updated successfully.");
    }
}
