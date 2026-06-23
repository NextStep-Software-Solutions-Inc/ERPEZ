using FluentValidation;

namespace ERPEZ.Application.Features.Procurement.Projects.Commands.UpdateProcurementProjectStatus;

public class UpdateProcurementProjectStatusCommandValidator : AbstractValidator<UpdateProcurementProjectStatusCommand>
{
    public UpdateProcurementProjectStatusCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Project Id is required.");

        RuleFor(x => x.StatusRequest.Status)
            .NotEmpty()
            .WithMessage("Status is required.");
    }
}
