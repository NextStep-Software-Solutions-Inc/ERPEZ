using FluentValidation;

namespace ERPEZ.Application.Features.Planning.Budgeting.LIBAmendmentRequest.Commands.ReturnLIBAmendmentRequest;

public class ReturnLIBAmendmentRequestCommandValidator : AbstractValidator<ReturnLIBAmendmentRequestCommand>
{
    public ReturnLIBAmendmentRequestCommandValidator()
    {
        RuleFor(x => x.Request.Remarks)
            .NotEmpty()
            .WithMessage("Remarks are required when returning an amendment request.");
    }
}
