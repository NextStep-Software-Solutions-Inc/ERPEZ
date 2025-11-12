using FluentValidation;

namespace ERPEZ.Application.Features.Planning.FiscalYear.Commands.DeleteFiscalYear;

public class DeleteFiscalYearCommandValidator : AbstractValidator<DeleteFiscalYearCommand>
{
    public DeleteFiscalYearCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty().WithMessage("Id is required.");
    }
}
