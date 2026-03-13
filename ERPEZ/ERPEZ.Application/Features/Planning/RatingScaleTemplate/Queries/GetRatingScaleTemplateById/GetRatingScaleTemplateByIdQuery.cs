using ERPEZ.Application.Features.Planning.RatingScaleTemplate.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.RatingScaleTemplate.Queries.GetRatingScaleTemplateById;

public record GetRatingScaleTemplateByIdQuery(Guid Id) : IRequest<ApiResponse<RatingScaleTemplateResponse>>;
