using FluentValidation;

namespace ERPEZ.TenantManagement.Application.Features.Licenses.Commands.PurchaseLicense;

public class PurchaseLicenseCommandValidator : AbstractValidator<PurchaseLicenseCommand>
{
    public PurchaseLicenseCommandValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("TenantId cannot be empty.");

        RuleFor(x => x.AllowedDomain)
            .NotEmpty().WithMessage("AllowedDomain is required for cryptographic key binding.");
    }
}
