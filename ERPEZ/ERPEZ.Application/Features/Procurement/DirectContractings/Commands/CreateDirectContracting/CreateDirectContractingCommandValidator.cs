using FluentValidation;
using System;

namespace ERPEZ.Application.Features.Procurement.DirectContractings.Commands.CreateDirectContracting;

public class CreateDirectContractingCommandValidator : AbstractValidator<CreateDirectContractingCommand>
{
    public CreateDirectContractingCommandValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Name is required.")
            .MaximumLength(500).WithMessage("Name cannot exceed 500 characters.");

        RuleFor(x => x.BACResolutionId)
            .NotEmpty().WithMessage("BAC Resolution ID is required.");

        RuleFor(x => x.ExclusiveSupplierId)
            .NotEmpty().WithMessage("Exclusive Supplier ID is required.");

        RuleFor(x => x.SubmissionDeadline)
            .GreaterThan(DateTime.UtcNow).WithMessage("Submission deadline must be in the future.");
    }
}
