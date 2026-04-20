using FluentValidation;

namespace ERPEZ.Application.Features.Planning.NonCSEItem.Commands.DeleteNonCSEItem;

public class DeleteNonCSEItemCommandValidator : AbstractValidator<DeleteNonCSEItemCommand>
{
    public DeleteNonCSEItemCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Non-CSE Item ID is required.");
    }
}
