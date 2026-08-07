using ERPEZ.Domain.Enums;
using FluentValidation;

namespace ERPEZ.Application.Features.Planning.WFP.Commands.UpdateWFP;

public class UpdateWFPCommandValidator : AbstractValidator<UpdateWFPCommand>
{
    public UpdateWFPCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Work and Financial Plan ID is required for update.");

        RuleFor(x => x.UpdateWFP.OfficeId)
            .NotEmpty()
            .WithMessage("Office ID must be a valid GUID.")
            .When(x => x.UpdateWFP.OfficeId.HasValue);

        RuleFor(x => x.UpdateWFP.ProjectTitle)
            .MinimumLength(5)
            .WithMessage("Project Title must be at least 5 characters long.")
            .MaximumLength(250)
            .WithMessage("Project Title cannot exceed 250 characters.")
            .When(x => !string.IsNullOrWhiteSpace(x.UpdateWFP.ProjectTitle));

        RuleFor(x => x.UpdateWFP.ProjectEndDate)
            .GreaterThan(x => x.UpdateWFP.ProjectStartDate!.Value)
            .WithMessage("Project End Date must be after Project Start Date.")
            .When(x => x.UpdateWFP.ProjectStartDate.HasValue && x.UpdateWFP.ProjectEndDate.HasValue);

        RuleFor(x => x.UpdateWFP.ProposedBudget)
            .GreaterThanOrEqualTo(0)
            .WithMessage("Proposed Budget must be a non-negative value.")
            .When(x => x.UpdateWFP.ProposedBudget.HasValue);

        RuleFor(x => x.UpdateWFP.GeneralObjective)
            .MaximumLength(1000)
            .WithMessage("General Objective cannot exceed 1000 characters.")
            .When(x => !string.IsNullOrWhiteSpace(x.UpdateWFP.GeneralObjective));

        RuleFor(x => x.UpdateWFP.Mode)
            .IsInEnum()
            .WithMessage("Mode must be 'OPCR' or 'External'.")
            .When(x => x.UpdateWFP.Mode.HasValue);
    }
}
