using FluentValidation;

namespace ERPEZ.Application.Features.Planning.Step.Commands.DeleteStep;

/// <summary>
/// Validator for DeleteStepCommand ensuring the ID is provided.
/// </summary>
public class DeleteStepCommandValidator : AbstractValidator<DeleteStepCommand>
{
    public DeleteStepCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Step ID is required for deletion.");
    }
}
