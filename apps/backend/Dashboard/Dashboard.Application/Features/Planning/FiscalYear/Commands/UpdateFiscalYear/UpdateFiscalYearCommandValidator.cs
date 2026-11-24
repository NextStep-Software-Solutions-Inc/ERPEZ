using FluentValidation;

namespace ERPEZ.Application.Features.Planning.FiscalYear.Commands.UpdateFiscalYear;

public class UpdateFiscalYearCommandValidator : AbstractValidator<UpdateFiscalYearCommand>
{
    public UpdateFiscalYearCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Id is required.");
        
        RuleFor(x => x.Year)
            .GreaterThan(1900)
            .WithMessage("Year must be greater than 1900.")
            .LessThanOrEqualTo(2100)
            .WithMessage("Year must be less than or equal to 2100.")
            .When(x => x.Year.HasValue);

        RuleFor(x => x)
            .Must(x => !x.StartDate.HasValue || !x.EndDate.HasValue || x.EndDate.Value >= x.StartDate.Value)
            .WithMessage("End date must be greater than or equal to start date.")
            .When(x => x.StartDate.HasValue && x.EndDate.HasValue);
    }
}
