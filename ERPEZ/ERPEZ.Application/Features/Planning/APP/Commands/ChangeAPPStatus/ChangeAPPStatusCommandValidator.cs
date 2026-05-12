using FluentValidation;
using ERPEZ.Domain.Enums;

namespace ERPEZ.Application.Features.Planning.APP.Commands.ChangeAPPStatus;

public class ChangeAPPStatusCommandValidator : AbstractValidator<ChangeAPPStatusCommand>
{
    public ChangeAPPStatusCommandValidator()
    {
        RuleFor(x => x.Status)
            .NotNull()
            .WithMessage("Status is required.")
            .IsInEnum()
            .WithMessage("Invalid status value.")
            .Must(s => s is StatusEnum.Submitted or StatusEnum.Approved or StatusEnum.Returned)
            .WithMessage("Status must be Submitted, Approved, or Returned.");

        RuleFor(x => x.Remarks)
            .NotEmpty()
            .WithMessage("Remarks are required when returning an APP.")
            .When(x => x.Status == StatusEnum.Returned);

        RuleFor(x => x.Remarks)
            .MaximumLength(1000)
            .WithMessage("Remarks cannot exceed 1000 characters.")
            .When(x => !string.IsNullOrEmpty(x.Remarks));
    }
}