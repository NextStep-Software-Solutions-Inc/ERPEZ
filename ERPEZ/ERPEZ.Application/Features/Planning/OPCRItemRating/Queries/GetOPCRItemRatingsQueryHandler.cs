// GetOPCRItemRatingsQueryHandler.cs
using ERPEZ.Application.Features.Planning.OPCRItemRating.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCRItemRating.Queries;

public class GetOPCRItemRatingsQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetOPCRItemRatingsQuery, ApiResponse<List<OPCRItemRatingResponse>>>
{
    public async Task<ApiResponse<List<OPCRItemRatingResponse>>> Handle(
        GetOPCRItemRatingsQuery request, CancellationToken cancellationToken)
    {
        _ = await unitOfWork.OPCRItemRepository.GetByIdAsync(request.OPCRItemId, cancellationToken)
            ?? throw new NotFoundException("OPCR Item not found.");

        var ratings = await unitOfWork.OPCRItemRatingRepository.GetListAsync(
            unitOfWork.OPCRItemRatingRepository
                .Query(r => r.OPCRItemId == request.OPCRItemId)
                .Select(r => new OPCRItemRatingResponse
                {
                    Id                       = r.Id,
                    OPCRItemId               = r.OPCRItemId,
                    FYActiveKPIMeasurementId = r.FYActiveKPIMeasurementId,
                    Dimension                = string.Join(", ", r.FYActiveKPIMeasurement.Dimensions),
                    SelfRating               = r.SelfRating,
                    PMTRating                = r.PMTRating,
                    PMTRemark                = r.PMTRemark,
                    CreatedAt                = r.CreatedAt,
                    CreatedBy                = r.CreatedBy
                }),
            cancellationToken);

        return ApiResponse<List<OPCRItemRatingResponse>>
            .Success(ratings, "OPCR Item Ratings retrieved successfully.");
    }
}