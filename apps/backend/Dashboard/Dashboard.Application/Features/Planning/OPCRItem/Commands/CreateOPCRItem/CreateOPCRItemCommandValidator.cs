using FluentValidation;

namespace ERPEZ.Application.Features.Planning.OPCRItem.Commands.CreateOPCRItem;

public class CreateOPCRItemCommandValidator : AbstractValidator<CreateOPCRItemCommand>
{
    public CreateOPCRItemCommandValidator()
    {
        RuleFor(x => x.OPCRId)
            .NotEmpty()
            .WithMessage("OPCR ID is required.");

        RuleFor(x => x.KPIAssignmentId)
            .NotEmpty()
            .WithMessage("KPI Assignment ID is required.");

        RuleFor(x => x.Q1Target)
            .GreaterThanOrEqualTo(0)
            .When(x => x.Q1Target.HasValue)
            .WithMessage("Q1 target must be greater than or equal to 0.");

        RuleFor(x => x.Q2Target)
            .GreaterThanOrEqualTo(0)
            .When(x => x.Q2Target.HasValue)
            .WithMessage("Q2 target must be greater than or equal to 0.");

        RuleFor(x => x.Q3Target)
            .GreaterThanOrEqualTo(0)
            .When(x => x.Q3Target.HasValue)
            .WithMessage("Q3 target must be greater than or equal to 0.");

        RuleFor(x => x.Q4Target)
            .GreaterThanOrEqualTo(0)
            .When(x => x.Q4Target.HasValue)
            .WithMessage("Q4 target must be greater than or equal to 0.");
    }
}
