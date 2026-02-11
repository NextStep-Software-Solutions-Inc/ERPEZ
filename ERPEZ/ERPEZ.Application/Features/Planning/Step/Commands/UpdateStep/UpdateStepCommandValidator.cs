using FluentValidation;

namespace ERPEZ.Application.Features.Planning.Step.Commands.UpdateStep;

public class UpdateStepCommandValidator : AbstractValidator<UpdateStepCommand>
{
    public UpdateStepCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Id is required.");

        RuleFor(x => x.UpdateStep.Name)
            .MaximumLength(200)
            .When(x => !string.IsNullOrEmpty(x.UpdateStep.Name))
            .WithMessage("Name cannot exceed 200 characters.");

        RuleFor(x => x.UpdateStep.Code)
            .MaximumLength(50)
            .When(x => !string.IsNullOrEmpty(x.UpdateStep.Code))
            .WithMessage("Code cannot exceed 50 characters.");

        RuleFor(x => x.UpdateStep.StepNumber)
            .GreaterThan(0)
            .When(x => x.UpdateStep.StepNumber.HasValue)
            .WithMessage("StepNumber must be greater than 0.");

        RuleFor(x => x.UpdateStep.MinStep)
            .GreaterThan(0)
            .When(x => x.UpdateStep.MinStep.HasValue)
            .WithMessage("MinStep must be greater than 0.");

        RuleFor(x => x.UpdateStep.MaxStep)
            .GreaterThan(0)
            .When(x => x.UpdateStep.MaxStep.HasValue)
            .WithMessage("MaxStep must be greater than 0.");

        RuleFor(x => x)
            .Must(x => !x.UpdateStep.MaxStep.HasValue || !x.UpdateStep.MinStep.HasValue || x.UpdateStep.MaxStep >= x.UpdateStep.MinStep)
            .WithMessage("MaxStep must be greater than or equal to MinStep.");

        RuleFor(x => x.UpdateStep.Description)
            .MaximumLength(500)
            .When(x => !string.IsNullOrEmpty(x.UpdateStep.Description))
            .WithMessage("Description cannot exceed 500 characters.");
    }
}

