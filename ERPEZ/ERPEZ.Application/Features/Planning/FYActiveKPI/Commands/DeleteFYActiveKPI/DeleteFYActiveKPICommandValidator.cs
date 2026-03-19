using FluentValidation;

namespace ERPEZ.Application.Features.Planning.FYActiveKPI.Commands.DeleteFYActiveKPI;

public class DeleteFYActiveKPICommandValidator : AbstractValidator<DeleteFYActiveKPICommand>
{
    public DeleteFYActiveKPICommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("FY Active KPI ID is required.");
    }
}
