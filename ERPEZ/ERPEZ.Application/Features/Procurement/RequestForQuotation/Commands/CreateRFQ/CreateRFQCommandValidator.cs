using ERPEZ.Shared.Common;
using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using FluentValidation;
using MediatR;
 
namespace ERPEZ.Application.RFQ.Commands.CreateRFQ;

/// <summary>
/// Shape validation only, matching this codebase's convention (see CreateAPRCommandValidator) —
/// no repository/DB checks here. Uniqueness and supplier-eligibility business rules are
/// enforced in the handler instead.
/// </summary>
public class CreateRFQCommandValidator : AbstractValidator<CreateRFQCommand>
{
    public CreateRFQCommandValidator()
    {
        RuleFor(x => x.RFQNumber)
            .NotEmpty()
            .MaximumLength(100);
 
        RuleFor(x => x.TracingNumber)
            .NotEmpty()
            .MaximumLength(100);
 
        RuleFor(x => x.Date).NotEmpty();
 
        RuleFor(x => x.SupplierIds)
            .NotEmpty()
            .WithMessage("Please select at least one prospective supplier.");
    }
}
