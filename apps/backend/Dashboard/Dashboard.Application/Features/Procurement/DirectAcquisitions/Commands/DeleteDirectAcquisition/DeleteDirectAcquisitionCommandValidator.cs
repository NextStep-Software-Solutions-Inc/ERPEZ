using FluentValidation;

namespace ERPEZ.Application.Features.Procurement.DirectAcquisitions.Commands.DeleteDirectAcquisition;

public class DeleteDirectAcquisitionCommandValidator : AbstractValidator<DeleteDirectAcquisitionCommand>
{
    public DeleteDirectAcquisitionCommandValidator()
    {
        RuleFor(v => v.Id)
            .NotEmpty().WithMessage("Direct Acquisition ID is required.");
    }
}
