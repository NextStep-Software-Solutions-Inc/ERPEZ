using FluentValidation;

namespace ERPEZ.Application.Features.Planning.NonCSEItem.Commands.UpdateNonCSEItemStatus;

public class UpdateNonCSEItemStatusCommandValidator : AbstractValidator<UpdateNonCSEItemStatusCommand>
{
    public UpdateNonCSEItemStatusCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Non-CSE Item ID is required.");
    }
}
