using FluentValidation;

namespace ERPEZ.Application.Features.Planning.BACResolutionWhereasClause.Commands.DeleteBACResolutionWhereasClause;

/// <summary>
/// Validator for DeleteBACResolutionWhereasClauseCommand ensuring the ID is provided.
/// </summary>
public class DeleteBACResolutionWhereasClauseCommandValidator : AbstractValidator<DeleteBACResolutionWhereasClauseCommand>
{
    public DeleteBACResolutionWhereasClauseCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Whereas clause ID is required for deletion.");
    }
}
