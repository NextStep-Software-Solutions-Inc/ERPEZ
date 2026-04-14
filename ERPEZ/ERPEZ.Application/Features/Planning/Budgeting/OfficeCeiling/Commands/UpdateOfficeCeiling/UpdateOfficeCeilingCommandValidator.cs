using FluentValidation;

namespace ERPEZ.Application.Features.Planning.Budgeting.OfficeCeiling.Commands.UpdateOfficeCeiling;

public class UpdateOfficeCeilingCommandValidator : AbstractValidator<UpdateOfficeCeilingCommand>
{
    public UpdateOfficeCeilingCommandValidator()
    {
        RuleFor(x => x.Request.Id)
            .NotEmpty()
            .WithMessage("{PropertyName} is required.");
        RuleFor(x => x.Request.FiscalYearId)
            .NotEmpty()
            .WithMessage("{PropertyName} is required.");
        RuleFor(x => x.Request.OfficeId)
            .NotEmpty()
            .WithMessage("{PropertyName} is required.");
        RuleFor(x => x.Request.AgencyMasterBudgetId)
            .NotEmpty()
            .WithMessage("{PropertyName} is required.");
        RuleFor(x => x.Request.PSAmount)
            .GreaterThanOrEqualTo(0)
            .WithMessage("{PropertyName} must be greater than or equal to 0.");
        RuleFor(x => x.Request.MOOEAmount)
            .GreaterThanOrEqualTo(0)
            .WithMessage("{PropertyName} must be greater than or equal to 0.");
        RuleFor(x => x.Request.COAmount).GreaterThanOrEqualTo(0).WithMessage("{PropertyName} must be greater than or equal to 0.");
    }
}



