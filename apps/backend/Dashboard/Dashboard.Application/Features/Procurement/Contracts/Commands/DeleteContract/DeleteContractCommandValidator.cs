using FluentValidation;

namespace ERPEZ.Application.Features.Procurement.Contracts.Commands.DeleteContract;

public class DeleteContractCommandValidator : AbstractValidator<DeleteContractCommand>
{
    public DeleteContractCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Contract ID is required.");
    }
}
