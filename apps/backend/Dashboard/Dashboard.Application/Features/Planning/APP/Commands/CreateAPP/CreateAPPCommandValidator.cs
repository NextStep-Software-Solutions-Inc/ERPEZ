using FluentValidation;

namespace ERPEZ.Application.Features.Planning.APP.Commands.CreateAPP;

public class CreateAPPCommandValidator : AbstractValidator<CreateAPPCommand>
{
    private static readonly string[] validQuarters = ["Q1", "Q2", "Q3", "Q4"];
    private static readonly string[] allowedTypes   = ["Indicative", "Final"];

    public CreateAPPCommandValidator()
    {
        RuleFor(x => x.APPNumber)
            .NotEmpty()
            .WithMessage("APP Number is required.")
            .MaximumLength(100)
            .WithMessage("APP Number cannot exceed 100 characters.");

        RuleFor(x => x.Name)
            .NotEmpty()
            .WithMessage("APP Name is required.")
            .MaximumLength(500)
            .WithMessage("APP Name cannot exceed 500 characters.");

        RuleFor(x => x.FiscalYearId)
            .NotEmpty()
            .WithMessage("Fiscal Year is required.");

        // Updated APPs are created only via the dedicated CloneUpdatedAPP workflow.
        RuleFor(x => x.APPType)
            .Must(t => allowedTypes.Contains(t, StringComparer.OrdinalIgnoreCase))
            .WithMessage("APP Type must be either 'Indicative' or 'Final' for standard creation. Use the Updated APP workflow for Updated APPs.");

        RuleFor(x => x.Batch)
            .NotEmpty()
            .WithMessage("Batch is required.");

        // Backend enforces controlled quarter values; frontend pre-validation is supplementary.
        RuleFor(x => x.Quarter)
            .Must(q => validQuarters.Contains(q?.Trim().ToUpper()))
            .WithMessage("Quarter must be Q1, Q2, Q3, or Q4.");

        RuleFor(x => x.Remarks)
            .MaximumLength(1000)
            .WithMessage("Remarks cannot exceed 1000 characters.")
            .When(x => !string.IsNullOrEmpty(x.Remarks));

        RuleFor(x => x.Description)
            .MaximumLength(1000)
            .WithMessage("Description cannot exceed 1000 characters.")
            .When(x => !string.IsNullOrEmpty(x.Description));
    }
}
