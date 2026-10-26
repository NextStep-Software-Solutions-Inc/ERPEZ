using FluentValidation;

namespace ERPEZ.Application.Features.Procurement.Contracts.Commands.CancelContract;

public class CancelContractCommandValidator : AbstractValidator<CancelContractCommand>
{
    public CancelContractCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Contract ID is required.");
    }
}
