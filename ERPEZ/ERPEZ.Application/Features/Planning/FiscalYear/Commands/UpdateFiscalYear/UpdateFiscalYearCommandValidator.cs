using FluentValidation;
using ERPEZ.Domain.Constants;

namespace ERPEZ.Application.Features.Planning.FiscalYear.Commands.UpdateFiscalYear;

public class UpdateFiscalYearCommandValidator : AbstractValidator<UpdateFiscalYearCommand>
{
    public UpdateFiscalYearCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty().WithMessage("Id is required.");
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
