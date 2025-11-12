using ERPEZ.Application.Features.Planning.OPCRRating.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCRRating.Commands.UpdateOPCRRating;

public class UpdateOPCRRatingCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<UpdateOPCRRatingCommand, ApiResponse<OPCRRatingResponse>>
{
    public async Task<ApiResponse<OPCRRatingResponse>> Handle(UpdateOPCRRatingCommand request, CancellationToken cancellationToken)
    {
        var dto = request.UpdateOPCRRating;
        var opcrRating = await unitOfWork.OPCRRatingRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken)
            ?? throw new NotFoundException("OPCR Rating not found.");

        opcrRating.NumericalRating = dto.NumericalRating ?? opcrRating.NumericalRating;
        opcrRating.Remarks = dto.Remarks ?? opcrRating.Remarks;

        unitOfWork.OPCRRatingRepository.Update(opcrRating);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        var result = new OPCRRatingResponse
        {
            Id = opcrRating.Id,
            OPCRKPIId = opcrRating.OPCRKPIId,
            OPCREvaluationId = opcrRating.OPCREvaluationId,
            PerformanceMeasureId = opcrRating.PerformanceMeasureId,
            NumericalRating = opcrRating.NumericalRating,
            Remarks = opcrRating.Remarks,
            CreatedAt = opcrRating.CreatedAt,
            CreatedBy = opcrRating.CreatedBy
        };
        return ApiResponse<OPCRRatingResponse>.Success(result, "OPCR Rating updated successfully.");
    }
}
