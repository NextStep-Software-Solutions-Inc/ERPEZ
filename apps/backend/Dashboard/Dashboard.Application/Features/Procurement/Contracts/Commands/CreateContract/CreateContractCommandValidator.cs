using FluentValidation;

namespace ERPEZ.Application.Features.Procurement.Contracts.Commands.CreateContract;

public class CreateContractCommandValidator : AbstractValidator<CreateContractCommand>
{
    public CreateContractCommandValidator()
    {
        RuleFor(x => x.NoticeOfAwardId)
            .NotEmpty().WithMessage("Notice of Award is required.");

        RuleFor(x => x.Description)
            .MaximumLength(2000).WithMessage("Description cannot exceed 2000 characters.");

        RuleFor(x => x.ContractNumber)
            .MaximumLength(100).WithMessage("Contract number cannot exceed 100 characters.");
    }
}
