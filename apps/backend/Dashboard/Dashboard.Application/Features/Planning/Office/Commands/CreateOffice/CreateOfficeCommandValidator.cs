using FluentValidation;

namespace ERPEZ.Application.Features.Planning.Office.Commands.CreateOffice;

public class CreateOfficeCommandValidator : AbstractValidator<CreateOfficeCommand>
{
    public CreateOfficeCommandValidator()
    {
        // Name (Required String, Min/Max Length)
        RuleFor(x => x.Name)
            .NotEmpty()
            .WithMessage("Office Name is required.")
            .MinimumLength(3)
            .WithMessage("Office Name must be at least 3 characters long.")
            .MaximumLength(200)
            .WithMessage("Office Name cannot exceed 200 characters.");

        // Code (Required String, Max Length)
        RuleFor(x => x.Code)
            .NotEmpty()
            .WithMessage("Office Code is required.")
            .MaximumLength(50)
            .WithMessage("Office Code cannot exceed 50 characters.");

        // Address (Optional String, Max Length)
        RuleFor(x => x.Address)
            .MaximumLength(500)
            .WithMessage("Address cannot exceed 500 characters.")
            .When(x => !string.IsNullOrWhiteSpace(x.Address));

        // Description (Optional String, Max Length)
        RuleFor(x => x.Description)
            .MaximumLength(1000)
            .WithMessage("Description cannot exceed 1000 characters.")
            .When(x => !string.IsNullOrWhiteSpace(x.Description));

        // ResponsibilityCenterCode (Optional String, Max Length)
        RuleFor(x => x.ResponsibilityCenterCode)
            .MaximumLength(50)
            .WithMessage("Responsibility Center Code cannot exceed 50 characters.")
            .When(x => !string.IsNullOrWhiteSpace(x.ResponsibilityCenterCode));

        // BudgetCostCenter (Optional String, Max Length)
        RuleFor(x => x.BudgetCostCenter)
            .MaximumLength(50)
            .WithMessage("Budget Cost Center cannot exceed 50 characters.")
            .When(x => !string.IsNullOrWhiteSpace(x.BudgetCostCenter));

        // Required foreign keys
        RuleFor(x => x.OfficeTypeId)
            .NotEmpty()
            .WithMessage("OfficeType is required.")
            .Must(id => id != Guid.Empty)
            .WithMessage("OfficeType ID must be a valid, non-empty GUID.");

        RuleFor(x => x.OrganizationId)
            .NotEmpty()
            .WithMessage("Organization is required.")
            .Must(id => id != Guid.Empty)
            .WithMessage("Organization ID must be a valid, non-empty GUID.");

        RuleFor(x => x.CategoryId)
            .NotEmpty()
            .WithMessage("Category is required.")
            .Must(id => id != Guid.Empty)
            .WithMessage("Category ID must be a valid, non-empty GUID.");

        RuleFor(x => x.AdministrativeLevelId)
            .NotEmpty()
            .WithMessage("AdministrativeLevel is required.")
            .Must(id => id != Guid.Empty)
            .WithMessage("AdministrativeLevel ID must be a valid, non-empty GUID.");

        // Optional foreign keys
        RuleFor(x => x.ClusterId)
            .Must(id => id != Guid.Empty)
            .WithMessage("If provided, the Cluster ID must be a valid, non-empty GUID.")
            .When(x => x.ClusterId.HasValue);

        RuleFor(x => x.ProcurementWorkflowId)
            .Must(id => id != Guid.Empty)
            .WithMessage("If provided, the ProcurementWorkflow ID must be a valid, non-empty GUID.")
            .When(x => x.ProcurementWorkflowId.HasValue);

        RuleFor(x => x.ParentId)
            .Must(id => id != Guid.Empty)
            .WithMessage("If provided, the Parent Office ID must be a valid, non-empty GUID.")
            .When(x => x.ParentId.HasValue);
    }
}
