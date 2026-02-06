using FluentValidation;

namespace ERPEZ.Application.Features.Planning.Step.Commands.UpdateStep;

public class UpdateStepCommandValidator : AbstractValidator<UpdateStepCommand>
{
    public UpdateStepCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Id is required.");

        RuleFor(x => x.Request.Name)
            .MaximumLength(200)
            .When(x => !string.IsNullOrEmpty(x.Request.Name))
            .WithMessage("Name cannot exceed 200 characters.");

        RuleFor(x => x.Request.Code)
            .MaximumLength(50)
            .When(x => !string.IsNullOrEmpty(x.Request.Code))
            .WithMessage("Code cannot exceed 50 characters.");

        RuleFor(x => x.Request.StepNumber)
            .GreaterThan(0)
            .When(x => x.Request.StepNumber.HasValue)
            .WithMessage("StepNumber must be greater than 0.");

        RuleFor(x => x.Request.MinStep)
            .GreaterThan(0)
            .When(x => x.Request.MinStep.HasValue)
            .WithMessage("MinStep must be greater than 0.");

        RuleFor(x => x.Request.MaxStep)
            .GreaterThan(0)
            .When(x => x.Request.MaxStep.HasValue)
            .WithMessage("MaxStep must be greater than 0.");

        RuleFor(x => x)
            .Must(x => !x.Request.MaxStep.HasValue || !x.Request.MinStep.HasValue || x.Request.MaxStep >= x.Request.MinStep)
            .WithMessage("MaxStep must be greater than or equal to MinStep.");

        RuleFor(x => x.Request.Description)
            .MaximumLength(500)
            .When(x => !string.IsNullOrEmpty(x.Request.Description))
            .WithMessage("Description cannot exceed 500 characters.");
    }
}
