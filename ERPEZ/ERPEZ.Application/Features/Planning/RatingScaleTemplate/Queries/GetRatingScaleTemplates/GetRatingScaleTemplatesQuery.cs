using ERPEZ.Application.Features.Planning.RatingScaleTemplate.Dtos;
using ERPEZ.Shared.Common;
using MediatR;
using Sieve.Models;

namespace ERPEZ.Application.Features.Planning.RatingScaleTemplate.Queries.GetRatingScaleTemplates;

public record GetRatingScaleTemplatesQuery(SieveModel SieveModel) : IRequest<PaginatedApiResponse<RatingScaleTemplateResponse>>;
