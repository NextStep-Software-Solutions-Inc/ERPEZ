using FluentValidation;

namespace ERPEZ.Application.Features.Procurement.PurchaseRequests.Commands.UpdatePRStatus;

public class UpdatePRStatusCommandValidator : AbstractValidator<UpdatePRStatusCommand>
{
    private static readonly string[] allowedStatuses = ["Draft", "Submitted", "Approved", "Returned"];

    public UpdatePRStatusCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("PR ID is required.");

        RuleFor(x => x.Status)
            .NotEmpty().WithMessage("Status is required.")
            .Must(s => allowedStatuses.Contains(s))
            .WithMessage($"Status must be one of: {string.Join(", ", allowedStatuses)}.");
    }
}