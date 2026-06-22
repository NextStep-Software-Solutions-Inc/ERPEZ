using FluentValidation;

namespace ERPEZ.Application.Features.Procurement.Projects.Commands.CreateProcurementProject;

public class CreateProcurementProjectCommandValidator : AbstractValidator<CreateProcurementProjectCommand>
{
    public CreateProcurementProjectCommandValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty()
            .MaximumLength(500)
            .WithMessage("Project title is required and cannot exceed 500 characters.");

        RuleFor(x => x.ConsolidatedPRId)
            .NotEmpty()
            .WithMessage("Consolidated PR Id is required.");

        RuleFor(x => x.ModeOfProcurementId)
            .NotEmpty()
            .WithMessage("Mode of procurement is required.");

        RuleFor(x => x.ABC)
            .GreaterThan(0)
            .WithMessage("Approved Budget for the Contract (ABC) must be greater than zero.");
    }
}
