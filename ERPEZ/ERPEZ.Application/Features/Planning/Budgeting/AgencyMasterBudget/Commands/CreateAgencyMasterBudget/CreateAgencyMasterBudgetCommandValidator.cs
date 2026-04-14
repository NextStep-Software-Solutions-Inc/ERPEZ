using FluentValidation;

namespace ERPEZ.Application.Features.Planning.Budgeting.AgencyMasterBudget.Commands.CreateAgencyMasterBudget;

public class CreateAgencyMasterBudgetCommandValidator : AbstractValidator<CreateAgencyMasterBudgetCommand>
{
    public CreateAgencyMasterBudgetCommandValidator()
    {
        RuleFor(x => x.Request.FiscalYearId)
            .NotEmpty()
            .WithMessage("{PropertyName} is required.");

        RuleFor(x => x.Request.FundClusterId)
            .NotEmpty()
            .WithMessage("{PropertyName} is required.");

        RuleFor(x => x.Request.PSAmount)
            .GreaterThanOrEqualTo(0)
            .WithMessage("{PropertyName} must be greater than or equal to 0.");

        RuleFor(x => x.Request.MOOEAmount)
            .GreaterThanOrEqualTo(0)
            .WithMessage("{PropertyName} must be greater than or equal to 0.");
            
        RuleFor(x => x.Request.COAmount)
            .GreaterThanOrEqualTo(0)
            .WithMessage("{PropertyName} must be greater than or equal to 0.");
    }
}



