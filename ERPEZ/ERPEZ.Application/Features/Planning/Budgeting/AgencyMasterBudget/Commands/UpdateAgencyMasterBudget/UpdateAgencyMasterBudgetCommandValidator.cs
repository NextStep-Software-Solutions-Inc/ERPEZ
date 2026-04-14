using FluentValidation;
using ERPEZ.Application.Features.Planning.Budgeting.Common.Enums;

namespace ERPEZ.Application.Features.Planning.Budgeting.AgencyMasterBudget.Commands.UpdateAgencyMasterBudget;

public class UpdateAgencyMasterBudgetCommandValidator : AbstractValidator<UpdateAgencyMasterBudgetCommand>
{
    public UpdateAgencyMasterBudgetCommandValidator()
    {
        RuleFor(x => x.Request.Id)
        .NotEmpty()
        .WithMessage("{PropertyName} is required.");

        RuleFor(x => x.Request.FiscalYearId)
            .NotEmpty()
            .WithMessage("{PropertyName} is required.");

        RuleFor(x => x.Request.FundSourceId)
            .NotEmpty()
            .WithMessage("{PropertyName} is required.");

        RuleFor(x => x.Request.SourceDocumentType)
            .NotEmpty()
            .WithMessage("{PropertyName} is required.")
            .Must(value => Enum.TryParse<SourceDocumentTypeEnum>(value, true, out _))
            .WithMessage("{PropertyName} must be a valid SourceDocumentTypeEnum value.");

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



