using FluentValidation;

namespace ERPEZ.Application.Features.Planning.OPCREvaluation.Commands.DeleteOPCREvaluation;

public class DeleteOPCREvaluationCommandValidator : AbstractValidator<DeleteOPCREvaluationCommand>
{
    public DeleteOPCREvaluationCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("OPCREvaluation ID is required for deletion.");
    }
}
