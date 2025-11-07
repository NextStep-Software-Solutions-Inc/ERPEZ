using FluentValidation;

namespace ERPEZ.Application.Features.Planning.OPCRKPI.Commands.CreateOPCRKPI;

public class CreateOPCRKPICommandValidator : AbstractValidator<CreateOPCRKPICommand>
{
    public CreateOPCRKPICommandValidator()
    {
        // KPIId (Required GUID)
        RuleFor(x => x.KPIId)
            .NotEmpty()
            .WithMessage("KPI ID is required and must be a valid, non-empty GUID.");

        // OPCRId (Required GUID)
        RuleFor(x => x.OPCRId)
            .NotEmpty()
            .WithMessage("OPCR ID is required and must be a valid, non-empty GUID.");

        // Note: Business logic to check if the association already exists should be placed in the handler.
    }
}