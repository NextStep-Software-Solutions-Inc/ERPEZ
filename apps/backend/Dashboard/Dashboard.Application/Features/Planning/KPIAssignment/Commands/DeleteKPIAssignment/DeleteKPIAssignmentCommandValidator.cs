using FluentValidation;

namespace ERPEZ.Application.Features.Planning.KPIAssignment.Commands.DeleteKPIAssignment;

public class DeleteKPIAssignmentCommandValidator : AbstractValidator<DeleteKPIAssignmentCommand>
{
    public DeleteKPIAssignmentCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("KPI Assignment ID is required.");
    }
}
