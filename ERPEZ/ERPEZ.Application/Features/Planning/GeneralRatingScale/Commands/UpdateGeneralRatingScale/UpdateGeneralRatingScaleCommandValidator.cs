using FluentValidation;

namespace ERPEZ.Application.Features.Planning.GeneralRatingScale.Commands.UpdateGeneralRatingScale;

public class UpdateGeneralRatingScaleCommandValidator : AbstractValidator<UpdateGeneralRatingScaleCommand>
{
    public UpdateGeneralRatingScaleCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("General Rating Scale Id is required.");

        RuleFor(x => x.AdjectivalRatingName)
            .NotEmpty()
            .WithMessage("Adjectival Rating Name is required.")
            .MaximumLength(100)
            .WithMessage("Adjectival Rating Name cannot exceed 100 characters.");

        RuleFor(x => x.MinScore)
            .GreaterThanOrEqualTo(0)
            .WithMessage("Min Score must be greater than or equal to 0.");

        RuleFor(x => x.MaxScore)
            .GreaterThan(x => x.MinScore)
            .WithMessage("Max Score must be greater than Min Score.");
    }
}
