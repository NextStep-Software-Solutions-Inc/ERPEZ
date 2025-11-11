using FluentValidation;
using ERPEZ.Application.Features.Planning.FiscalYear.Commands.CreateFiscalYear;

namespace ERPEZ.Application.Features.Planning.FiscalYear.Commands.CreateFiscalYear;

public class CreateFiscalYearCommandValidator : AbstractValidator<CreateFiscalYearCommand>
{
    public CreateFiscalYearCommandValidator()
    {
        RuleFor(x => x.Year)
            .GreaterThan(0)
            .WithMessage("Year must be a positive integer.");

        RuleFor(x => x.FunctionAllocations)
            .NotEmpty().WithMessage("At least one function allocation is required.")
            .Must(list => Math.Abs(list.Sum(i => i.Percentage) - 100m) < 0.0001m)
            .WithMessage("Total percentage of function allocations must equal 100%.");

        RuleForEach(x => x.FunctionAllocations).ChildRules(f =>
        {
            f.RuleFor(a => a.FunctionType).NotEmpty().WithMessage("FunctionType is required.");
            f.RuleFor(a => a.Percentage).GreaterThan(0).WithMessage("Percentage must be greater than zero.");
        });
    }
}
