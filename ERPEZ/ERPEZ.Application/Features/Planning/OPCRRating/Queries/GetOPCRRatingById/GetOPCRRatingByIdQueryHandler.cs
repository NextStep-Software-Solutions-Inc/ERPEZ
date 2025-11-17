using ERPEZ.Application.Features.Planning.OPCRRating.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCRRating.Queries.GetOPCRRatingById;

public class GetOPCRRatingByIdQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetOPCRRatingByIdQuery, ApiResponse<OPCRRatingResponse>>
{
    public async Task<ApiResponse<OPCRRatingResponse>> Handle(GetOPCRRatingByIdQuery request, CancellationToken cancellationToken)
    {
        var opcrRating = await unitOfWork.OPCRRatingRepository.FindAsync(
           t => t.Id == request.Id,
            cancellationToken: cancellationToken) ?? throw new NotFoundException("No data found.");

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
        return ApiResponse<OPCRRatingResponse>.Success(result, "Retrieved successfully");
    }
}
