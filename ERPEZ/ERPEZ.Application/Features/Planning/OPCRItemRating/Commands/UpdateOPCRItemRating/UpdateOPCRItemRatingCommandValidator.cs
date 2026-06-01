using FluentValidation;

namespace ERPEZ.Application.Features.Planning.OPCRItemRating.Commands.UpdateOPCRItemRating;

public class UpdateOPCRItemRatingCommandValidator : AbstractValidator<UpdateOPCRItemRatingCommand>
{
    public UpdateOPCRItemRatingCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("OPCR Item Rating ID is required.");

        RuleFor(x => x.UpdateOPCRItemRating.SelfRating)
            .InclusiveBetween(0, 5)
            .WithMessage("Self Rating must be between 0 and 5.")
            .When(x => x.UpdateOPCRItemRating.SelfRating.HasValue);

        RuleFor(x => x.UpdateOPCRItemRating.PMTRating)
            .InclusiveBetween(0, 5)
            .WithMessage("PMT Rating must be between 0 and 5.")
            .When(x => x.UpdateOPCRItemRating.PMTRating.HasValue);

        RuleFor(x => x.UpdateOPCRItemRating.PMTRemark)
            .MaximumLength(1000)
            .WithMessage("PMT Remark cannot exceed 1000 characters.")
            .When(x => !string.IsNullOrEmpty(x.UpdateOPCRItemRating.PMTRemark));
    }
}