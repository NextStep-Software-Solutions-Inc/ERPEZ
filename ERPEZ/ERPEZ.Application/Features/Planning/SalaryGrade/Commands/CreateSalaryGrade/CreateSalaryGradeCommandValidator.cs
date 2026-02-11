using FluentValidation;

namespace ERPEZ.Application.Features.Planning.SalaryGrade.Commands.CreateSalaryGrade;

public class CreateSalaryGradeCommandValidator : AbstractValidator<CreateSalaryGradeCommand>
{
    public CreateSalaryGradeCommandValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty()
            .WithMessage("Name is required.")
            .MaximumLength(200)
            .WithMessage("Name cannot exceed 200 characters.");

        RuleFor(x => x.Code)
            .NotEmpty()
            .WithMessage("Code is required.")
            .MaximumLength(50)
            .WithMessage("Code cannot exceed 50 characters.");

        RuleFor(x => x.GradeNumber)
            .GreaterThan(0)
            .WithMessage("Grade Number must be greater than 0.");

        RuleFor(x => x.NumberOfSteps)
            .GreaterThan(0)
            .WithMessage("Number of Steps must be greater than 0.");

        RuleFor(x => x.StepIncrementAmount)
            .GreaterThan(0)
            .WithMessage("Step Increment Amount must be greater than 0.")
            .When(x => x.StepIncrementAmount.HasValue);

        RuleFor(x => x.EffectiveDate)
            .NotEmpty()
            .WithMessage("Effective Date is required.");
    }
}
