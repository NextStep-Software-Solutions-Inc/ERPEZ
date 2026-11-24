using FluentValidation;
using ERPEZ.Application.Features.Planning.Budgeting.Common.Enums;

namespace ERPEZ.Application.Features.Planning.Budgeting.LIBAmendmentRequest.Commands.CreateLIBAmendmentRequest;

public class CreateLIBAmendmentRequestCommandValidator : AbstractValidator<CreateLIBAmendmentRequestCommand>
{
    public CreateLIBAmendmentRequestCommandValidator()
    {
        RuleFor(x => x.Request.LineItemBudgetId)
            .NotEmpty()
            .WithMessage("{PropertyName} is required.");
        RuleFor(x => x.Request.Reason)
            .NotEmpty()
            .WithMessage("{PropertyName} is required.")
            .Must(v => Enum.TryParse<LIBAmendmentReasonEnum>(v, true, out _))
            .WithMessage("{PropertyName} must be a valid LIBAmendmentReasonEnum value. Valid values are: UnforeseenModification, Reassessment, AdditionalRequirements.");
        RuleFor(x => x.Request.Justification)
            .NotEmpty()
            .WithMessage("{PropertyName} is required.")
            .MaximumLength(2000)
            .WithMessage("{PropertyName} must not exceed 2000 characters.");
    }
}


