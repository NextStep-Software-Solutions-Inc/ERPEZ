using FluentValidation;

namespace ERPEZ.Application.Features.Planning.BACResolutionWhereasClause.Commands.CreateBACResolutionWhereasClause;

/// <summary>
/// Validator for CreateBACResolutionWhereasClauseCommand ensuring required values are provided.
/// </summary>
public class CreateBACResolutionWhereasClauseCommandValidator : AbstractValidator<CreateBACResolutionWhereasClauseCommand>
{
    public CreateBACResolutionWhereasClauseCommandValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty()
            .MaximumLength(300)
            .WithMessage("Whereas title is required and cannot exceed 300 characters.");

        RuleFor(x => x.Body)
            .NotEmpty()
            .MaximumLength(20000)
            .WithMessage("Whereas body is required and cannot exceed 20000 characters.");
    }
}
