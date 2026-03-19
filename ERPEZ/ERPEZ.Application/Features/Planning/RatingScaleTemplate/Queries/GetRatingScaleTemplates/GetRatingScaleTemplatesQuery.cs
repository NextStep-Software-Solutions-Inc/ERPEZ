using ERPEZ.Application.Common.Queries;
using ERPEZ.Application.Features.Planning.RatingScaleTemplate.Dtos;
using ERPEZ.Shared.Common;

namespace ERPEZ.Application.Features.Planning.RatingScaleTemplate.Queries.GetRatingScaleTemplates;

public record GetRatingScaleTemplatesQuery : PaginatedQuery<PaginatedApiResponse<RatingScaleTemplateResponse>>;
