using ERPEZ.Application.Features.Procurement.PurchaseRequests.Commands.CreatePR;
using ERPEZ.Application.Features.Procurement.PurchaseRequests.Dtos;
using FluentValidation;

namespace ERPEZ.Application.Features.Procurement.PurchaseRequests.Commands.UpdatePR;

public class UpdatePRCommandValidator : AbstractValidator<UpdatePRCommand>
{
    public UpdatePRCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("PR ID is required.");

        RuleFor(x => x.Dto.Purpose)
            .MaximumLength(1000).WithMessage("Purpose cannot exceed 1000 characters.")
            .When(x => x.Dto.Purpose is not null);

        RuleFor(x => x.Dto.Description)
            .MaximumLength(500).WithMessage("Description cannot exceed 500 characters.")
            .When(x => x.Dto.Description is not null);

        RuleForEach(x => x.Dto.Items)
            .SetValidator(new PRItemRequestValidator())
            .When(x => x.Dto.Items is not null);
    }
}