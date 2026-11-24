using FluentValidation;

namespace ERPEZ.Application.Features.Planning.OPCRActivityRating.Commands.DeleteOPCRActivityRating;

/// <summary>
/// Validator for DeleteOPCRActivityRatingCommand ensuring the ID is valid.
/// </summary>
public class DeleteOPCRActivityRatingCommandValidator : AbstractValidator<DeleteOPCRActivityRatingCommand>
{
    public DeleteOPCRActivityRatingCommandValidator()
    {
        // ID (Required GUID)
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Rating ID is required and must be a valid, non-empty GUID.");
    }
}
