using FluentValidation;

namespace ERPEZ.Application.Features.Planning.KPIRating.Commands.DeleteKPIRating;

public class DeleteKPIRatingCommandValidator : AbstractValidator<DeleteKPIRatingCommand>
{
    public DeleteKPIRatingCommandValidator()
    {
        // Primary ID Validation (Required for deletion)
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("KPI Rating ID is required for deletion.")
            .Must(id => id != Guid.Empty)
            .WithMessage("KPI Rating ID must be a valid, non-empty GUID.");
    }
}
