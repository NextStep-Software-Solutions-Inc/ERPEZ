using ERPEZ.Application.Features.Planning.GeneralRatingScale.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.GeneralRatingScale.Queries.GetGeneralRatingScaleById;

public record GetGeneralRatingScaleByIdQuery(Guid Id) : IRequest<ApiResponse<GeneralRatingScaleResponse>>;
