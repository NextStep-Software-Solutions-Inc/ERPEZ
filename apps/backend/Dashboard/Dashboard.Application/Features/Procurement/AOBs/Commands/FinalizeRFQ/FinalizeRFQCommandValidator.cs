using FluentValidation;

namespace ERPEZ.Application.Features.Procurement.AOBs.Commands.FinalizeRFQ;

public class FinalizeRFQCommandValidator : AbstractValidator<FinalizeRFQCommand>
{
    public FinalizeRFQCommandValidator()
    {
        RuleFor(x => x.RFQId)
            .NotEmpty()
            .WithMessage("RFQ ID is required.");
    }
}
