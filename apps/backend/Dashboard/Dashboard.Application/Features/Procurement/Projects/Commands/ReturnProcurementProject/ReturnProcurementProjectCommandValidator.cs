using FluentValidation;

namespace ERPEZ.Application.Features.Procurement.Projects.Commands.ReturnProcurementProject;

public class ReturnProcurementProjectCommandValidator : AbstractValidator<ReturnProcurementProjectCommand>
{
    public ReturnProcurementProjectCommandValidator()
    {
        RuleFor(x => x.ProjectId)
            .NotEmpty().WithMessage("Project ID is required.");

        RuleFor(x => x.Request)
            .NotNull().WithMessage("Request payload is required.")
            .Must(req => req != null && (!string.IsNullOrWhiteSpace(req.Remarks) || !string.IsNullOrWhiteSpace(req.Reason)))
            .WithMessage("Return reason or remarks is required.");
    }
}
