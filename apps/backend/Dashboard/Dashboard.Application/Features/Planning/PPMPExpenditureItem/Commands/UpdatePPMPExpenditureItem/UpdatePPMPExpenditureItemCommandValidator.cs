using FluentValidation;

namespace ERPEZ.Application.Features.Planning.PPMPExpenditureItem.Commands.UpdatePPMPExpenditureItem;

public class UpdatePPMPExpenditureItemCommandValidator : AbstractValidator<UpdatePPMPExpenditureItemCommand>
{
    public UpdatePPMPExpenditureItemCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("PPMP Expenditure Item ID is required.");

        RuleFor(x => x.TotalCost)
            .GreaterThanOrEqualTo(0)
            .When(x => x.TotalCost.HasValue)
            .WithMessage("Total Cost must be greater than or equal to 0.");
    }
}
