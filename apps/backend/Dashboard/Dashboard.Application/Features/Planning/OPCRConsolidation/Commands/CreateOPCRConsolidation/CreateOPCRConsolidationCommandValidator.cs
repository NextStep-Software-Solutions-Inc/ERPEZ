using FluentValidation;

namespace ERPEZ.Application.Features.Planning.OPCRConsolidation.Commands.CreateOPCRConsolidation;

public class CreateOPCRConsolidationCommandValidator : AbstractValidator<CreateOPCRConsolidationCommand>
{
    public CreateOPCRConsolidationCommandValidator()
    {
        RuleFor(x => x.Request.OpcrIds)
            .NotEmpty()
            .WithMessage("At least one OPCR Id is required.");

        RuleFor(x => x.Request.OpcrIds)
            .Must(ids => ids.Distinct().Count() == ids.Count)
            .WithMessage("Duplicate OPCR Ids are not allowed.")
            .When(x => x.Request.OpcrIds is { Count: > 0 });

        RuleFor(x => x.Request.OpcrIds)
            .Must(ids => ids.Count >= 2)
            .WithMessage("At least two OPCRs are required for consolidation.")
            .When(x => x.Request.OpcrIds is { Count: > 0 });
    }
}