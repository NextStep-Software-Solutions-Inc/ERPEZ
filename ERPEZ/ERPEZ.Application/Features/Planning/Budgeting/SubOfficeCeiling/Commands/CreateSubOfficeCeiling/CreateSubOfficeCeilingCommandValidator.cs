using FluentValidation;

namespace ERPEZ.Application.Features.Planning.Budgeting.SubOfficeCeiling.Commands.CreateSubOfficeCeiling;

public class CreateSubOfficeCeilingCommandValidator : AbstractValidator<CreateSubOfficeCeilingCommand>
{
    public CreateSubOfficeCeilingCommandValidator()
    {
        RuleFor(x => x.Request.OfficeCeilingId)
            .NotEmpty()
            .WithMessage("{PropertyName} is required.");
        RuleFor(x => x.Request.SubOfficeId)
            .NotEmpty()
            .WithMessage("{PropertyName} is required.");
        RuleFor(x => x.Request.FundClusterId)
            .NotEmpty()
            .WithMessage("{PropertyName} is required.");
        RuleFor(x => x.Request.FiscalYearId)
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



