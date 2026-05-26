using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.RatingScaleTemplate.Commands.UpdateRatingScaleTemplate;

public class UpdateRatingScaleTemplateCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<UpdateRatingScaleTemplateCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(UpdateRatingScaleTemplateCommand request, CancellationToken cancellationToken)
    {
        var template = await unitOfWork.RatingScaleTemplateRepository.GetTemplateWithLevelsAsync(request.Id, cancellationToken: cancellationToken)
            ?? throw new NotFoundException("Rating Scale Template not found.");

        var updateData = request.UpdateRatingScaleTemplate;

        // Check name uniqueness if name is being updated
        if (!string.IsNullOrWhiteSpace(updateData.Name) && updateData.Name != template.Name)
        {
            var duplicate = await unitOfWork.RatingScaleTemplateRepository.FindAsync(
                t => t.Name == updateData.Name && t.Id != request.Id,
                cancellationToken);

            if (duplicate != null)
                throw new ConflictException("A Rating Scale Template with this name already exists.");
        }

        if (!string.IsNullOrWhiteSpace(updateData.Name))
            template.Name = updateData.Name;

        if (updateData.Description != null)
            template.Description = updateData.Description;

        if (updateData.IsFixed.HasValue)
            template.IsFixed = updateData.IsFixed.Value;

        if (updateData.IsDefault.HasValue)
        {
            // If setting as default, unset other defaults
            if (updateData.IsDefault.Value && template.GeneralRatingScaleId.HasValue)
            {
                var otherDefaults = await unitOfWork.RatingScaleTemplateRepository
                    .ToListAsync(
                        unitOfWork.RatingScaleTemplateRepository.Query(
                            t => t.GeneralRatingScaleId == template.GeneralRatingScaleId && t.IsDefault && t.Id != request.Id),
                        cancellationToken);

                foreach (var other in otherDefaults)
                {
                    other.IsDefault = false;
                    unitOfWork.RatingScaleTemplateRepository.Update(other);
                }
            }

            template.IsDefault = updateData.IsDefault.Value;
        }

        if (updateData.RatingScaleLevels != null && updateData.RatingScaleLevels.Any())
        {
            foreach (var incomingLevel in updateData.RatingScaleLevels)
            {
                var existingLevel = template.RatingScaleLevels?.FirstOrDefault(l => l.RatingValue == incomingLevel.RatingValue);
                if (existingLevel != null)
                {
                    // Update descriptions
                    if (incomingLevel.Description != null)
                        existingLevel.Description = incomingLevel.Description;

                    // Enforce the Business Rule: If fixed, force Min/Max to null.
                    if (template.IsFixed)
                    {
                        existingLevel.MinValue = null;
                        existingLevel.MaxValue = null;
                    }
                    else
                    {
                        // Only accept payload values if it's NOT fixed
                        existingLevel.MinValue = incomingLevel.MinValue;
                        existingLevel.MaxValue = incomingLevel.MaxValue;
                    }
                }
            }
        }
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "Rating Scale Template updated successfully.");
    }
}
