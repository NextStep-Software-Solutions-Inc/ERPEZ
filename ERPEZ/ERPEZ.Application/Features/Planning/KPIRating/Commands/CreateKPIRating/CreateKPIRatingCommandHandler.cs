using ERPEZ.Application.Features.Planning.KPIRating.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.KPIRating.Commands.CreateKPIRating;

public class CreateKPIRatingCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<CreateKPIRatingCommand, ApiResponse<KPIRatingResponse>>
{
    public async Task<ApiResponse<KPIRatingResponse>> Handle(CreateKPIRatingCommand request, CancellationToken cancellationToken)
    {
        _ = await unitOfWork.PerformanceMeasureRepository.FindAsync(
            t => t.Id == request.PerformanceMeasureId,
            cancellationToken: cancellationToken) ?? throw new NotFoundException("Performance Measure should exist");

        _ = await unitOfWork.KPIRepository.GetByIdAsync(request.KPIId, cancellationToken: cancellationToken)
            ?? throw new NotFoundException("KPI not found.");

        var duplicate = await unitOfWork.KPIRatingRepository.FindAsync(kr =>
                        kr.KPIId == request.KPIId &&
                        kr.PerformanceMeasureId == request.PerformanceMeasureId &&
                        kr.NumericalRating == request.NumericalRating, cancellationToken);
        if (duplicate != null)
        {
            throw new ConflictException("KPI rating already exist.");
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
        var result = new KPIRatingResponse()
        {
            Id = kPIRating.Id,
            KPIId = kPIRating.KPIId,
            NumericalRating = kPIRating.NumericalRating,
            PerformanceMeasureId = kPIRating.PerformanceMeasureId,
            Remarks = kPIRating.Remarks,
            CreatedAt = kPIRating.CreatedAt,
            CreatedBy = kPIRating.CreatedBy
        };
        return ApiResponse<KPIRatingResponse>.Success(result, "KPI Rating created successfully.");
    }
}
