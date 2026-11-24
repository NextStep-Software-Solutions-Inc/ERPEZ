using FluentValidation;

namespace ERPEZ.Application.Features.Planning.GeneralRatingScale.Commands.DeleteGeneralRatingScale;

public class DeleteGeneralRatingScaleCommandValidator : AbstractValidator<DeleteGeneralRatingScaleCommand>
{
    public DeleteGeneralRatingScaleCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("General Rating Scale Id is required.");
    }
}
