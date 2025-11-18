using FluentValidation;

namespace ERPEZ.Application.Features.Planning.OPCRRating.Commands.DeleteOPCRRating;

public class DeleteOPCRRatingCommandValidator : AbstractValidator<DeleteOPCRRatingCommand>
{
    public DeleteOPCRRatingCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("OPCR Rating ID is required for deletion.")
            .Must(id => id != Guid.Empty)
            .WithMessage("OPCR Rating ID must be a valid, non-empty GUID.");
    }
}