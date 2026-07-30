using FluentValidation;

namespace ERPEZ.Application.Features.Planning.Budgeting.LIBAmendmentRequest.Commands.ApproveLIBAmendmentRequest;

public class ApproveLIBAmendmentRequestCommandValidator : AbstractValidator<ApproveLIBAmendmentRequestCommand>
{
    public ApproveLIBAmendmentRequestCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("ID is required.");
    }
}
