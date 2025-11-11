using ERPEZ.Application.Features.Planning.KPIRating.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.KPIRating.Commands.CreateKPIRating;

public class CreateKPIRatingCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<CreateKPIRatingCommand, ApiResponse<KPIRatingDto>>
{
    public async Task<ApiResponse<KPIRatingDto>> Handle(CreateKPIRatingCommand request, CancellationToken cancellationToken)
    {
        _ = await unitOfWork.PerformanceMeasureRepository.FindAsync(
            t => t.Id == request.PerformanceMeasureId,
            cancellationToken: cancellationToken) ?? throw new NotFoundException("Performance Measure should exist");
        
        if (request.KPIId != Guid.Empty)
        {
            _ = await unitOfWork.KPIRepository.GetByIdAsync(request.KPIId, cancellationToken: cancellationToken)
                ?? throw new NotFoundException("KPI not found.");
        }

        var kPIRating = new Domain.Entities.Planning.KPIRating
        {
            KPIId = request.KPIId,
            PerformanceMeasureId = request.PerformanceMeasureId,
            NumericalRating = request.NumericalRating,
            Remarks = request.Remarks
        };

        await unitOfWork.KPIRatingRepository.AddAsync(kPIRating, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        var result = new KPIRatingDto
        {
            Remarks = request.Remarks,
            NumericalRating = request.NumericalRating,
            PerformanceMeasureId = request.PerformanceMeasureId,
            KPIId = request.KPIId
        };
        return ApiResponse<KPIRatingDto>.Success(result, "KPI Rating created successfully.");
    }
}
