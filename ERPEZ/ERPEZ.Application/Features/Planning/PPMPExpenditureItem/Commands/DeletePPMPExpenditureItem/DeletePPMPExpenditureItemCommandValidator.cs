using FluentValidation;

namespace ERPEZ.Application.Features.Planning.PPMPExpenditureItem.Commands.DeletePPMPExpenditureItem;

public class DeletePPMPExpenditureItemCommandValidator : AbstractValidator<DeletePPMPExpenditureItemCommand>
{
    public DeletePPMPExpenditureItemCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("PPMP Expenditure Item ID is required.");
    }
}
