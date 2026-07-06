using FluentValidation;

namespace ERPEZ.Application.Features.Procurement.DirectContractings.Commands.DeleteDirectContracting;

public class DeleteDirectContractingCommandValidator : AbstractValidator<DeleteDirectContractingCommand>
{
    public DeleteDirectContractingCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Direct Contracting Request ID is required.");
    }
}
