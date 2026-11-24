using FluentValidation;

namespace ERPEZ.Application.Features.Procurement.DirectAcquisitions.Commands.ReturnDirectAcquisition;

public class ReturnDirectAcquisitionCommandValidator : AbstractValidator<ReturnDirectAcquisitionCommand>
{
    public ReturnDirectAcquisitionCommandValidator()
    {
        RuleFor(v => v.DirectAcquisitionId)
            .NotEmpty().WithMessage("Direct Acquisition ID is required.");

        RuleFor(v => v.Request.Remarks)
            .NotEmpty().WithMessage("Remarks are required when returning a Direct Acquisition.");
    }
}
