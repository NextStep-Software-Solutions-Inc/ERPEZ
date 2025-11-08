using ERPEZ.Application.Features.Planning.OPCRRating.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCRRating.Commands.UpdateOPCRRating;

public class UpdateOPCRRatingCommandHandler(IUnitOfWork _unitOfWork) : IRequestHandler<UpdateOPCRRatingCommand, ApiResponse<OPCRRatingDto>>
{
    public async Task<ApiResponse<OPCRRatingDto>> Handle(UpdateOPCRRatingCommand request, CancellationToken cancellationToken)
    {
        var dto = request.UpdateOPCRRating;
        var opcrRating = await _unitOfWork.OPCRRatingRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken)
            ?? throw new NotFoundException("OPCR Rating not found.");

        opcrRating.NumericalRating = dto.NumericalRating ?? opcrRating.NumericalRating;
        opcrRating.Remarks = dto.Remarks ?? opcrRating.Remarks;

        _unitOfWork.OPCRRatingRepository.Update(opcrRating);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var result = new OPCRRatingDto
        {
            Id = opcrRating.Id,
            OPCRKPIId = opcrRating.OPCRKPIId,
            OPCREvaluationId = opcrRating.OPCREvaluationId,
            PerformanceMeasureId = opcrRating.PerformanceMeasureId,
            NumericalRating = opcrRating.NumericalRating,
            Remarks = opcrRating.Remarks
        };
        return ApiResponse<OPCRRatingDto>.Success(result, "OPCR Rating updated successfully.");
    }
}
