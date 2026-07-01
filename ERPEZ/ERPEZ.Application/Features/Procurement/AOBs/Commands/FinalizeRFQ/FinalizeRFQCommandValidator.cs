using FluentValidation;

namespace ERPEZ.Application.Features.Procurement.AOBs.Commands.FinalizeRFQ;

public class FinalizeRFQCommandValidator : AbstractValidator<FinalizeRFQCommand>
{
    public FinalizeRFQCommandValidator()
    {
        RuleFor(x => x.ProcurementProjectId)
            .NotEmpty()
            .WithMessage("Procurement Project ID is required.");
    }
}
