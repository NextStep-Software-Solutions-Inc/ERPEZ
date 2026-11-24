using FluentValidation;

namespace ERPEZ.Application.Features.Procurement.Contracts.Commands.ReturnContract;

public class ReturnContractCommandValidator : AbstractValidator<ReturnContractCommand>
{
    public ReturnContractCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Contract ID is required.");

        RuleFor(x => x.Remarks)
            .NotEmpty().WithMessage("Remarks are required when returning a contract.")
            .MinimumLength(10).WithMessage("Return remarks must be at least 10 characters.")
            .MaximumLength(2000).WithMessage("Return remarks cannot exceed 2000 characters.");
    }
}
