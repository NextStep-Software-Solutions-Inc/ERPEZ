using FluentValidation;
using ERPEZ.Domain.Constants;

namespace ERPEZ.Application.Features.Planning.FiscalYear.Commands.UpdateFiscalYear;

public class UpdateFiscalYearCommandValidator : AbstractValidator<UpdateFiscalYearCommand>
{
    public UpdateFiscalYearCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty().WithMessage("Id is required.");
        RuleFor(x => x.FunctionAllocations)
            .Must(list => !list.Any() || Math.Abs(list.Sum(i => i.Percentage) - 100m) < 0.0001m)
            .WithMessage("Total percentage of function allocations must equal 100%.")
            .Must(list => !list.Any() || list.Select(a => a.FunctionType).Distinct().Count() == list.Count)
            .WithMessage("Function types must be unique.")
            .Must(list => !list.Any() || list.Any(a => a.FunctionType == "Mandatory Support" && a.Percentage > 0))
            .WithMessage("Mandatory Support function type is required and must have a percentage greater than 0.");

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
