using ERPEZ.Application.Features.Planning.OPCRRating.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCRRating.Commands.CreateOPCRRating;

public class CreateOPCRRatingCommandHandler(IUnitOfWork _unitOfWork) : IRequestHandler<CreateOPCRRatingCommand, ApiResponse<OPCRRatingDto>>
{
    public async Task<ApiResponse<OPCRRatingDto>> Handle(CreateOPCRRatingCommand request, CancellationToken cancellationToken)
    {
        _ = await _unitOfWork.OPCREvaluationRepository.FindAsync(o => o.Id == request.OPCREvaluationId,
            cancellationToken) ?? throw new NotFoundException("OPCR Evaluation not found.");

        _ = await _unitOfWork.PerformanceMeasureRepository.FindAsync(o => o.Id == request.PerformanceMeasureId,
            cancellationToken) ?? throw new NotFoundException("Performance Measure not found.");

        _ = await _unitOfWork.OPCRKPIRepository.FindAsync(o => o.Id == request.OPCRKPIId,
            cancellationToken) ?? throw new NotFoundException("OPCR KPI not found.");

        var opcrRating = new Domain.Entities.Planning.OPCRRating
        {
            OPCRKPIId = request.OPCRKPIId,
            OPCREvaluationId = request.OPCREvaluationId,
            PerformanceMeasureId = request.PerformanceMeasureId,
            NumericalRating = request.NumericalRating,
            Remarks = request.Remarks
        };

        await _unitOfWork.OPCRRatingRepository.AddAsync(opcrRating, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = new OPCRRatingDto
        {
            Id = opcrRating.Id,
            OPCREvaluationId = opcrRating.OPCREvaluationId,
            OPCRKPIId = opcrRating.OPCRKPIId,
            PerformanceMeasureId= opcrRating.PerformanceMeasureId,
            NumericalRating = opcrRating.NumericalRating,
            Remarks = opcrRating.Remarks
        };
        return ApiResponse<OPCRRatingDto>.Success(dto, "OPCR Rating created successfully.");
    }
}