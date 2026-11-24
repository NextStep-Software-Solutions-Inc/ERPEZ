using FluentValidation;

namespace ERPEZ.Application.Features.Planning.PPMPExpenditureItem.Commands.CreatePPMPExpenditureItem;

public class CreatePPMPExpenditureItemCommandValidator : AbstractValidator<CreatePPMPExpenditureItemCommand>
{
    public CreatePPMPExpenditureItemCommandValidator()
    {
        RuleFor(x => x.PPMPId)
            .NotEmpty()
            .WithMessage("PPMP ID is required.");
    }
}