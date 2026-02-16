using FluentValidation;

namespace ERPEZ.Application.Features.Planning.ProcurementPolicyConfig.Commands.DeleteProcurementPolicyConfig;

public class DeleteProcurementPolicyConfigCommandValidator : AbstractValidator<DeleteProcurementPolicyConfigCommand>
{
    public DeleteProcurementPolicyConfigCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Procurement Policy Configuration Id is required.");
    }
}
