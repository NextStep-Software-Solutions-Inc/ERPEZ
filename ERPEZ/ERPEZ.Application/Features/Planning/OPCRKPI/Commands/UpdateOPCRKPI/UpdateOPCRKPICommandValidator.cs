using FluentValidation;

namespace ERPEZ.Application.Features.Planning.OPCRKPI.Commands.UpdateOPCRKPI;

public class UpdateOPCRKPICommandValidator : AbstractValidator<UpdateOPCRKPICommand>
{
    public UpdateOPCRKPICommandValidator()
    {
        // 1. Primary ID Validation (Crucial for updates)
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("OPCR KPI ID is required for update.")
            .Must(id => id != Guid.Empty)
            .WithMessage("OPCR KPI ID must be a valid, non-empty GUID.");

        // 2. KPIId (Required GUID)
        RuleFor(x => x.UpdateOPCRKPI.KPIId)
            .NotEmpty()
            .WithMessage("KPI ID is required and must be a valid, non-empty GUID.");

        // 3. OPCRId (Required GUID)
        RuleFor(x => x.UpdateOPCRKPI.OPCRId)
            .NotEmpty()
            .WithMessage("OPCR ID is required and must be a valid, non-empty GUID.");
    }
}