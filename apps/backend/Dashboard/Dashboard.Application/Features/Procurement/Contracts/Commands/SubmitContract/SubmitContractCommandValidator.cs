using FluentValidation;

namespace ERPEZ.Application.Features.Procurement.Contracts.Commands.SubmitContract;

public class SubmitContractCommandValidator : AbstractValidator<SubmitContractCommand>
{
    public SubmitContractCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Contract ID is required.");
    }
}
