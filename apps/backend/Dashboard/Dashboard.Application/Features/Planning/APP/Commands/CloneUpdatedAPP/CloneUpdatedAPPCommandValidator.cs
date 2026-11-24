using FluentValidation;

namespace ERPEZ.Application.Features.Planning.APP.Commands.CloneUpdatedAPP;

public class CloneUpdatedAPPCommandValidator : AbstractValidator<CloneUpdatedAPPCommand>
{
    public CloneUpdatedAPPCommandValidator()
    {
        RuleFor(x => x.SourceAppId)
            .NotEmpty()
            .WithMessage("Source APP ID is required.");

        RuleFor(x => x.Batch)
            .NotEmpty()
            .WithMessage("Batch is required.");

        RuleFor(x => x.Quarter)
            .Must(q => new[] { "Q1", "Q2", "Q3", "Q4" }.Contains(q?.Trim().ToUpper()))
            .WithMessage("Quarter must be Q1, Q2, Q3, or Q4.");
    }
}
