using ERPEZ.Application.Features.Planning.Supplier.Dtos;
using ERPEZ.Domain.Enums;
using FluentValidation;

namespace ERPEZ.Application.Features.Planning.Supplier.Commands.PatchSupplier;

public class PatchSupplierCommandValidator : AbstractValidator<PatchSupplierCommand>
{
    private static readonly HashSet<string> allowedStatuses = new(StringComparer.OrdinalIgnoreCase)
    {
        "pending",
        "approved",
        "declined"
    };

    public PatchSupplierCommandValidator()
    {
        RuleFor(x => x.PatchSupplier.Status)
            .Must(status => status is null || allowedStatuses.Contains(NormalizeStatus(status)))
            .WithMessage("Status must be one of: pending, approved, declined.");

        When(x => string.Equals(NormalizeStatus(x.PatchSupplier.Status), "declined", StringComparison.OrdinalIgnoreCase), () =>
        {
            RuleFor(x => x.PatchSupplier.StatusNote)
                .NotEmpty()
                .WithMessage("Status note is required when status is declined.");
        });
    }

    private static string NormalizeStatus(string? status)
    {
        return status?.Trim() ?? string.Empty;
    }
}
