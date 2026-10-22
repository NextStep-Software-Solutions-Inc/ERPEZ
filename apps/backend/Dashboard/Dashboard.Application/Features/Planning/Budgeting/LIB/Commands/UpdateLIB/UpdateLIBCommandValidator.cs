using ERPEZ.Application.Features.Planning.Budgeting.Common.Enums;
using FluentValidation;

namespace ERPEZ.Application.Features.Planning.Budgeting.LIB.Commands.UpdateLIB;

public class UpdateLIBCommandValidator : AbstractValidator<UpdateLIBCommand>
{
    public UpdateLIBCommandValidator()
    {
        RuleFor(x => x.Request.FiscalYearId)
            .NotEmpty()
            .WithMessage("{PropertyName} is required.")
            .When(x => x.Request.FiscalYearId.HasValue);

        RuleFor(x => x.Request.FundSourceId)
            .NotEmpty()
            .WithMessage("{PropertyName} is required.")
            .When(x => x.Request.FundSourceId.HasValue);

        RuleFor(x => x.Request.OfficeId)
            .NotEmpty()
            .WithMessage("{PropertyName} is required.")
            .When(x => x.Request.OfficeId.HasValue);

        RuleFor(x => x.Request.LIBNumber)
            .NotEmpty()
            .WithMessage("{PropertyName} is required.")
            .MaximumLength(100)
            .WithMessage("{PropertyName} must not exceed 100 characters.")
            .When(x => x.Request.LIBNumber is not null);

        RuleFor(x => x.Request.Name)
            .NotEmpty()
            .WithMessage("{PropertyName} is required.")
            .MaximumLength(500)
            .WithMessage("{PropertyName} must not exceed 500 characters.")
            .When(x => x.Request.Name is not null);

        RuleFor(x => x.Request.Scope)
            .NotEmpty()
            .WithMessage("{PropertyName} is required.")
            .Must(v => Enum.TryParse<LIBScopeEnum>(v, true, out _))
            .WithMessage("{PropertyName} must be a valid value (Activity or Project).")
            .When(x => x.Request.Scope is not null);

        RuleFor(x => x.Request.Level)
            .NotEmpty()
            .WithMessage("{PropertyName} is required.")
            .Must(v => Enum.TryParse<LIBLevelEnum>(v, true, out _))
            .WithMessage("{PropertyName} must be a valid value (Office or Department).")
            .When(x => x.Request.Level is not null);

        RuleFor(x => x.Request.SourceType)
            .NotEmpty()
            .WithMessage("{PropertyName} is required.")
            .Must(v => Enum.TryParse<LIBSourceTypeEnum>(v, true, out _))
            .WithMessage("{PropertyName} must be a valid value (OPCR or WFP).")
            .When(x => x.Request.SourceType is not null);

        RuleFor(x => x.Request.TotalAmount)
            .GreaterThanOrEqualTo(0)
            .WithMessage("{PropertyName} must be greater than or equal to 0.")
            .When(x => x.Request.TotalAmount.HasValue);
    }
}