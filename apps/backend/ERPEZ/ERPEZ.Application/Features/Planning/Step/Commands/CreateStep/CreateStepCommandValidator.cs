using FluentValidation;

namespace ERPEZ.Application.Features.Planning.Step.Commands.CreateStep;

public class CreateStepCommandValidator : AbstractValidator<CreateStepCommand>
{
    public CreateStepCommandValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty()
            .WithMessage("Name is required.")
            .MaximumLength(200)
            .WithMessage("Name cannot exceed 200 characters.");

        RuleFor(x => x.Code)
            .NotEmpty()
            .WithMessage("Code is required.")
            .MaximumLength(50)
            .WithMessage("Code cannot exceed 50 characters.");

        RuleFor(x => x.StepNumber)
            .GreaterThan(0)
            .WithMessage("StepNumber must be greater than 0.");

        RuleFor(x => x.MinStep)
            .GreaterThan(0)
            .WithMessage("MinStep must be greater than 0.");

        RuleFor(x => x.MaxStep)
            .GreaterThan(0)
            .WithMessage("MaxStep must be greater than 0.");

        RuleFor(x => x.MaxStep)
            .GreaterThanOrEqualTo(x => x.MinStep)
            .WithMessage("MaxStep must be greater than or equal to MinStep.");

        RuleFor(x => x.Description)
            .MaximumLength(500)
            .When(x => !string.IsNullOrEmpty(x.Description))
            .WithMessage("Description cannot exceed 500 characters.");
    }
}
