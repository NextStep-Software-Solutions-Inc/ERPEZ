using FluentValidation;

namespace ERPEZ.Application.Features.Planning.OPCRActivity.Commands.CreateOPCRActivity;

public class CreateOPCRActivityCommandValidator : AbstractValidator<CreateOPCRActivityCommand>
{
    public CreateOPCRActivityCommandValidator()
    {
        RuleFor(x => x.OPCRId)
            .NotEmpty()
            .WithMessage("OPCR ID is required.");

        RuleFor(x => x.DUKPIAssignmentId)
            .NotEmpty()
            .WithMessage("DU KPI Assignment ID is required.");

        RuleFor(x => x.Name)
            .NotEmpty()
            .MinimumLength(3)
            .MaximumLength(200)
            .WithMessage("Activity name must be between 3 and 200 characters.");

        RuleFor(x => x.Description)
            .MaximumLength(1000)
            .WithMessage("Description cannot exceed 1000 characters.")
            .When(x => !string.IsNullOrWhiteSpace(x.Description));

        RuleFor(x => x.Budget)
            .GreaterThanOrEqualTo(0)
            .WithMessage("Budget must be zero or greater.");

        RuleFor(x => x.PAPDepartments)
            .Must(x => x.Distinct().Count() == x.Count)
            .WithMessage("Duplicate PAP Departments are not allowed.")
            .When(x => x.PAPDepartments.Count != 0);
    }
}
