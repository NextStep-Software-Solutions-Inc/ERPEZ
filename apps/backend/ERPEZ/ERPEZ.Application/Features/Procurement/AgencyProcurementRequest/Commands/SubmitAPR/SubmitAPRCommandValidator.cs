using ERPEZ.Application.Features.Procurement.AgencyProcurementRequest.Commands.SubmitAPR;
using FluentValidation;

namespace ERPEZ.Application.Features.Procurement.AgencyProcurementRequest.Commands.SubmitAPR;

public class SubmitAPRCommandValidator : AbstractValidator<SubmitAPRCommand>
{
    public SubmitAPRCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("APR Id is required.");
    }
}