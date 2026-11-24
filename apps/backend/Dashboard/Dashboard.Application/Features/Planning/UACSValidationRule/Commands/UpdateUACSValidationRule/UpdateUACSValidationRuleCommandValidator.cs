using FluentValidation;

namespace ERPEZ.Application.Features.Planning.UACSValidationRule.Commands.UpdateUACSValidationRule;

/// <summary>
/// Validator for UpdateUACSValidationRuleCommand ensuring all user input meets business requirements.
/// </summary>
public class UpdateUACSValidationRuleCommandValidator : AbstractValidator<UpdateUACSValidationRuleCommand>
{
    public UpdateUACSValidationRuleCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("UACS validation rule ID is required.");

        RuleFor(x => x.UpdateUACSValidationRule.RuleName)
            .NotEmpty()
            .WithMessage("Rule name is required.")
            .MinimumLength(3)
            .WithMessage("Rule name must be at least 3 characters.")
            .MaximumLength(200)
            .WithMessage("Rule name cannot exceed 200 characters.");

        RuleFor(x => x.UpdateUACSValidationRule.Description)
            .NotEmpty()
            .WithMessage("Description is required.")
            .MinimumLength(10)
            .WithMessage("Description must be at least 10 characters.")
            .MaximumLength(1000)
            .WithMessage("Description cannot exceed 1000 characters.");

        RuleFor(x => x.UpdateUACSValidationRule.ValidationExpression)
            .NotEmpty()
            .WithMessage("Validation expression is required.")
            .MaximumLength(2000)
            .WithMessage("Validation expression cannot exceed 2000 characters.");

        RuleFor(x => x.UpdateUACSValidationRule.ErrorMessage)
            .NotEmpty()
            .WithMessage("Error message is required.")
            .MaximumLength(500)
            .WithMessage("Error message cannot exceed 500 characters.");

        RuleFor(x => x.UpdateUACSValidationRule.Priority)
            .GreaterThan(0)
            .WithMessage("Priority must be greater than zero.");

        RuleFor(x => x.UpdateUACSValidationRule.SegmentType)
            .IsInEnum()
            .When(x => x.UpdateUACSValidationRule.SegmentType.HasValue)
            .WithMessage("Segment type must be a valid UACS segment type.");
    }
}
