using ERPEZ.Application.Features.Planning.FYActiveKPI.Dtos;
using FluentValidation;

namespace ERPEZ.Application.Features.Planning.FYActiveKPI.Commands.ActivateFYActiveKPI;

public class ActivateFYActiveKPICommandValidator : AbstractValidator<ActivateFYActiveKPICommand>
{
    public ActivateFYActiveKPICommandValidator()
    {
        RuleFor(x => x.FiscalYearId)
            .NotEmpty()
            .WithMessage("FiscalYearId is required.");

        RuleFor(x => x.KPIs)
            .NotEmpty()
            .WithMessage("At least one KPI must be provided for activation.")
            .Must(kpis => kpis.Count > 0)
            .WithMessage("At least one KPI must be provided for activation.");

        RuleForEach(x => x.KPIs)
            .SetValidator(new ActivateKPIRequestValidator());
    }
}

public class ActivateKPIRequestValidator : AbstractValidator<ActivateKPIRequest>
{
    public ActivateKPIRequestValidator()
    {
        RuleFor(x => x.MasterKPIId)
            .NotEmpty()
            .WithMessage("MasterKPIId is required.");
    }
}
