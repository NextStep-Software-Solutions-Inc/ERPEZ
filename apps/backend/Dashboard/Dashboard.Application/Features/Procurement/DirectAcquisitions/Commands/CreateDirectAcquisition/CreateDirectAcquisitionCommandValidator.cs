using FluentValidation;

namespace ERPEZ.Application.Features.Procurement.DirectAcquisitions.Commands.CreateDirectAcquisition;

public class CreateDirectAcquisitionCommandValidator : AbstractValidator<CreateDirectAcquisitionCommand>
{
    public CreateDirectAcquisitionCommandValidator()
    {
        RuleFor(v => v.Request.ConsolidatedPRId)
            .NotEmpty().WithMessage("Consolidated PR selection is required.");
    }
}
