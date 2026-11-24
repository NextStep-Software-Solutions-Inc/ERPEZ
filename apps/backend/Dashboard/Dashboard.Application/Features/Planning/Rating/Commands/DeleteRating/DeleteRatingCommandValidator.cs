using FluentValidation;

namespace ERPEZ.Application.Features.Planning.Rating.Commands.DeleteRating;

public class DeleteRatingCommandValidator : AbstractValidator<DeleteRatingCommand>
{
    public DeleteRatingCommandValidator()
    {
        // Primary ID Validation (Required for deletion)
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("KPI Rating ID is required for deletion.")
            .Must(id => id != Guid.Empty)
            .WithMessage("KPI Rating ID must be a valid, non-empty GUID.");
    }
}
