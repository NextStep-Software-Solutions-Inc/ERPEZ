using FluentValidation;

namespace ERPEZ.Application.Features.Planning.OPCRRating.Commands.UpdateOPCRRating;

public class UpdateOPCRRatingCommandValidator : AbstractValidator<UpdateOPCRRatingCommand>
{
    public UpdateOPCRRatingCommandValidator()
    {
        // Primary ID Validation (Crucial for updates)
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("OPCR Rating ID is required for update.")
            .Must(id => id != Guid.Empty)
            .WithMessage("OPCR Rating ID must be a valid, non-empty GUID.");

        // NumericalRating (Optional Int?, Range Check if present)
        RuleFor(x => x.UpdateOPCRRating.NumericalRating)
            .InclusiveBetween(1, 5)
            .WithMessage("Numerical Rating must be between 1 and 5 if provided.")
            .When(x => x.UpdateOPCRRating.NumericalRating.HasValue);

        // Remarks (Optional String?, Max Length if present)
        RuleFor(x => x.UpdateOPCRRating.Remarks)
            .MaximumLength(1000)
            .WithMessage("Remarks cannot exceed 1000 characters.")
            .When(x => x.UpdateOPCRRating.Remarks is not null); 
    }
}
