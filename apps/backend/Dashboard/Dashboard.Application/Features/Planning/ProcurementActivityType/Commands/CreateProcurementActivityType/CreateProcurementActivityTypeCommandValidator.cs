using FluentValidation;

namespace ERPEZ.Application.Features.Planning.ProcurementActivityType.Commands.CreateProcurementActivityType;

public class CreateProcurementActivityTypeCommandValidator : AbstractValidator<CreateProcurementActivityTypeCommand>
{
    public CreateProcurementActivityTypeCommandValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty()
            .WithMessage("Name is required.")
            .MaximumLength(250)
            .WithMessage("Name cannot exceed 250 characters.");

        RuleFor(x => x.Description)
            .NotEmpty()
            .WithMessage("Description is required.")
            .MaximumLength(1000)
            .WithMessage("Description cannot exceed 1000 characters.");

        RuleFor(x => x.MinDays)
            .GreaterThanOrEqualTo(0)
            .WithMessage("MinDays must be greater than or equal to 0.")
            .When(x => x.MinDays.HasValue);

        RuleFor(x => x.MaxDays)
            .GreaterThanOrEqualTo(0)
            .WithMessage("MaxDays must be greater than or equal to 0.")
            .When(x => x.MaxDays.HasValue);

        RuleFor(x => x)
            .Must(x => !x.MinDays.HasValue || !x.MaxDays.HasValue || x.MaxDays.Value >= x.MinDays.Value)
            .WithMessage("MaxDays must be greater than or equal to MinDays.");
    }
}
