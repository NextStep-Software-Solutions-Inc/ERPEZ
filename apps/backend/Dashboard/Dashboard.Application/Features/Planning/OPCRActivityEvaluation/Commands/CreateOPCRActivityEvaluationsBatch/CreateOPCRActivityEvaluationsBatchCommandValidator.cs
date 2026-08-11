using FluentValidation;

namespace ERPEZ.Application.Features.Planning.OPCRActivityEvaluation.Commands.CreateOPCRActivityEvaluationsBatch;

/// <summary>
/// Validator for CreateOPCRActivityEvaluationsBatchCommand ensuring all batch input meets business requirements.
/// </summary>
public class CreateOPCRActivityEvaluationsBatchCommandValidator : AbstractValidator<CreateOPCRActivityEvaluationsBatchCommand>
{
    public CreateOPCRActivityEvaluationsBatchCommandValidator()
    {
        // Evaluations list must not be empty
        RuleFor(command => command.Evaluations)
            .NotEmpty()
            .WithMessage("Evaluations list cannot be empty.")
            .Must(evaluations => evaluations.Count <= 100)
            .WithMessage("Cannot create more than 100 evaluations in a single batch.");

        // Validate each evaluation item
        RuleForEach(command => command.Evaluations)
            .ChildRules(evaluation =>
            {
                evaluation.RuleFor(x => x.OPCRActivityRatingId)
                    .NotEmpty()
                    .WithMessage("OPCR Activity Rating ID is required for each evaluation.");

                evaluation.RuleFor(x => x.EvaluatorScore)
                    .InclusiveBetween(1, 5)
                    .WithMessage("Evaluator Score must be between 1 and 5 for each evaluation.");

                evaluation.RuleFor(x => x.Remarks)
                    .MaximumLength(1000)
                    .WithMessage("Remarks cannot exceed 1000 characters for each evaluation.")
                    .When(x => !string.IsNullOrWhiteSpace(x.Remarks));
            });
    }
}