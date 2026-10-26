using FluentValidation;

namespace ERPEZ.Application.Features.Procurement.AgencyProcurementRequest.Commands.DeleteAPR;

public class DeleteAPRCommandValidator : AbstractValidator<DeleteAPRCommand>
{
    public DeleteAPRCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("APR Id is required.");
    }
}
