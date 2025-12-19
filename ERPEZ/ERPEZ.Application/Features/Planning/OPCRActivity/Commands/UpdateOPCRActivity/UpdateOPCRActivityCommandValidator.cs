using FluentValidation;

namespace ERPEZ.Application.Features.Planning.OPCRActivity.Commands.UpdateOPCRActivity;

public class UpdateOPCRActivityCommandValidator : AbstractValidator<UpdateOPCRActivityCommand>
{
    public UpdateOPCRActivityCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("OPCR Activity ID is required for update.");

        RuleFor(x => x.UpdateOPCRActivity.OPCRId)
            .NotEmpty()
            .WithMessage("OPCR ID is required.")
            .When(x => x.UpdateOPCRActivity.OPCRId.HasValue);

        RuleFor(x => x.UpdateOPCRActivity.DUKPIAssignmentId)
            .NotEmpty()
            .WithMessage("DU KPI Assignment ID is required.")
            .When(x => x.UpdateOPCRActivity.DUKPIAssignmentId.HasValue);

        RuleFor(x => x.UpdateOPCRActivity.Name)
            .NotEmpty()
            .MinimumLength(3)
            .MaximumLength(200)
            .WithMessage("Activity name must be between 3 and 200 characters.")
            .When(x => !string.IsNullOrWhiteSpace(x.UpdateOPCRActivity.Name));

        RuleFor(x => x.UpdateOPCRActivity.Description)
            .MaximumLength(1000)
            .WithMessage("Description cannot exceed 1000 characters.")
            .When(x => !string.IsNullOrWhiteSpace(x.UpdateOPCRActivity.Description));

        RuleFor(x => x.UpdateOPCRActivity.Budget)
            .GreaterThanOrEqualTo(0)
            .WithMessage("Budget must be zero or greater.")
            .When(x => x.UpdateOPCRActivity.Budget.HasValue);

        RuleFor(x => x.UpdateOPCRActivity.PAPDepartments)
            .Must(departments => departments.Distinct().Count() == departments.Count)
            .WithMessage("Duplicate PAP Departments are not allowed.")
            .When(x => x.UpdateOPCRActivity.PAPDepartments.Count != 0);
    }
}
