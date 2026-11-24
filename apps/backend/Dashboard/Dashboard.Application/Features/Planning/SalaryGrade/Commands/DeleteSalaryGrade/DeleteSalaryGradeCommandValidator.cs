using FluentValidation;

namespace ERPEZ.Application.Features.Planning.SalaryGrade.Commands.DeleteSalaryGrade;

/// <summary>
/// Validator for DeleteSalaryGradeCommand ensuring the ID is provided.
/// </summary>
public class DeleteSalaryGradeCommandValidator : AbstractValidator<DeleteSalaryGradeCommand>
{
    public DeleteSalaryGradeCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Salary grade ID is required for deletion.");
    }
}
