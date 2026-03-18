using FluentValidation;

namespace ERPEZ.Application.Features.Planning.RatingScaleTemplate.Commands.DeleteRatingScaleTemplate;

public class DeleteRatingScaleTemplateCommandValidator : AbstractValidator<DeleteRatingScaleTemplateCommand>
{
    public DeleteRatingScaleTemplateCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Rating Scale Template ID is required.");
    }
}
