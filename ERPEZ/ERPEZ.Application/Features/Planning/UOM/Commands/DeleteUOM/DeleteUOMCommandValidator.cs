using FluentValidation;

namespace ERPEZ.Application.Features.Planning.UOM.Commands.DeleteUOM;

public class DeleteUOMCommandValidator : AbstractValidator<DeleteUOMCommand>
{
    public DeleteUOMCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("UOM ID is required for deletion.");
    }
}
