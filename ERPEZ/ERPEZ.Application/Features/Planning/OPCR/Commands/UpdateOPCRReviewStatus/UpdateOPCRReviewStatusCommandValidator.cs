// UpdateOPCRReviewStatusCommandValidator.cs
using FluentValidation;
using ERPEZ.Application.Features.Planning.OPCR.Commands.UpdateOPCRReviewStatus;

namespace ERPEZ.Application.Features.Planning.OPCR.Commands.UpdateOPCRReviewStatus;

public class UpdateOPCRReviewStatusCommandValidator
    : AbstractValidator<UpdateOPCRReviewStatusCommand>
{
    private static readonly string[] validValues = ["Pending", "Draft", "Submitted", "Returned", "Finalized"];

    public UpdateOPCRReviewStatusCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("OPCR ID is required.")
            .Must(id => id != Guid.Empty)
            .WithMessage("OPCR ID must be a valid, non-empty GUID.");

        RuleFor(x => x.Request.ReviewStatus)
            .NotEmpty()
            .WithMessage("Review status is required.")
            .Must(s => validValues.Contains(s, StringComparer.OrdinalIgnoreCase))
            .WithMessage($"Review status must be one of: {string.Join(", ", validValues)}.");
    }
}