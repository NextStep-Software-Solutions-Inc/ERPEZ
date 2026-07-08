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
            .NotEmpty()
            .WithMessage("Please select at least one prospective supplier.");
    }
}
