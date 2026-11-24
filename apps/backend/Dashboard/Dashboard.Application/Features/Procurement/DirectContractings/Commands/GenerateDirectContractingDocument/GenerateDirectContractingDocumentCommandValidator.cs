using System;
using FluentValidation;

namespace ERPEZ.Application.Features.Procurement.DirectContractings.Commands.GenerateDirectContractingDocument;

public class GenerateDirectContractingDocumentCommandValidator : AbstractValidator<GenerateDirectContractingDocumentCommand>
{
    public GenerateDirectContractingDocumentCommandValidator()
    {
        RuleFor(x => x.DirectContractingId)
            .NotEmpty()
            .WithMessage("Direct Contracting ID is required.");

        RuleFor(x => x.Format)
            .IsInEnum()
            .WithMessage("A valid export format is required.");
    }
}
