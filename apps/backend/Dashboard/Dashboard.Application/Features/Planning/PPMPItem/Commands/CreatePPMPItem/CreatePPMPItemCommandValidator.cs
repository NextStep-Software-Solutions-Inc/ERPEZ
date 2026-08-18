using ERPEZ.Domain.Enums;
using FluentValidation;

namespace ERPEZ.Application.Features.Planning.PPMPItem.Commands.CreatePPMPItem;

public class CreatePPMPItemCommandValidator : AbstractValidator<CreatePPMPItemCommand>
{
    public CreatePPMPItemCommandValidator()
    {
        RuleFor(x => x.PPMPExpenditureItemId)
            .NotEmpty()
            .WithMessage("PPMP Expenditure Item ID is required.");

        RuleFor(x => x)
            .Must(x => x.CSEItemId.HasValue || x.NonCSEItemId.HasValue)
            .WithMessage("Either CSE Item ID or Non-CSE Item ID must be provided.")
            .Must(x => !(x.CSEItemId.HasValue && x.NonCSEItemId.HasValue))
            .WithMessage("Cannot have both CSE Item ID and Non-CSE Item ID. They are mutually exclusive.");

        RuleFor(x => x.ProcurementModeId)
            .NotEmpty()
            .WithMessage("Procurement Mode ID is required.");

        RuleFor(x => x.Name)
            .NotEmpty()
            .WithMessage("Item Name is required.")
            .MaximumLength(250)
            .WithMessage("Item Name cannot exceed 250 characters.")
            .When(x => !x.CSEItemId.HasValue && !x.NonCSEItemId.HasValue); // ← only required if no item selected

        RuleFor(x => x.Unit)
            .NotEmpty()
            .WithMessage("Unit is required.")
            .MaximumLength(50)
            .WithMessage("Unit cannot exceed 50 characters.")
            .When(x => !x.CSEItemId.HasValue && !x.NonCSEItemId.HasValue); // ← only required if no item selected

        RuleFor(x => x.UnitPrice)
            .GreaterThan(0)
            .WithMessage("Unit Price must be greater than 0.")
            .When(x => !x.CSEItemId.HasValue && !x.NonCSEItemId.HasValue); // ← only required if no item selected

        RuleFor(x => x.MOPJustification)
            .NotEmpty()
            .When(x => x.MOPOverride)
            .WithMessage("MOP Justification is required when MOP Override is enabled.");

        RuleFor(x => x.Description)
            .MaximumLength(500)
            .When(x => !string.IsNullOrEmpty(x.Description))
            .WithMessage("Description cannot exceed 500 characters.");

        RuleFor(x => x.ProjectType)
            .IsInEnum()
            .WithMessage("Invalid Project Type value.");

        // ── Date range validations ────────────────────────────────────────────
        RuleFor(x => x.ProcurementEndDate)
            .Must((cmd, endDate) =>
                !endDate.HasValue ||
                !cmd.ProcurementStartDate.HasValue ||
                endDate.Value >= cmd.ProcurementStartDate.Value)
            .WithMessage("Procurement End Date must be on or after Procurement Start Date.");

        RuleFor(x => x.ExpectedDeliveryEnd)
            .Must((cmd, endDate) =>
                !endDate.HasValue ||
                !cmd.ExpectedDeliveryStart.HasValue ||
                endDate.Value >= cmd.ExpectedDeliveryStart.Value)
            .WithMessage("Expected Delivery End must be on or after Expected Delivery Start.");

        RuleFor(x => x.ExpectedDeliveryStart)
            .Must((cmd, deliveryStart) =>
                !deliveryStart.HasValue ||
                !cmd.ProcurementEndDate.HasValue ||
                deliveryStart.Value >= cmd.ProcurementEndDate.Value)
            .WithMessage("Expected Delivery Start must be on or after Procurement End Date.");

        RuleFor(x => x.Remarks)
            .MaximumLength(1000)
            .When(x => !string.IsNullOrEmpty(x.Remarks))
            .WithMessage("Remarks cannot exceed 1000 characters.");
    }
}