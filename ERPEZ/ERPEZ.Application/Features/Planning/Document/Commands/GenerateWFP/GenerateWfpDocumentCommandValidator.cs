using FluentValidation;

namespace ERPEZ.Application.Features.Planning.Document.Commands.GenerateWFP;

public class GenerateWfpDocumentCommandValidator : AbstractValidator<GenerateWfpDocumentCommand>
{
    public GenerateWfpDocumentCommandValidator()
    {
        RuleFor(x => x.OfficeId)
            .NotEmpty()
            .WithMessage("Office is required.");

        RuleFor(x => x.FiscalYear)
            .NotEmpty()
            .Matches(@"^\d{4}$")
            .WithMessage("Fiscal Year must be a 4-digit year.");

        RuleFor(x => x.ProjectTitle)
            .NotEmpty()
            .WithMessage("Project Title is required.")
            .MaximumLength(500);

        RuleFor(x => x.DurationMonths)
            .GreaterThan(0)
            .WithMessage("Duration must be at least 1 month.");

        RuleFor(x => x.ProjectEndDate)
            .GreaterThan(x => x.ProjectStartDate)
            .WithMessage("Project End Date must be after Project Start Date.");
            
        RuleFor(x => x.Objectives)
        .NotEmpty().WithMessage("WFP must have at least one objective.");

        RuleForEach(x => x.Objectives).ChildRules(obj =>
        {
            obj.RuleFor(o => o.ObjectiveText).NotEmpty().WithMessage("Objective text is required.");
            obj.RuleFor(o => o.Activities).NotEmpty().WithMessage("Each objective must have at least one activity.");
        });

        RuleFor(x => x.Signatories)
            .Must(s => s.Count >= 3)
            .WithMessage("WFP requires 3 signatories: Prepared by, Funds Available, Approved.");
    }
}