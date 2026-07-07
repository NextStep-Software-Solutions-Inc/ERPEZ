using FluentValidation;
using System;

namespace ERPEZ.Application.Features.Procurement.DirectContractings.Commands.CreateDirectContracting;

public class CreateDirectContractingCommandValidator : AbstractValidator<CreateDirectContractingCommand>
{
    public CreateDirectContractingCommandValidator()
    {
        RuleFor(x => x.DCNumber)
            .NotEmpty().WithMessage("DC Number is required.")
            .MaximumLength(100).WithMessage("DC Number cannot exceed 100 characters.");

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Name is required.")
            .MaximumLength(500).WithMessage("Name cannot exceed 500 characters.");

        RuleFor(x => x.BACProjectId)
            .NotEmpty().WithMessage("BAC Project ID is required.");

        RuleFor(x => x.ExclusiveSupplierId)
            .NotEmpty().WithMessage("Exclusive Supplier ID is required.");

        RuleFor(x => x.SubmissionDeadline)
            .GreaterThan(DateTime.UtcNow).WithMessage("Submission deadline must be in the future.");
    }
}
