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
    }
}
