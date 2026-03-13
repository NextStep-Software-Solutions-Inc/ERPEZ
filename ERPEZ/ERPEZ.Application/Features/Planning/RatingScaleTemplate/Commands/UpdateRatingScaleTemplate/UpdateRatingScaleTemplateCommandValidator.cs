using FluentValidation;

namespace ERPEZ.Application.Features.Planning.RatingScaleTemplate.Commands.UpdateRatingScaleTemplate;

public class UpdateRatingScaleTemplateCommandValidator : AbstractValidator<UpdateRatingScaleTemplateCommand>
{
    public UpdateRatingScaleTemplateCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Rating Scale Template ID is required.");

        RuleFor(x => x.Name)
            .MaximumLength(200)
            .WithMessage("Name cannot exceed 200 characters.")
            .When(x => !string.IsNullOrWhiteSpace(x.Name));

        RuleFor(x => x.Description)
            .MaximumLength(1000)
            .WithMessage("Description cannot exceed 1000 characters.")
            .When(x => x.Description != null);
    }
}
