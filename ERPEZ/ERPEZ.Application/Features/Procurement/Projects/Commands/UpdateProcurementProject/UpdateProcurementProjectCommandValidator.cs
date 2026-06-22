using FluentValidation;

namespace ERPEZ.Application.Features.Procurement.Projects.Commands.UpdateProcurementProject;

public class UpdateProcurementProjectCommandValidator : AbstractValidator<UpdateProcurementProjectCommand>
{
    public UpdateProcurementProjectCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Project Id is required.");

        RuleFor(x => x.UpdateRequest.Title)
            .NotEmpty()
            .MaximumLength(500)
            .WithMessage("Project title is required and cannot exceed 500 characters.");

        RuleFor(x => x.UpdateRequest.ModeOfProcurementId)
            .NotEmpty()
            .WithMessage("Mode of procurement is required.");

        RuleFor(x => x.UpdateRequest.ABC)
            .GreaterThan(0)
            .WithMessage("Approved Budget for the Contract (ABC) must be greater than zero.");

        RuleFor(x => x.UpdateRequest.Status)
            .NotEmpty()
            .WithMessage("Status is required.");
    }
}
