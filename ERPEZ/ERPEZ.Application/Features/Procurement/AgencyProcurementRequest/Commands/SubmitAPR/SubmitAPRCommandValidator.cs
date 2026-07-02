using FluentValidation;

namespace ERPEZ.Application.Planning.APRs.Commands.SubmitAPR;

public class SubmitAPRCommandValidator : AbstractValidator<SubmitAPRCommand>
{
    public SubmitAPRCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("APR Id is required.");
    }
}
