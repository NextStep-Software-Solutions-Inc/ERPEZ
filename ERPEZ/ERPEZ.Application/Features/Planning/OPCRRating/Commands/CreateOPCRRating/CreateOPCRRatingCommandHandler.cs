using ERPEZ.Application.Features.Planning.OPCRRating.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCRRating.Commands.CreateOPCRRating;

public class CreateOPCRRatingCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<CreateOPCRRatingCommand, ApiResponse<OPCRRatingResponse>>
{
    public async Task<ApiResponse<OPCRRatingResponse>> Handle(CreateOPCRRatingCommand request, CancellationToken cancellationToken)
    {
        _ = await unitOfWork.OPCREvaluationRepository.FindAsync(o => o.Id == request.OPCREvaluationId,
            cancellationToken) ?? throw new NotFoundException("OPCR Evaluation not found.");

        _ = await unitOfWork.PerformanceMeasureRepository.FindAsync(o => o.Id == request.PerformanceMeasureId,
            cancellationToken) ?? throw new NotFoundException("Performance Measure not found.");

        _ = await unitOfWork.OPCRKPIRepository.FindAsync(o => o.Id == request.OPCRKPIId,
            cancellationToken) ?? throw new NotFoundException("OPCR KPI not found.");

        var opcrRating = new Domain.Entities.Planning.OPCRRating
        {
            OPCRKPIId = request.OPCRKPIId,
            OPCREvaluationId = request.OPCREvaluationId,
            PerformanceMeasureId = request.PerformanceMeasureId,
            NumericalRating = request.NumericalRating,
            Remarks = request.Remarks
        };

        await unitOfWork.OPCRRatingRepository.AddAsync(opcrRating, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = new OPCRRatingResponse
        {
            Id = opcrRating.Id,
            OPCREvaluationId = opcrRating.OPCREvaluationId,
            OPCRKPIId = opcrRating.OPCRKPIId,
            PerformanceMeasureId= opcrRating.PerformanceMeasureId,
            NumericalRating = opcrRating.NumericalRating,
            Remarks = opcrRating.Remarks,
            CreatedAt = opcrRating.CreatedAt,
            CreatedBy = opcrRating.CreatedBy
        };
        return ApiResponse<OPCRRatingResponse>.Success(dto, "OPCR Rating created successfully.");
    }
}
