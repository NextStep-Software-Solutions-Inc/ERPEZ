using ERPEZ.Application.Features.Planning.Budgeting.Common.Enums;
using FluentValidation;

namespace ERPEZ.Application.Features.Planning.Budgeting.LIB.Commands.CreateLIB;

public class CreateLIBCommandValidator : AbstractValidator<CreateLIBCommand>
{
    public CreateLIBCommandValidator()
    {
        // FiscalYearId is only required up-front for OPCR-sourced LIBs (OPCR is
        // always single-year). For WFP-sourced LIBs, FiscalYearId is derived by
        // the handler from the WFP's own ProjectStartDate/ProjectEndDate
        // (left null for multi-year projects) — so it's not required here.
        RuleFor(x => x.Request.FiscalYearId)
            .NotEmpty()
            .WithMessage("FiscalYearId is required for OPCR-sourced LIBs.")
            .When(x => x.Request.SourceType.Equals("OPCR", StringComparison.OrdinalIgnoreCase));

        // At least one of AgencyMasterBudgetId (top-down) or FundSourceId (bottom-up) must be provided.
        RuleFor(x => x.Request)
            .Must(r => r.AgencyMasterBudgetId.HasValue || r.FundSourceId.HasValue)
            .WithMessage("Either AgencyMasterBudgetId or FundSourceId must be provided.");

        RuleFor(x => x.Request.OfficeId)
            .NotEmpty()
            .WithMessage("{PropertyName} is required.");
        RuleFor(x => x.Request.Name)
            .NotEmpty()
            .WithMessage("{PropertyName} is required.")
            .MaximumLength(500)
            .WithMessage("{PropertyName} must not exceed 500 characters.");
        RuleFor(x => x.Request.Scope)
            .NotEmpty()
            .WithMessage("{PropertyName} is required.")
            .Must(v => Enum.TryParse<LIBScopeEnum>(v, true, out _))
            .WithMessage("{PropertyName} must be a valid value (Activity or Project).");
        RuleFor(x => x.Request.Level)
            .NotEmpty()
            .WithMessage("{PropertyName} is required.")
            .Must(v => Enum.TryParse<LIBLevelEnum>(v, true, out _))
            .WithMessage("{PropertyName} must be a valid value (Office or Department).");
        RuleFor(x => x.Request.SourceType)
            .NotEmpty()
            .WithMessage("{PropertyName} is required.")
            .Must(v => Enum.TryParse<LIBSourceTypeEnum>(v, true, out _))
            .WithMessage("{PropertyName} must be a valid value (OPCR or WFP).");
    }
}




