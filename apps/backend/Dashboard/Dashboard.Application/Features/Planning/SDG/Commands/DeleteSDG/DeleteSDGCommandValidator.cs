using FluentValidation;

namespace ERPEZ.Application.Features.Planning.SDG.Commands.DeleteSDG;

public class DeleteSDGCommandValidator : AbstractValidator<DeleteSDGCommand>
{
    public DeleteSDGCommandValidator()
    {
        RuleFor(p => p.Id)
            .NotEmpty().WithMessage("{PropertyName} is required.");
    }
}
