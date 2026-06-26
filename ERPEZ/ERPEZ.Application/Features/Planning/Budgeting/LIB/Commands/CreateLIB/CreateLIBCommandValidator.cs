using ERPEZ.Application.Features.Planning.Budgeting.Common.Enums;
using FluentValidation;

namespace ERPEZ.Application.Features.Planning.Budgeting.LIB.Commands.CreateLIB;

public class CreateLIBCommandValidator : AbstractValidator<CreateLIBCommand>
{
    public CreateLIBCommandValidator()
    {
        RuleFor(x => x.Request.FiscalYearId)
            .NotEmpty()
            .WithMessage("{PropertyName} is required.");
        RuleFor(x => x.Request.FundSourceId)
            .NotEmpty()
            .WithMessage("{PropertyName} is required.");
        RuleFor(x => x.Request.OfficeId)
            .NotEmpty()
            .WithMessage("{PropertyName} is required.");
        RuleFor(x => x.Request.Name)
            .NotEmpty()
            .WithMessage("{PropertyName} is required.")
            .MaximumLength(500)
            .WithMessage("{PropertyName} must not exceed 500c characters.");
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
        RuleFor(x => x.Request.TotalAmount)
            .GreaterThanOrEqualTo(0)
            .WithMessage("{PropertyName} must be greater than or equal to 0.")
            .When(x => x.Request.TotalAmount.HasValue);
    }
}



