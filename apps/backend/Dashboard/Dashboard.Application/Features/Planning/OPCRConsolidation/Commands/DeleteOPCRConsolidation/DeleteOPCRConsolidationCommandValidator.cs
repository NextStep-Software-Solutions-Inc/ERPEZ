using FluentValidation;

namespace ERPEZ.Application.Features.Planning.OPCRConsolidation.Commands.DeleteOPCRConsolidation;

public class DeleteOPCRConsolidationCommandValidator : AbstractValidator<DeleteOPCRConsolidationCommand>
{
    public DeleteOPCRConsolidationCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("OPCR Consolidation ID is required.");
    }
}