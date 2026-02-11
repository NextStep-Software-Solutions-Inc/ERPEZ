using FluentValidation;

namespace ERPEZ.Application.Features.Planning.SalaryGrade.Commands.UpdateSalaryGrade;

public class UpdateSalaryGradeCommandValidator : AbstractValidator<UpdateSalaryGradeCommand>
{
    public UpdateSalaryGradeCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Id is required.");

        RuleFor(x => x.UpdateSalaryGrade.Name)
            .MaximumLength(200)
            .WithMessage("Name cannot exceed 200 characters.")
            .When(x => !string.IsNullOrWhiteSpace(x.UpdateSalaryGrade.Name));

        RuleFor(x => x.UpdateSalaryGrade.Code)
            .MaximumLength(50)
            .WithMessage("Code cannot exceed 50 characters.")
            .When(x => !string.IsNullOrWhiteSpace(x.UpdateSalaryGrade.Code));

        RuleFor(x => x.UpdateSalaryGrade.GradeNumber)
            .GreaterThan(0)
            .WithMessage("Grade Number must be greater than 0.")
            .When(x => x.UpdateSalaryGrade.GradeNumber.HasValue);

        RuleFor(x => x.UpdateSalaryGrade.NumberOfSteps)
            .GreaterThan(0)
            .WithMessage("Number of Steps must be greater than 0.")
            .When(x => x.UpdateSalaryGrade.NumberOfSteps.HasValue);

        RuleFor(x => x.UpdateSalaryGrade.StepIncrementAmount)
            .GreaterThan(0)
            .WithMessage("Step Increment Amount must be greater than 0.")
            .When(x => x.UpdateSalaryGrade.StepIncrementAmount.HasValue);
    }
}

