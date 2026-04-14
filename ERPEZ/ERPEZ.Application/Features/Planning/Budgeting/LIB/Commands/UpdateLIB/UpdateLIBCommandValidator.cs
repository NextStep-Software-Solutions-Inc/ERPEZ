using FluentValidation;

namespace ERPEZ.Application.Features.Planning.Budgeting.LIB.Commands.UpdateLIB;

public class UpdateLIBCommandValidator : AbstractValidator<UpdateLIBCommand>
{
    public UpdateLIBCommandValidator()
    {
        RuleFor(x => x.Request.Id)
            .NotEmpty()
            .WithMessage("{PropertyName} is required.");
        RuleFor(x => x.Request.FiscalYearId)
            .NotEmpty()
            .WithMessage("{PropertyName} is required.");
        RuleFor(x => x.Request.FundClusterId)
            .NotEmpty()
            .WithMessage("{PropertyName} is required.");
        RuleFor(x => x.Request.OfficeId)
            .NotEmpty()
            .WithMessage("{PropertyName} is required.");
        RuleFor(x => x.Request.DeliveryUnitId)
            .NotEmpty()
            .WithMessage("{PropertyName} is required.");
        RuleFor(x => x.Request.LIBNumber)
            .NotEmpty()
            .WithMessage("{PropertyName} is required.")
            .MaximumLength(100)
            .WithMessage("{PropertyName} must not exceed 100 characters.");
        RuleFor(x => x.Request.Name)
            .NotEmpty()
            .WithMessage("{PropertyName} is required.")
            .MaximumLength(500)
            .WithMessage("{PropertyName} must not exceed 500 characters.");
        RuleFor(x => x.Request.Scope)
            .NotEmpty()
            .WithMessage("{PropertyName} is required.")
            .MaximumLength(50)
            .WithMessage("{PropertyName} must not exceed 50 characters.");
        RuleFor(x => x.Request.Version)
            .GreaterThan(0)
            .WithMessage("{PropertyName} must be greater than 0.");
        RuleFor(x => x.Request.TotalAmount)
            .GreaterThanOrEqualTo(0)
            .WithMessage("{PropertyName} must be greater than or equal to 0.")
            .When(x => x.Request.TotalAmount.HasValue);
    }
}



