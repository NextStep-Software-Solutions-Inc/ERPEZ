using FluentValidation;

namespace ERPEZ.Application.Features.Planning.OPCRItemRating.Commands.DeleteOPCRItemRating;

public class DeleteOPCRItemRatingCommandValidator : AbstractValidator<DeleteOPCRItemRatingCommand>
{
    public DeleteOPCRItemRatingCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("OPCR Item Rating ID is required.");
    }
}
