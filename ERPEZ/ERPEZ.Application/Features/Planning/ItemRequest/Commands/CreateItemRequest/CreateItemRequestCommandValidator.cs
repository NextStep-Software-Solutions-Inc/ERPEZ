using FluentValidation;

namespace ERPEZ.Application.Features.Planning.ItemRequest.Commands.CreateItemRequest;

public class CreateItemRequestCommandValidator : AbstractValidator<CreateItemRequestCommand>
{
    public CreateItemRequestCommandValidator()
    {
        RuleFor(x => x.OfficeId)
            .NotEmpty()
            .WithMessage("Office ID is required.");

        RuleFor(x => x.Name)
            .NotEmpty()
            .WithMessage("Item Name is required.")
            .MaximumLength(250)
            .WithMessage("Item Name cannot exceed 250 characters.");

        RuleFor(x => x.ItemCategory)
            .NotEmpty()
            .WithMessage("Item Category is required.")
            .MaximumLength(100)
            .WithMessage("Item Category cannot exceed 100 characters.");

        RuleFor(x => x.Status)
            .NotEmpty()
            .WithMessage("Status is required.")
            .MaximumLength(50)
            .WithMessage("Status cannot exceed 50 characters.");

        RuleFor(x => x.EstimatedUnitCost)
            .GreaterThanOrEqualTo(0)
            .WithMessage("Estimated Unit Cost must be greater than or equal to 0.");

        RuleFor(x => x.TechnicalSpecification)
            .MaximumLength(2000)
            .When(x => !string.IsNullOrEmpty(x.TechnicalSpecification))
            .WithMessage("Technical Specification cannot exceed 2000 characters.");

        RuleFor(x => x.TWGRemarks)
            .MaximumLength(1000)
            .When(x => !string.IsNullOrEmpty(x.TWGRemarks))
            .WithMessage("TWG Remarks cannot exceed 1000 characters.");

        RuleFor(x => x.UACSCode)
            .MaximumLength(50)
            .When(x => !string.IsNullOrEmpty(x.UACSCode))
            .WithMessage("UACS Code cannot exceed 50 characters.");

        RuleFor(x => x.UNSCPSCCode)
            .MaximumLength(50)
            .When(x => !string.IsNullOrEmpty(x.UNSCPSCCode))
            .WithMessage("UNSCPSC Code cannot exceed 50 characters.");
    }
}
