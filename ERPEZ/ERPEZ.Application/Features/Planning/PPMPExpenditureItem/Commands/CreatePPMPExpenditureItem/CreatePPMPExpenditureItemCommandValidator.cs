using FluentValidation;

namespace ERPEZ.Application.Features.Planning.PPMPExpenditureItem.Commands.CreatePPMPExpenditureItem;

public class CreatePPMPExpenditureItemCommandValidator : AbstractValidator<CreatePPMPExpenditureItemCommand>
{
    public CreatePPMPExpenditureItemCommandValidator()
    {
        RuleFor(x => x.PPMPActivityId)
            .NotEmpty()
            .WithMessage("PPMP Activity ID is required.");

        RuleFor(x => x.TotalCost)
            .GreaterThanOrEqualTo(0)
            .WithMessage("Total Cost must be greater than or equal to 0.");
    }
}
