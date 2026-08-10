using FluentValidation;

namespace ERPEZ.Application.Features.Planning.APP.Commands.CreateAPP;

public class CreateAPPCommandValidator : AbstractValidator<CreateAPPCommand>
{
    public CreateAPPCommandValidator()
    {
        RuleFor(x => x.APPNumber)
            .NotEmpty()
            .WithMessage("APP Number is required.")
            .MaximumLength(100)
            .WithMessage("APP Number cannot exceed 100 characters.");

        RuleFor(x => x.Name)
            .NotEmpty()
            .WithMessage("APP Name is required.")
            .MaximumLength(500)
            .WithMessage("APP Name cannot exceed 500 characters.");

        RuleFor(x => x.FiscalYearId)
            .NotEmpty()
            .WithMessage("Fiscal Year is required.");

        RuleFor(x => x.OfficeId)
            .NotEmpty()
            .WithMessage("Office is required.");

        RuleFor(x => x.IsFinal)
            .NotEmpty()
            .WithMessage("IsFinal status is required.")
            .MaximumLength(50)
            .WithMessage("IsFinal cannot exceed 50 characters.");

        RuleFor(x => x.Remarks)
            .MaximumLength(1000)
            .WithMessage("Remarks cannot exceed 1000 characters.")
            .When(x => !string.IsNullOrEmpty(x.Remarks));

        RuleFor(x => x.Description)
            .MaximumLength(1000)
            .WithMessage("Description cannot exceed 1000 characters.")
            .When(x => !string.IsNullOrEmpty(x.Description));
    }
}
