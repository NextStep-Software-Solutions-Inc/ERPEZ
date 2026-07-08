using FluentValidation;
using ERPEZ.Application.Features.Planning.Budgeting.Common.Enums;

namespace ERPEZ.Application.Features.Planning.Budgeting.LIB.Commands.UpdateLIBStatus;

public class UpdateLIBStatusCommandValidator : AbstractValidator<UpdateLIBStatusCommand>
{
    public UpdateLIBStatusCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("{PropertyName} is required.");
        RuleFor(x => x.Status)
            .NotEmpty()
            .WithMessage("{PropertyName} is required.")
            .Must(v => Enum.TryParse<LIBStatusEnum>(v, true, out _))
            .WithMessage("{PropertyName} must be a valid LIB status value (Draft, Submitted, Approved, Returned, Consolidated, Proposed, PendingCeilingApproval).");
    }
}
