using FluentValidation;

namespace ERPEZ.Application.Features.Procurement.Contracts.Commands.ApproveContract;

public class ApproveContractCommandValidator : AbstractValidator<ApproveContractCommand>
{
    public ApproveContractCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Contract ID is required.");

        RuleFor(x => x.Remarks)
            .MaximumLength(2000).WithMessage("Remarks cannot exceed 2000 characters.");
    }
}
