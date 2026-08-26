using FluentValidation;

namespace ERPEZ.Application.Features.Planning.UACSValidationRule.Commands.CreateUACSValidationRule;

/// <summary>
/// Validator for CreateUACSValidationRuleCommand ensuring all user input meets business requirements.
/// </summary>
public class CreateUACSValidationRuleCommandValidator : AbstractValidator<CreateUACSValidationRuleCommand>
{
    public CreateUACSValidationRuleCommandValidator()
    {
        RuleFor(x => x.RuleName)
            .NotEmpty()
            .WithMessage("Rule name is required.")
            .MinimumLength(3)
            .WithMessage("Rule name must be at least 3 characters.")
            .MaximumLength(200)
            .WithMessage("Rule name cannot exceed 200 characters.");

        RuleFor(x => x.Description)
            .NotEmpty()
            .WithMessage("Description is required.")
            .MinimumLength(10)
            .WithMessage("Description must be at least 10 characters.")
            .MaximumLength(1000)
            .WithMessage("Description cannot exceed 1000 characters.");

        RuleFor(x => x.ValidationExpression)
            .NotEmpty()
            .WithMessage("Validation expression is required.")
            .MaximumLength(2000)
            .WithMessage("Validation expression cannot exceed 2000 characters.");

        RuleFor(x => x.ErrorMessage)
            .NotEmpty()
            .WithMessage("Error message is required.")
            .MaximumLength(500)
            .WithMessage("Error message cannot exceed 500 characters.");

        RuleFor(x => x.Priority)
            .GreaterThan(0)
            .WithMessage("Priority must be greater than zero.");

        RuleFor(x => x.SegmentType)
            .IsInEnum()
            .When(x => x.SegmentType.HasValue)
            .WithMessage("Segment type must be a valid UACS segment type.");
    }
}
