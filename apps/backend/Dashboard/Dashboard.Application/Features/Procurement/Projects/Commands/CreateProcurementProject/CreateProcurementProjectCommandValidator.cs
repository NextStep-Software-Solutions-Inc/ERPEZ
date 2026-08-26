using ERPEZ.Domain.Enums;
using FluentValidation;

namespace ERPEZ.Application.Features.Procurement.Projects.Commands.CreateProcurementProject;

public class CreateProcurementProjectCommandValidator : AbstractValidator<CreateProcurementProjectCommand>
{
    public CreateProcurementProjectCommandValidator()
    {
        RuleFor(x => x.SourceType)
            .IsInEnum()
            .WithMessage("A valid ProcurementProjectSourceType must be specified.");

        When(x => x.SourceType == ProcurementProjectSourceType.APPItem, () =>
        {
            RuleFor(x => x.APPItemId)
                .NotEmpty()
                .WithMessage("APPItemId is required when SourceType is APPItem.");

            RuleFor(x => x.ConsolidatedPRId)
                .Null()
                .WithMessage("ConsolidatedPRId must be null when SourceType is APPItem.");
        });

        When(x => x.SourceType == ProcurementProjectSourceType.ConsolidatedPR, () =>
        {
            RuleFor(x => x.ConsolidatedPRId)
                .NotEmpty()
                .WithMessage("ConsolidatedPRId is required when SourceType is ConsolidatedPR.");

            RuleFor(x => x.APPItemId)
                .Null()
                .WithMessage("APPItemId must be null when SourceType is ConsolidatedPR.");
        });

        RuleFor(x => x.ResolutionNumber)
            .NotEmpty()
            .WithMessage("BAC Resolution Number is required.");

        When(x => x.WhereasClauses != null, () =>
        {
            RuleForEach(x => x.WhereasClauses)
                .ChildRules(clause =>
                {
                    clause.RuleFor(c => c.WhereasClauseId)
                        .NotEmpty()
                        .WithMessage("WhereasClauseId is required.");
                    clause.RuleFor(c => c.Order)
                        .GreaterThanOrEqualTo(0)
                        .WithMessage("Order must be non-negative.");
                });

            RuleFor(x => x.WhereasClauses!)
                .Must(clauses => clauses.Select(c => c.WhereasClauseId).Distinct().Count() == clauses.Count)
                .WithMessage("Whereas clauses must not contain duplicate WhereasClauseId values.");

            RuleFor(x => x.WhereasClauses!)
                .Must(clauses => clauses.Select(c => c.Order).Distinct().Count() == clauses.Count)
                .WithMessage("Whereas clauses must not contain duplicate Order values.");

            RuleFor(x => x.WhereasClauses!)
                .Must(clauses =>
                {
                    if (clauses.Count == 0) return true;
                    var sortedOrders = clauses.Select(c => c.Order).OrderBy(o => o).ToList();
                    for (int i = 0; i < sortedOrders.Count; i++)
                    {
                        if (sortedOrders[i] != i) return false;
                    }
                    return true;
                })
                .WithMessage("Whereas clause Order values must be sequential numbers starting from 0 to N-1.");
        });
    }
}
