using FluentValidation;

namespace ERPEZ.Application.Features.Planning.RatingScaleTemplate.Commands.CreateRatingScaleTemplate;

public class CreateRatingScaleTemplateCommandValidator : AbstractValidator<CreateRatingScaleTemplateCommand>
{
    public CreateRatingScaleTemplateCommandValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty()
            .WithMessage("Rating Scale Template Name is required.")
            .MaximumLength(200)
            .WithMessage("Name cannot exceed 200  characters.");

        RuleFor(x => x.Description)
            .MaximumLength(1000)
            .WithMessage("Description cannot exceed 1000 characters.")
            .When(x => !string.IsNullOrEmpty(x.Description));

        RuleFor(x => x.GeneralRatingScaleId)
            .Must(id => !id.HasValue || id.Value != Guid.Empty)
            .WithMessage("If provided, General Rating Scale ID must be a valid, non-empty GUID.")
            .When(x => x.GeneralRatingScaleId.HasValue);

        RuleForEach(x => x.RatingScaleLevels)
            .ChildRules(level =>
            {
                level.RuleFor(l => l.RatingValue)
                    .InclusiveBetween(1, 5)
                    .WithMessage("Rating value must be between 1 and 5.");

                level.RuleFor(l => l.Description)
                    .MaximumLength(500)
                    .WithMessage("Level description cannot exceed 500 characters.")
                    .When(l => !string.IsNullOrEmpty(l.Description));

                level.RuleFor(l => l.MinValue)
                    .LessThanOrEqualTo(l => l.MaxValue)
                    .WithMessage("Min value must be less than or equal to max value.")
                    .When(l => l.MinValue.HasValue && l.MaxValue.HasValue);
            });
    }
}
