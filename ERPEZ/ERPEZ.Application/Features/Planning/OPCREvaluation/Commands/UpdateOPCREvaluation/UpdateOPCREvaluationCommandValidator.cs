using FluentValidation;

namespace ERPEZ.Application.Features.Planning.OPCREvaluation.Commands.UpdateOPCREvaluation;

public class UpdateOPCREvaluationCommandValidator : AbstractValidator<UpdateOPCREvaluationCommand>
{
    private readonly string[] validEvaluationStatuses =
    [
        "Pending", "ReturnedForRevision", "Approved", "Finalized"
    ];

    public UpdateOPCREvaluationCommandValidator()
    {
        // Primary ID Validation (Required for update)
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("OPCREvaluation ID is required for update.");

        // EvaluationDate (Optional DateTime?)
        RuleFor(x => x.UpdateOPCREvaluation.EvaluationDate)
            .Must(date => date != default(DateTime))
            .WithMessage("Evaluation Date must be a valid date if provided.")
            .When(x => x.UpdateOPCREvaluation.EvaluationDate.HasValue);

        // Comments (Optional String?)
        RuleFor(x => x.UpdateOPCREvaluation.Comments)
            .MaximumLength(2000)
            .WithMessage("Comments cannot exceed 2000 characters.")
            .When(x => x.UpdateOPCREvaluation.Comments is not null);

        // Status (Optional String?, Valid Value if provided)
        RuleFor(x => x.UpdateOPCREvaluation.Status)
            .MaximumLength(50)
            .WithMessage("Status cannot exceed 50 characters.")
            .When(x => !string.IsNullOrEmpty(x.UpdateOPCREvaluation.Status));

        RuleFor(x => x.UpdateOPCREvaluation.Status)
            .Must(status => validEvaluationStatuses.Contains(status))
            .WithMessage($"Status must be one of the following (case-sensitive): {string.Join(", ", validEvaluationStatuses)}.")
            .When(x => !string.IsNullOrEmpty(x.UpdateOPCREvaluation.Status));
    }
}
