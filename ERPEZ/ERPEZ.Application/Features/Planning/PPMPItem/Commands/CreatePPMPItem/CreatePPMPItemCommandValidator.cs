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
            .WithMessage("Item Name cannot exceed 250 characters.");

        RuleFor(x => x.Unit)
            .NotEmpty()
            .WithMessage("Unit is required.")
            .MaximumLength(50)
            .WithMessage("Unit cannot exceed 50 characters.");

        RuleFor(x => x.UnitPrice)
            .GreaterThanOrEqualTo(0)
            .WithMessage("Unit Price must be greater than or equal to 0.");

        RuleFor(x => x.MOPJustification)
            .NotEmpty()
            .When(x => x.MOPOverride)
            .WithMessage("MOP Justification is required when MOP Override is enabled.");

        RuleFor(x => x.Description)
            .MaximumLength(500)
            .When(x => !string.IsNullOrEmpty(x.Description))
            .WithMessage("Description cannot exceed 500 characters.");
    }
}
