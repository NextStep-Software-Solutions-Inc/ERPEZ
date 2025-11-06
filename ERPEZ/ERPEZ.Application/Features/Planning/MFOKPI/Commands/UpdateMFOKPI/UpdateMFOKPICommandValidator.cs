using FluentValidation;

namespace ERPEZ.Application.Features.Planning.MFOKPI.Commands.UpdateMFOKPI;

public class UpdateMFOKPICommandValidator : AbstractValidator<UpdateMFOKPICommand>
{
    public UpdateMFOKPICommandValidator()
    {
        // 1. Primary ID Validation (Crucial for updates)
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("MFO KPI ID is required for update.")
            .Must(id => id != Guid.Empty)
            .WithMessage("MFO KPI ID must be a valid, non-empty GUID.");

        // 2. KPIId (Required GUID)
        RuleFor(x => x.UpdateMFOKPI.KPIId)
            .NotEmpty()
            .WithMessage("KPI ID is required and must be a valid, non-empty GUID.");

        // 3. MFOPAPId (Required GUID)
        RuleFor(x => x.UpdateMFOKPI.MFOPAPId)
            .NotEmpty()
            .WithMessage("MFO/PAP ID is required and must be a valid, non-empty GUID.");
    }
}