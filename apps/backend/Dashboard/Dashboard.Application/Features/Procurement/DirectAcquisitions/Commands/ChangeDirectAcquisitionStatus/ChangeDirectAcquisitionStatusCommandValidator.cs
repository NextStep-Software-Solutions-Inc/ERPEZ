using FluentValidation;

namespace ERPEZ.Application.Features.Procurement.DirectAcquisitions.Commands.ChangeDirectAcquisitionStatus;

public class ChangeDirectAcquisitionStatusCommandValidator : AbstractValidator<ChangeDirectAcquisitionStatusCommand>
{
    public ChangeDirectAcquisitionStatusCommandValidator()
    {
        RuleFor(v => v.DirectAcquisitionId)
            .NotEmpty().WithMessage("Direct Acquisition ID is required.");
    }
}
