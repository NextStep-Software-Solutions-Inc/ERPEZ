using ERPEZ.Application.Features.Planning.RatingScaleLevel.Dtos;
using ERPEZ.Application.Features.Planning.RatingScaleTemplate.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using Sieve.Models;
using System.Linq.Expressions;

namespace ERPEZ.Application.Features.Planning.RatingScaleTemplate.Queries.GetRatingScaleTemplates;

public class GetRatingScaleTemplatesQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetRatingScaleTemplatesQuery, PaginatedApiResponse<RatingScaleTemplateResponse>>
{
    public async Task<PaginatedApiResponse<RatingScaleTemplateResponse>> Handle(GetRatingScaleTemplatesQuery request, CancellationToken cancellationToken)
    {
        var sieveModel = new SieveModel
        {
            PageSize = request.PageSize,
            Page = request.PageNumber,
            Filters = request.Filters,
            Sorts = request.Sorts
        };

        Expression<Func<Domain.Entities.Planning.RatingScaleTemplate, RatingScaleTemplateResponse>> projection = template => new RatingScaleTemplateResponse
        {
            Id = template.Id,
            Name = template.Name,
            Description = template.Description,
            IsFixed = template.IsFixed,
            IsDefault = template.IsDefault,
            GeneralRatingScaleId = template.GeneralRatingScaleId,
            RatingScaleLevels = template.RatingScaleLevels.Select(level => new RatingScaleLevelResponse
            {
                Id = level.Id,
                RatingScaleTemplateId = level.RatingScaleTemplateId,
                RatingValue = level.RatingValue,
                Description = level.Description,
                MinValue = level.MinValue,
                MaxValue = level.MaxValue,
            }).ToList(),
            CreatedAt = template.CreatedAt,
            CreatedBy = template.CreatedBy,
        };

        var (items, totalCount) = await unitOfWork.RatingScaleTemplateRepository.GetAllAsync(sieveModel, projection, cancellationToken: cancellationToken);

        return new PaginatedApiResponse<RatingScaleTemplateResponse>([.. items], request.PageNumber, request.PageSize, totalCount);
    }
}
