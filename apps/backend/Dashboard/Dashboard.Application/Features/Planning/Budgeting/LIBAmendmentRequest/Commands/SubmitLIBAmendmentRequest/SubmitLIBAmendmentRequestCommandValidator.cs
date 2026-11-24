using FluentValidation;

namespace ERPEZ.Application.Features.Planning.Budgeting.LIBAmendmentRequest.Commands.SubmitLIBAmendmentRequest;

public class SubmitLIBAmendmentRequestCommandValidator : AbstractValidator<SubmitLIBAmendmentRequestCommand>
{
    public SubmitLIBAmendmentRequestCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("{PropertyName} is required.");
    }
}
