using FluentValidation;

namespace ERPEZ.Application.Features.Planning.OPCRItem.Commands.DeleteOPCRItem;

public class DeleteOPCRItemCommandValidator : AbstractValidator<DeleteOPCRItemCommand>
{
    public DeleteOPCRItemCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("OPCR Item ID is required.");
    }
}
