using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.RatingScaleTemplate.Commands.CreateRatingScaleTemplate;

public class CreateRatingScaleTemplateCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<CreateRatingScaleTemplateCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreateRatingScaleTemplateCommand request, CancellationToken cancellationToken)
    {
        // Validate GeneralRatingScale if provided
        if (request.GeneralRatingScaleId.HasValue)
        {
            var generalRatingScale = await unitOfWork.GeneralRatingScaleRepository.GetByIdAsync(request.GeneralRatingScaleId.Value, cancellationToken);
            if (generalRatingScale == null)
                throw new NotFoundException("General Rating Scale not found.");
        }

        // Check for duplicate name
        var existing = await unitOfWork.RatingScaleTemplateRepository.FindAsync(
            x => x.Name == request.Name,
            cancellationToken);

        if (existing != null)
            throw new ConflictException("Rating Scale Template with the same name already exists.");

        // Validate rating levels
        var ratingValues = request.RatingScaleLevels.Select(r => r.RatingValue).ToList();
        if (ratingValues.Count != ratingValues.Distinct().Count())
            throw new ValidationException("Rating values must be unique.");

        var template = new Domain.Entities.Planning.RatingScaleTemplate
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Description = request.Description,
            IsFixed = request.IsFixed,
            IsDefault = request.IsDefault,
            GeneralRatingScaleId = request.GeneralRatingScaleId,
        };

        await unitOfWork.RatingScaleTemplateRepository.AddAsync(template, cancellationToken);

        // Create rating scale levels
        foreach (var levelRequest in request.RatingScaleLevels)
        {
            var level = new Domain.Entities.Planning.RatingScaleLevel
            {
                Id = Guid.NewGuid(),
                RatingScaleTemplateId = template.Id,
                RatingValue = levelRequest.RatingValue,
                Description = levelRequest.Description,
                MinValue = levelRequest.MinValue ?? 0,
                MaxValue = levelRequest.MaxValue ?? 0,
            };

            await unitOfWork.RatingScaleLevelRepository.AddAsync(level, cancellationToken);
        }

        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(template.Id, "Rating Scale Template created successfully.");
    }
}
