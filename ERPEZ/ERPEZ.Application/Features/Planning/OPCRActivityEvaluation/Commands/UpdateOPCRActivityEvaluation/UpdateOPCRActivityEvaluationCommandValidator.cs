using FluentValidation;

namespace ERPEZ.Application.Features.Planning.OPCRActivityEvaluation.Commands.UpdateOPCRActivityEvaluation;

/// <summary>
/// Validator for UpdateOPCRActivityEvaluationCommand ensuring all user input meets business requirements.
/// </summary>
public class UpdateOPCRActivityEvaluationCommandValidator : AbstractValidator<UpdateOPCRActivityEvaluationCommand>
{
    public UpdateOPCRActivityEvaluationCommandValidator()
    {
        // ID (Required GUID)
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Evaluation ID is required and must be a valid, non-empty GUID.");

        // UpdateEvaluation (Required)
        RuleFor(x => x.UpdateEvaluation)
            .NotNull()
            .WithMessage("Update evaluation data is required.");

        // EvaluatorScore (Optional, but must be in valid range if provided)
        RuleFor(x => x.UpdateEvaluation.EvaluatorScore)
            .InclusiveBetween(1, 5)
            .WithMessage("Evaluator Score must be between 1 and 5 (inclusive).")
            .When(x => x.UpdateEvaluation.EvaluatorScore.HasValue);

        // Remarks (Optional, but with max length constraint)
        RuleFor(x => x.UpdateEvaluation.Remarks)
            .MaximumLength(1000)
            .WithMessage("Remarks cannot exceed 1000 characters.")
            .When(x => !string.IsNullOrWhiteSpace(x.UpdateEvaluation.Remarks));

        // Status (Optional, but must be valid enum value if provided)
        RuleFor(x => x.UpdateEvaluation.Status)
            .IsInEnum()
            .WithMessage("Status must be a valid OPCR Evaluation Status (Pending, Evaluated, or Returned).")
            .When(x => x.UpdateEvaluation.Status.HasValue);

        // EvaluatedDate validation
        RuleFor(x => x.UpdateEvaluation.EvaluatedDate)
            .LessThanOrEqualTo(DateTime.UtcNow)
            .WithMessage("Evaluated Date cannot be in the future.")
            .When(x => x.UpdateEvaluation.EvaluatedDate.HasValue);

        // EvaluatedDate required when Status is Evaluated
        RuleFor(x => x.UpdateEvaluation.EvaluatedDate)
            .NotEmpty()
            .WithMessage("Evaluated Date is required when Status is Evaluated.")
            .When(x => x.UpdateEvaluation.Status.HasValue && 
                      x.UpdateEvaluation.Status.Value == Domain.Enums.OPCREvaluationStatus.Evaluated);
    }
}
