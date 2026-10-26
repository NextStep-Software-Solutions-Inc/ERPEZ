// GetOPCRItemRatingsQuery.cs
using ERPEZ.Application.Features.Planning.OPCRItemRating.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCRItemRating.Queries;

public record GetOPCRItemRatingsQuery(Guid OPCRItemId)
    : IRequest<ApiResponse<List<OPCRItemRatingResponse>>>;