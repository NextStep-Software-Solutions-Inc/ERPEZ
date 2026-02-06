using FluentValidation;

namespace ERPEZ.Application.Features.Planning.SalaryGrade.Commands.UpdateSalaryGrade;

public class UpdateSalaryGradeCommandValidator : AbstractValidator<UpdateSalaryGradeCommand>
{
    public UpdateSalaryGradeCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Id is required.");

        RuleFor(x => x.Request.Name)
            .MaximumLength(200)
            .WithMessage("Name cannot exceed 200 characters.")
            .When(x => !string.IsNullOrWhiteSpace(x.Request.Name));

        RuleFor(x => x.Request.Code)
            .MaximumLength(50)
            .WithMessage("Code cannot exceed 50 characters.")
            .When(x => !string.IsNullOrWhiteSpace(x.Request.Code));

        RuleFor(x => x.Request.GradeNumber)
            .GreaterThan(0)
            .WithMessage("Grade Number must be greater than 0.")
            .When(x => x.Request.GradeNumber.HasValue);

        RuleFor(x => x.Request.NumberOfSteps)
            .GreaterThan(0)
            .WithMessage("Number of Steps must be greater than 0.")
            .When(x => x.Request.NumberOfSteps.HasValue);

        RuleFor(x => x.Request.StepIncrementAmount)
            .GreaterThan(0)
            .WithMessage("Step Increment Amount must be greater than 0.")
            .When(x => x.Request.StepIncrementAmount.HasValue);
    }
}
