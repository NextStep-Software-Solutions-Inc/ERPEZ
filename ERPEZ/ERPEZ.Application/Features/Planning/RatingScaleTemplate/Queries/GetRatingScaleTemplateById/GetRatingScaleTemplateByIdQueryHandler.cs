using ERPEZ.Application.Features.Planning.RatingScaleLevel.Dtos;
using ERPEZ.Application.Features.Planning.RatingScaleTemplate.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.RatingScaleTemplate.Queries.GetRatingScaleTemplateById;

public class GetRatingScaleTemplateByIdQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetRatingScaleTemplateByIdQuery, ApiResponse<RatingScaleTemplateResponse>>
{
    public async Task<ApiResponse<RatingScaleTemplateResponse>> Handle(GetRatingScaleTemplateByIdQuery request, CancellationToken cancellationToken)
    {
        var template = await unitOfWork.RatingScaleTemplateRepository.GetTemplateWithLevelsAsync(request.Id, cancellationToken);

        if (template == null)
            throw new NotFoundException("Rating Scale Template not found.");

        var response = new RatingScaleTemplateResponse
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

        return ApiResponse<RatingScaleTemplateResponse>.Success(response);
    }
}
