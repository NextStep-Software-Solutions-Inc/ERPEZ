using FluentValidation;

namespace ERPEZ.Application.Features.Procurement.Projects.Commands.DeleteProcurementProject;

public class DeleteProcurementProjectCommandValidator : AbstractValidator<DeleteProcurementProjectCommand>
{
    public DeleteProcurementProjectCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Project Id is required.");
    }
}
