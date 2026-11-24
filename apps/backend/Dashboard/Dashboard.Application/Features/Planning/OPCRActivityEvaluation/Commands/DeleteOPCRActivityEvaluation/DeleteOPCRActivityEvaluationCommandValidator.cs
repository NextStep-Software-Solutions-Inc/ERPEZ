using FluentValidation;

namespace ERPEZ.Application.Features.Planning.OPCRActivityEvaluation.Commands.DeleteOPCRActivityEvaluation;

/// <summary>
/// Validator for DeleteOPCRActivityEvaluationCommand ensuring the ID is valid.
/// </summary>
public class DeleteOPCRActivityEvaluationCommandValidator : AbstractValidator<DeleteOPCRActivityEvaluationCommand>
{
    public DeleteOPCRActivityEvaluationCommandValidator()
    {
        // ID (Required GUID)
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Evaluation ID is required and must be a valid, non-empty GUID.");
    }
}
