using System.Linq;
using FluentValidation;

namespace ERPEZ.Application.Features.Procurement.Projects.Commands.UpdateProcurementProject;

public class UpdateProcurementProjectCommandValidator : AbstractValidator<UpdateProcurementProjectCommand>
{
    public UpdateProcurementProjectCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Project Id is required.");

        RuleFor(x => x.UpdateRequest.Title)
            .MaximumLength(500)
            .WithMessage("Project title cannot exceed 500 characters.")
            .When(x => !string.IsNullOrEmpty(x.UpdateRequest.Title));

        RuleFor(x => x.UpdateRequest.WhereasClauses)
            .Must(clauses => clauses == null || clauses.Select(c => c.WhereasClauseId).Distinct().Count() == clauses.Count)
            .WithMessage("WhereasClauses must not contain duplicate clause IDs.")
            .Must(clauses => clauses == null || !clauses.Any(c => c.WhereasClauseId == System.Guid.Empty))
            .WithMessage("WhereasClauses must not contain empty GUIDs.")
            .When(x => x.UpdateRequest.WhereasClauses != null);
    }
}
