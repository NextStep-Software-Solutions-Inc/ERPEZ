using FluentValidation;

namespace ERPEZ.Application.Features.Planning.Budgeting.LIBAmendmentRequest.Commands.DeleteLIBAmendmentRequest;

public class DeleteLIBAmendmentRequestCommandValidator : AbstractValidator<DeleteLIBAmendmentRequestCommand>
{
    public DeleteLIBAmendmentRequestCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("{PropertyName} is required.");
    }
}



