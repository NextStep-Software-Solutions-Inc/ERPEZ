using FluentValidation;

namespace ERPEZ.Application.Features.Planning.FiscalYear.Commands.CreateFiscalYear;

public class CreateFiscalYearCommandValidator : AbstractValidator<CreateFiscalYearCommand>
{
    public CreateFiscalYearCommandValidator()
    {
        RuleFor(x => x.Year)
            .GreaterThan(0)
            .WithMessage("Year must be a positive integer.");
    }
}
