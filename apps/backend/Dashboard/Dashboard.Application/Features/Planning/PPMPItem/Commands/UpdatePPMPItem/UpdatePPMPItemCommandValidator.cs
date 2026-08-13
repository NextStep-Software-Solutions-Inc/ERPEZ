using FluentValidation;

namespace ERPEZ.Application.Features.Planning.PPMPItem.Commands.UpdatePPMPItem;

public class UpdatePPMPItemCommandValidator : AbstractValidator<UpdatePPMPItemCommand>
{
    public UpdatePPMPItemCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("PPMP Item ID is required.");

        RuleFor(x => x.Name)
            .NotEmpty()
            .When(x => x.Name != null)
            .WithMessage("Item Name cannot be empty.")
            .MaximumLength(250)
            .When(x => x.Name != null)
            .WithMessage("Item Name cannot exceed 250 characters.");

        RuleFor(x => x.Unit)
            .NotEmpty()
            .When(x => x.Unit != null)
            .WithMessage("Unit cannot be empty.")
            .MaximumLength(50)
            .When(x => x.Unit != null)
            .WithMessage("Unit cannot exceed 50 characters.");

        RuleFor(x => x.UnitPrice)
            .GreaterThanOrEqualTo(0)
            .When(x => x.UnitPrice.HasValue)
            .WithMessage("Unit Price must be greater than or equal to 0.");

        RuleFor(x => x.MOPJustification)
            .NotEmpty()
            .When(x => x.MOPOverride == true)
            .WithMessage("MOP Justification is required when MOP Override is enabled.");

        RuleFor(x => x.Description)
            .MaximumLength(500)
            .When(x => !string.IsNullOrEmpty(x.Description))
            .WithMessage("Description cannot exceed 500 characters.");

        RuleFor(x => x.ProjectType)
            .IsInEnum()
            .When(x => x.ProjectType.HasValue)
            .WithMessage("Invalid Project Type value.");

        // ── Date range validations (only when both dates in the rule are provided) ────────────────────────────────────────────
        RuleFor(x => x.ProcurementEndDate)
            .Must((cmd, endDate) =>
                !endDate.HasValue ||
                !cmd.ProcurementStartDate.HasValue ||
                endDate.Value >= cmd.ProcurementStartDate.Value)
            .When(x => x.ProcurementEndDate.HasValue && x.ProcurementStartDate.HasValue)
            .WithMessage("Procurement End Date must be on or after Procurement Start Date.");

        RuleFor(x => x.ExpectedDeliveryEnd)
            .Must((cmd, endDate) =>
                !endDate.HasValue ||
                !cmd.ExpectedDeliveryStart.HasValue ||
                endDate.Value >= cmd.ExpectedDeliveryStart.Value)
            .When(x => x.ExpectedDeliveryEnd.HasValue && x.ExpectedDeliveryStart.HasValue)
            .WithMessage("Expected Delivery End must be on or after Expected Delivery Start.");

        RuleFor(x => x.ExpectedDeliveryStart)
            .Must((cmd, deliveryStart) =>
                !deliveryStart.HasValue ||
                !cmd.ProcurementEndDate.HasValue ||
                deliveryStart.Value >= cmd.ProcurementEndDate.Value)
            .When(x => x.ExpectedDeliveryStart.HasValue && x.ProcurementEndDate.HasValue)
            .WithMessage("Expected Delivery Start must be on or after Procurement End Date.");

        RuleFor(x => x.Remarks)
            .MaximumLength(1000)
            .When(x => !string.IsNullOrEmpty(x.Remarks))
            .WithMessage("Remarks cannot exceed 1000 characters.");
    }
}