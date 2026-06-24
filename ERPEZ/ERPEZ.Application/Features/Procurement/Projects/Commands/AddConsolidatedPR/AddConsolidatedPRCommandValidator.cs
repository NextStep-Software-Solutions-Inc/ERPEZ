using FluentValidation;

namespace ERPEZ.Application.Features.Procurement.Projects.Commands.AddConsolidatedPR;

public class AddConsolidatedPRCommandValidator : AbstractValidator<AddConsolidatedPRCommand>
{
    public AddConsolidatedPRCommandValidator()
    {
        RuleFor(x => x.ProjectId)
            .NotEmpty()
            .WithMessage("ProjectId is required.");

        RuleFor(x => x.Request.ConsolidatedPRId)
            .NotEmpty()
            .WithMessage("ConsolidatedPRId is required.");
    }
}
