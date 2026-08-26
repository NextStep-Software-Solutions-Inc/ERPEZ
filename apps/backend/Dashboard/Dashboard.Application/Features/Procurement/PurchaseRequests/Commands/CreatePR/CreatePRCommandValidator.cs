using ERPEZ.Application.Features.Procurement.PurchaseRequests.Dtos;
using ERPEZ.Domain.Enums;
using FluentValidation;

namespace ERPEZ.Application.Features.Procurement.PurchaseRequests.Commands.CreatePR;

public class CreatePRCommandValidator : AbstractValidator<CreatePRCommand>
{
    public CreatePRCommandValidator()
    {
        RuleFor(x => x.PRNumber)
            .NotEmpty().WithMessage("PR Number is required.")
            .MaximumLength(50).WithMessage("PR Number cannot exceed 50 characters.");

        RuleFor(x => x.Purpose)
            .NotEmpty().WithMessage("Purpose is required.")
            .MaximumLength(1000).WithMessage("Purpose cannot exceed 1000 characters.");

        RuleFor(x => x.OfficeId)
            .NotEmpty().WithMessage("Office ID is required.");

        RuleFor(x => x.RequestedDate)
            .NotEmpty().WithMessage("Requested date is required.");

        RuleFor(x => x.Description)
            .MaximumLength(500).WithMessage("Description cannot exceed 500 characters.")
            .When(x => x.Description is not null);

        RuleFor(x => x.PRType)
            .IsInEnum().WithMessage("Invalid PR Type.");

        RuleForEach(x => x.Items).SetValidator(new PRItemRequestValidator());

        RuleForEach(x => x.Items)
            .Must(item => !item.APRItemId.HasValue && item.IsNonCSE)
            .WithMessage("NonCSE items must have IsNonCSE = true and no APRItemId.")
            .When(x => x.PRType == PRType.NonCSE);

        RuleForEach(x => x.Items)
            .Must(item => item.APRItemId.HasValue && !item.IsNonCSE)
            .WithMessage("Out-of-Stock CSE items must have APRItemId set and IsNonCSE = false.")
            .When(x => x.PRType == PRType.OutOfStockCSE);
    }
}

public class PRItemRequestValidator : AbstractValidator<PRItemRequest>
{
    public PRItemRequestValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Item name is required.")
            .MaximumLength(500).WithMessage("Item name cannot exceed 500 characters.");

        RuleFor(x => x.UnitCost)
            .GreaterThan(0).WithMessage("Unit cost must be greater than zero.");

        RuleFor(x => x.RequestedQuantity)
            .GreaterThan(0).WithMessage("Requested quantity must be greater than zero.");

        RuleFor(x => x.RequestedMonth)
            .IsInEnum().WithMessage("Invalid requested month.");
    }
}