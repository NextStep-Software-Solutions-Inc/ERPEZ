using FluentValidation;

namespace ERPEZ.Application.Features.Planning.OPCRItemMOV.Commands.DeleteOPCRItemMOV;

public class DeleteOPCRItemMOVCommandValidator : AbstractValidator<DeleteOPCRItemMOVCommand>
{
    public DeleteOPCRItemMOVCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("OPCR Item MOV ID is required.");
    }
}
