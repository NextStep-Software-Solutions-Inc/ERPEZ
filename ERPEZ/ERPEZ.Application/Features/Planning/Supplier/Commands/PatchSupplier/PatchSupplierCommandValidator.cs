using ERPEZ.Application.Features.Planning.Supplier.Dtos;
using ERPEZ.Domain.Enums;
using FluentValidation;

namespace ERPEZ.Application.Features.Planning.Supplier.Commands.PatchSupplier;

public class PatchSupplierCommandValidator : AbstractValidator<PatchSupplierCommand>
{
    public PatchSupplierCommandValidator()
    {
        RuleFor(x => x.PatchSupplier.Status)
            .Must(status => status is null || status == "pending" || status == "approved" || status == "declined")
            .WithMessage("Status must be one of: pending, approved, declined.");

        When(x => x.PatchSupplier.Status?.Equals("declined", StringComparison.OrdinalIgnoreCase) == true, () =>
        {
            RuleFor(x => x.PatchSupplier.StatusNote)
                .NotEmpty()
                .WithMessage("Status note is required when status is declined.");
        });
    }
}
