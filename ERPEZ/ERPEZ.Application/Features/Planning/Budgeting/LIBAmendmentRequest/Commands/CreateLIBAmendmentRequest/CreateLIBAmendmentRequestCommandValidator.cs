using FluentValidation;

namespace ERPEZ.Application.Features.Planning.Budgeting.LIBAmendmentRequest.Commands.CreateLIBAmendmentRequest;

public class CreateLIBAmendmentRequestCommandValidator : AbstractValidator<CreateLIBAmendmentRequestCommand>
{
    public CreateLIBAmendmentRequestCommandValidator()
    {
        RuleFor(x => x.Request.LineItemBudgetId)
            .NotEmpty()
            .WithMessage("{PropertyName} is required.");
        RuleFor(x => x.Request.ProposedLineItemBudgetId)
            .NotEmpty()
            .WithMessage("{PropertyName} is required.");
        RuleFor(x => x.Request.Justification)
            .NotEmpty()
            .WithMessage("{PropertyName} is required.")
            .MaximumLength(2000)
            .WithMessage("{PropertyName} must not exceed 2000 characters.");
    }
}



