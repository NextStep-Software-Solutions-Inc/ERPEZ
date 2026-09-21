using FluentValidation;

namespace ERPEZ.Application.Features.Procurement.Contracts.Commands.UpdateContract;

public class UpdateContractCommandValidator : AbstractValidator<UpdateContractCommand>
{
    public UpdateContractCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Contract ID is required.");

        RuleFor(x => x.Description)
            .MaximumLength(2000).WithMessage("Description cannot exceed 2000 characters.");

        RuleFor(x => x.ContractNumber)
            .MaximumLength(100).WithMessage("Contract number cannot exceed 100 characters.");
    }
}
