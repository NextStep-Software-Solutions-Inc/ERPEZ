using FluentValidation;

namespace ERPEZ.Application.Features.Planning.OPCRItem.Commands.UpdateOPCRItem;

public class UpdateOPCRItemCommandValidator : AbstractValidator<UpdateOPCRItemCommand>
{
    public UpdateOPCRItemCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("OPCR Item ID is required for update.");

        RuleFor(x => x.UpdateOPCRItem.OPCRId)
            .NotEmpty()
            .When(x => x.UpdateOPCRItem.OPCRId.HasValue)
            .WithMessage("OPCR ID must be a valid value.");

        RuleFor(x => x.UpdateOPCRItem.KPIAssignmentId)
            .NotEmpty()
            .When(x => x.UpdateOPCRItem.KPIAssignmentId.HasValue)
            .WithMessage("KPI Assignment ID must be a valid value.");

        RuleFor(x => x.UpdateOPCRItem.Q1Target)
            .GreaterThanOrEqualTo(0)
            .When(x => x.UpdateOPCRItem.Q1Target.HasValue)
            .WithMessage("Q1 target must be greater than or equal to 0.");

        RuleFor(x => x.UpdateOPCRItem.Q2Target)
            .GreaterThanOrEqualTo(0)
            .When(x => x.UpdateOPCRItem.Q2Target.HasValue)
            .WithMessage("Q2 target must be greater than or equal to 0.");

        RuleFor(x => x.UpdateOPCRItem.Q3Target)
            .GreaterThanOrEqualTo(0)
            .When(x => x.UpdateOPCRItem.Q3Target.HasValue)
            .WithMessage("Q3 target must be greater than or equal to 0.");

        RuleFor(x => x.UpdateOPCRItem.Q4Target)
            .GreaterThanOrEqualTo(0)
            .When(x => x.UpdateOPCRItem.Q4Target.HasValue)
            .WithMessage("Q4 target must be greater than or equal to 0.");
    }
}
