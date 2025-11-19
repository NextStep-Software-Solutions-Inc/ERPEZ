using FluentValidation;

namespace ERPEZ.Application.Features.Planning.MFOKPI.Commands.CreateMFOKPI;

public class CreateMFOKPICommandValidator : AbstractValidator<CreateMFOKPICommand>
{
    public CreateMFOKPICommandValidator()
    {
        // KPIId (Required GUID)
        RuleFor(x => x.KPIId)
            .NotEmpty()
            .WithMessage("KPI ID is required and must be a valid, non-empty GUID.");

        // MFOPAPId (Required GUID)
        RuleFor(x => x.MFOPAPId)
            .NotEmpty()
            .WithMessage("MFO/PAP ID is required and must be a valid, non-empty GUID.");
    }
}
