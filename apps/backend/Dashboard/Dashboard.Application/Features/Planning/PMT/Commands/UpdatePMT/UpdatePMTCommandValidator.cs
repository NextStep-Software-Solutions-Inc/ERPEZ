using FluentValidation;

namespace ERPEZ.Application.Features.Planning.PMT.Commands.UpdatePMT;

public class UpdatePMTCommandValidator : AbstractValidator<UpdatePMTCommand>
{
    public UpdatePMTCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("PMT ID is required.");

        RuleFor(x => x.UpdatePMT.ActiveYear)
            .GreaterThan(2000)
            .WithMessage("Active Year must be greater than 2000.")
            .LessThanOrEqualTo(DateTime.UtcNow.Year + 5)
            .WithMessage($"Active Year cannot exceed {DateTime.UtcNow.Year + 5}.")
            .When(x => x.UpdatePMT.ActiveYear.HasValue);
    }
}
