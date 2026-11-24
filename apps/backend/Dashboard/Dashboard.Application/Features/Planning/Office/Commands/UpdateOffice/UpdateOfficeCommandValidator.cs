using FluentValidation;

namespace ERPEZ.Application.Features.Planning.Office.Commands.UpdateOffice;

public class UpdateOfficeCommandValidator : AbstractValidator<UpdateOfficeCommand>
{
    public UpdateOfficeCommandValidator()
    {
        // Primary ID Validation (Required for update)
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Office ID is required for update.")
            .Must(id => id != Guid.Empty)
            .WithMessage("Office ID must be a valid, non-empty GUID.");

        // Name (Optional String, Min/Max Length)
        When(x => x.UpdateOffice.Name != null, () =>
        {
            RuleFor(x => x.UpdateOffice.Name!)
                .NotEmpty()
                .WithMessage("Office Name is required.")
                .MinimumLength(3)
                .WithMessage("Office Name must be at least 3 characters long.")
                .MaximumLength(200)
                .WithMessage("Office Name cannot exceed 200 characters.");
        });

        // Code (Optional String, Max Length)
        When(x => x.UpdateOffice.Code != null, () =>
        {
            RuleFor(x => x.UpdateOffice.Code!)
                .NotEmpty()
                .WithMessage("Office Code is required.")
                .MaximumLength(50)
                .WithMessage("Office Code cannot exceed 50 characters.");
        });

        // Address (Optional String, Max Length)
        When(x => x.UpdateOffice.Address != null, () =>
        {
            RuleFor(x => x.UpdateOffice.Address!)
                .MaximumLength(500)
                .WithMessage("Address cannot exceed 500 characters.");
        });

        // Description (Optional String, Max Length)
        When(x => x.UpdateOffice.Description != null, () =>
        {
            RuleFor(x => x.UpdateOffice.Description!)
                .MaximumLength(1000)
                .WithMessage("Description cannot exceed 1000 characters.");
        });

        // ResponsibilityCenterCode (Optional String, Max Length)
        When(x => x.UpdateOffice.ResponsibilityCenterCode != null, () =>
        {
            RuleFor(x => x.UpdateOffice.ResponsibilityCenterCode)
                .MaximumLength(50)
                .WithMessage("Responsibility Center Code cannot exceed 50 characters.");
        });

        // BudgetCostCenter (Optional String, Max Length)
        When(x => x.UpdateOffice.BudgetCostCenter != null, () =>
        {
            RuleFor(x => x.UpdateOffice.BudgetCostCenter)
                .MaximumLength(50)
                .WithMessage("Budget Cost Center cannot exceed 50 characters.");
        });

        // Foreign Key Validations
        When(x => x.UpdateOffice.OfficeTypeId.HasValue, () =>
        {
            RuleFor(x => x.UpdateOffice.OfficeTypeId!.Value)
                .Must(id => id != Guid.Empty)
                .WithMessage("OfficeType ID must be a valid, non-empty GUID.");
        });

        When(x => x.UpdateOffice.OrganizationId.HasValue, () =>
        {
            RuleFor(x => x.UpdateOffice.OrganizationId!.Value)
                .Must(id => id != Guid.Empty)
                .WithMessage("Organization ID must be a valid, non-empty GUID.");
        });

        When(x => x.UpdateOffice.CategoryId.HasValue, () =>
        {
            RuleFor(x => x.UpdateOffice.CategoryId!.Value)
                .Must(id => id != Guid.Empty)
                .WithMessage("Category ID must be a valid, non-empty GUID.");
        });

        When(x => x.UpdateOffice.AdministrativeLevelId.HasValue, () =>
        {
            RuleFor(x => x.UpdateOffice.AdministrativeLevelId!.Value)
                .Must(id => id != Guid.Empty)
                .WithMessage("AdministrativeLevel ID must be a valid, non-empty GUID.");
        });

        When(x => x.UpdateOffice.ClusterId.HasValue, () =>
        {
            RuleFor(x => x.UpdateOffice.ClusterId!.Value)
                .Must(id => id != Guid.Empty)
                .WithMessage("Cluster ID must be a valid, non-empty GUID.");
        });

        When(x => x.UpdateOffice.ProcurementWorkflowId.HasValue, () =>
        {
            RuleFor(x => x.UpdateOffice.ProcurementWorkflowId!.Value)
                .Must(id => id != Guid.Empty)
                .WithMessage("ProcurementWorkflow ID must be a valid, non-empty GUID.");
        });

        When(x => x.UpdateOffice.ParentId.HasValue, () =>
        {
            RuleFor(x => x.UpdateOffice.ParentId!.Value)
                .Must(id => id != Guid.Empty)
                .WithMessage("Parent Office ID must be a valid, non-empty GUID.");
        });
    }
}
