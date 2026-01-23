using FluentValidation;

namespace ERPEZ.Application.Features.Planning.UACSCodeCombination.Commands.DeleteUACSCodeCombination;

/// <summary>
/// Validator for DeleteUACSCodeCombinationCommand ensuring the ID is provided.
/// </summary>
public class DeleteUACSCodeCombinationCommandValidator : AbstractValidator<DeleteUACSCodeCombinationCommand>
{
    public DeleteUACSCodeCombinationCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("UACS code combination ID is required for deletion.");
    }
}
