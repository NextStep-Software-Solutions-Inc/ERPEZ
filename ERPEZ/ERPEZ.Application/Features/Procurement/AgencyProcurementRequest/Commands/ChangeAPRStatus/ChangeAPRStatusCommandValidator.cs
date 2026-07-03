using FluentValidation;
using ERPEZ.Domain.Enums;

namespace ERPEZ.Application.Features.Procurement.AgencyProcurementRequest.Commands.ChangeAPRStatus;

public class ChangeAPRStatusCommandValidator : AbstractValidator<ChangeAPRStatusCommand>
{
    public ChangeAPRStatusCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("APR Id is required.");

        RuleFor(x => x.Status)
            .IsInEnum()
            .WithMessage("A valid status is required.");

        RuleFor(x => x.Remarks)
            .MaximumLength(1000)
            .WithMessage("Remarks must not exceed 1000 characters.");

        RuleFor(x => x.Remarks)
            .NotEmpty()
            .WithMessage("Remarks are required when returning an APR.")
            .When(x => x.Status == StatusEnum.Returned);
    }
}
