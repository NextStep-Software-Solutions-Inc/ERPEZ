using FluentValidation;

namespace ERPEZ.Application.Features.Planning.PMT.Commands.CreatePMT;

public class CreatePMTCommandValidator : AbstractValidator<CreatePMTCommand>
{
    public CreatePMTCommandValidator()
    {
        RuleFor(x => x.OrganizationId)
            .NotEmpty()
            .WithMessage("Organization ID is required.");

        RuleFor(x => x.ActiveYear)
            .NotEmpty()
            .WithMessage("Active Year is required.")
            .GreaterThan(2000)
            .WithMessage("Active Year must be greater than 2000.")
            .LessThanOrEqualTo(DateTime.UtcNow.Year + 5)
            .WithMessage($"Active Year cannot exceed {DateTime.UtcNow.Year + 5}.");
    }
}
