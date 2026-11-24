using FluentValidation;

namespace ERPEZ.Application.Features.Planning.FiscalYear.Commands.UpdateFiscalYearStatus;

public class UpdateFiscalYearStatusCommandValidator : AbstractValidator<UpdateFiscalYearStatusCommand>
{
    private static readonly string[] validStatuses = ["setup", "planning", "active", "closed"];

    public UpdateFiscalYearStatusCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Fiscal year ID is required.");

        RuleFor(x => x.Status)
            .NotEmpty()
            .WithMessage("Status is required.")
            .Must(status => validStatuses.Contains(status.ToLowerInvariant()))
            .WithMessage($"Status must be one of: {string.Join(", ", validStatuses)}");
    }
}
