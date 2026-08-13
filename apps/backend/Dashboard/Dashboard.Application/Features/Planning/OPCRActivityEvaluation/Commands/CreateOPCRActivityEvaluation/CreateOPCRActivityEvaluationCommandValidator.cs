using FluentValidation;

namespace ERPEZ.Application.Features.Planning.OPCRActivityEvaluation.Commands.CreateOPCRActivityEvaluation;

/// <summary>
/// Validator for CreateOPCRActivityEvaluationCommand ensuring all user input meets business requirements
/// and enforces strict validation rules for OPCR Activity Evaluation creation.
/// </summary>
public class CreateOPCRActivityEvaluationCommandValidator : AbstractValidator<CreateOPCRActivityEvaluationCommand>
{
    public CreateOPCRActivityEvaluationCommandValidator()
    {
        // OPCRActivityRatingId (Required GUID)
        RuleFor(x => x.OPCRActivityRatingId)
            .NotEmpty()
            .WithMessage("OPCR Activity Rating ID is required and must be a valid, non-empty GUID.");

        // EvaluatorScore (Required, valid range 1-5)
        RuleFor(x => x.EvaluatorScore)
            .InclusiveBetween(1, 5)
            .WithMessage("Evaluator Score must be between 1 and 5 (inclusive).");

        // Remarks (Optional, but with max length constraint)
        RuleFor(x => x.Remarks)
            .MaximumLength(1000)
            .WithMessage("Remarks cannot exceed 1000 characters.")
            .When(x => !string.IsNullOrWhiteSpace(x.Remarks));
    }
}
