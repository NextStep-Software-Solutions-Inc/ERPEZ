using FluentValidation;

namespace ERPEZ.Application.Features.Planning.GeneralRatingScale.Commands.CreateGeneralRatingScale;

public class CreateGeneralRatingScaleCommandValidator : AbstractValidator<CreateGeneralRatingScaleCommand>
{
    public CreateGeneralRatingScaleCommandValidator()
    {
        RuleFor(x => x.FiscalYearId)
            .NotEmpty()
            .WithMessage("Fiscal Year is required.");

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
