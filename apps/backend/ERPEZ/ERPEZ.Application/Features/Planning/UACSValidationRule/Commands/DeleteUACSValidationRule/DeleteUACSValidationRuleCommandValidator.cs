using FluentValidation;

namespace ERPEZ.Application.Features.Planning.UACSValidationRule.Commands.DeleteUACSValidationRule;

/// <summary>
/// Validator for DeleteUACSValidationRuleCommand ensuring the ID is provided.
/// </summary>
public class DeleteUACSValidationRuleCommandValidator : AbstractValidator<DeleteUACSValidationRuleCommand>
{
    public DeleteUACSValidationRuleCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("UACS validation rule ID is required for deletion.");
    }
}
