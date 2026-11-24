using FluentValidation;

namespace ERPEZ.TenantManagement.Application.Features.Licenses.Commands.ClaimTrialLicense;

public class ClaimTrialLicenseCommandValidator : AbstractValidator<ClaimTrialLicenseCommand>
{
    public ClaimTrialLicenseCommandValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("TenantId cannot be empty.");
    }
}
