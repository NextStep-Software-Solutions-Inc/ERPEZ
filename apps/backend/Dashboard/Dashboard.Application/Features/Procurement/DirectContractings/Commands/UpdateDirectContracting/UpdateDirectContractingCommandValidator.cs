using FluentValidation;
using System;

namespace ERPEZ.Application.Features.Procurement.DirectContractings.Commands.UpdateDirectContracting;

public class UpdateDirectContractingCommandValidator : AbstractValidator<UpdateDirectContractingCommand>
{
    public UpdateDirectContractingCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Direct Contracting Request ID is required.");

        RuleFor(x => x.Request.Name)
            .NotEmpty().WithMessage("Name is required.")
            .MaximumLength(500).WithMessage("Name cannot exceed 500 characters.");

        RuleFor(x => x.Request.ExclusiveSupplierId)
            .NotEmpty().WithMessage("Exclusive Supplier ID is required.");

        RuleFor(x => x.Request.SubmissionDeadline)
            .GreaterThan(DateTime.UtcNow).WithMessage("Submission deadline must be in the future.");
    }
}
