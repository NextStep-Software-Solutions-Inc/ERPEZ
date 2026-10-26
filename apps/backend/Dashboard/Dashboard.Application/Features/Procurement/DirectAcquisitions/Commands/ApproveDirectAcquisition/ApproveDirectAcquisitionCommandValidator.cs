using FluentValidation;

namespace ERPEZ.Application.Features.Procurement.DirectAcquisitions.Commands.ApproveDirectAcquisition;

public class ApproveDirectAcquisitionCommandValidator : AbstractValidator<ApproveDirectAcquisitionCommand>
{
    public ApproveDirectAcquisitionCommandValidator()
    {
        RuleFor(v => v.DirectAcquisitionId)
            .NotEmpty().WithMessage("Direct Acquisition ID is required.");
    }
}
