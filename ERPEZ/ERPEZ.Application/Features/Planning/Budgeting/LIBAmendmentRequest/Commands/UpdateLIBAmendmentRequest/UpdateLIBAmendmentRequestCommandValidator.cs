using FluentValidation;

namespace ERPEZ.Application.Features.Planning.Budgeting.LIBAmendmentRequest.Commands.UpdateLIBAmendmentRequest;

public class UpdateLIBAmendmentRequestCommandValidator : AbstractValidator<UpdateLIBAmendmentRequestCommand>
{
    public UpdateLIBAmendmentRequestCommandValidator()
    {
        RuleFor(x => x.Request.Id)
            .NotEmpty()
            .WithMessage("{PropertyName} is required.");
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



