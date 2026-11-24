using FluentValidation;

namespace ERPEZ.Application.Features.Planning.FiscalYear.Commands.CreateFiscalYear;

public class CreateFiscalYearCommandValidator : AbstractValidator<CreateFiscalYearCommand>
{
    public CreateFiscalYearCommandValidator()
    {
        RuleFor(x => x.Year)
            .GreaterThan(0)
            .WithMessage("Year must be a positive integer.");

        RuleFor(x => x)
            .Must(x => !x.StartDate.HasValue || !x.EndDate.HasValue || x.EndDate.Value >= x.StartDate.Value)
            .WithMessage("End date must be greater than or equal to start date.")
            .When(x => x.StartDate.HasValue && x.EndDate.HasValue);
    }
}
