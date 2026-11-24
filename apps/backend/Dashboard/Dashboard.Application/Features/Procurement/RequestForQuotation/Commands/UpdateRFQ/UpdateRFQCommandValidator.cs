using FluentValidation;

namespace ERPEZ.Application.Features.Procurement.RequestForQuotation.Commands.UpdateRFQ;

public class UpdateRFQCommandValidator : AbstractValidator<UpdateRFQCommand>
{
    public UpdateRFQCommandValidator()
    {
        RuleFor(x => x.RFQId).NotEmpty();

        RuleFor(x => x.RFQNumber)
            .NotEmpty()
            .MaximumLength(100);

        RuleFor(x => x.TracingNumber)
            .NotEmpty()
            .MaximumLength(100);

        RuleFor(x => x.Date).NotEmpty();

        RuleFor(x => x.SupplierIds)
            .NotNull()
            .WithMessage("Please select at least 3 prospective suppliers.")
            .Must(x => x != null && x.Distinct().Count() >= 3)
            .WithMessage("Please select at least 3 prospective suppliers.");
    }
}
