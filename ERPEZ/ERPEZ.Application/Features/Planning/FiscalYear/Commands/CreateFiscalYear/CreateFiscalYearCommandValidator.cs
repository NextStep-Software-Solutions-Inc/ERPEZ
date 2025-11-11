using FluentValidation;
using ERPEZ.Application.Features.Planning.FiscalYear.Commands.CreateFiscalYear;
using ERPEZ.Application.Common.Constants;

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
            .WithMessage("Total percentage of function allocations must equal 100%.")
            .Must(list => list.Select(a => a.FunctionType).Distinct().Count() == list.Count)
            .WithMessage("Function types must be unique.");

        RuleForEach(x => x.FunctionAllocations).ChildRules(f =>
        {
            f.RuleFor(a => a.FunctionType)
                .NotEmpty().WithMessage("FunctionType is required.")
                .Must(type => FunctionTypeConstants.validFunctionTypes.Contains(type))
                .WithMessage($"FunctionType must be one of: {string.Join(", ", FunctionTypeConstants.validFunctionTypes)}.");
            f.RuleFor(a => a.Percentage).GreaterThan(0).WithMessage("Percentage must be greater than zero.");
        });
    }
}
