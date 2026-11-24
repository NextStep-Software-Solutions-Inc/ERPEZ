using FluentValidation;

namespace ERPEZ.Application.Features.Planning.ItemRequest.Commands.UpdateItemRequest;

public class UpdateItemRequestCommandValidator : AbstractValidator<UpdateItemRequestCommand>
{
    public UpdateItemRequestCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Item Request ID is required.");

        RuleFor(x => x.Name)
            .NotEmpty()
            .When(x => x.Name != null)
            .WithMessage("Item Name cannot be empty.")
            .MaximumLength(250)
            .When(x => x.Name != null)
            .WithMessage("Item Name cannot exceed 250 characters.");

        RuleFor(x => x.ItemCategory)
            .NotEmpty()
            .When(x => x.ItemCategory != null)
            .WithMessage("Item Category cannot be empty.")
            .MaximumLength(100)
            .When(x => x.ItemCategory != null)
            .WithMessage("Item Category cannot exceed 100 characters.");

        RuleFor(x => x.Status)
            .NotEmpty()
            .When(x => x.Status != null)
            .WithMessage("Status cannot be empty.")
            .MaximumLength(50)
            .When(x => x.Status != null)
            .WithMessage("Status cannot exceed 50 characters.");

        RuleFor(x => x.EstimatedUnitCost)
            .GreaterThanOrEqualTo(0)
            .When(x => x.EstimatedUnitCost.HasValue)
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
