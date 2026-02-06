using FluentValidation;

namespace ERPEZ.Application.Features.Planning.Position.Commands.UpdatePosition;

public class UpdatePositionCommandValidator : AbstractValidator<UpdatePositionCommand>
{
    private static readonly string[] allowedOperationalStatuses = ["Vacant", "Filled", "Abolished"];

    public UpdatePositionCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Position ID is required.");

        RuleFor(x => x.UpdatePosition.Title)
            .MaximumLength(200)
            .WithMessage("Title cannot exceed 200 characters.")
            .When(x => !string.IsNullOrEmpty(x.UpdatePosition.Title));

        RuleFor(x => x.UpdatePosition.Code)
            .MaximumLength(50)
            .WithMessage("Code cannot exceed 50 characters.")
            .When(x => !string.IsNullOrEmpty(x.UpdatePosition.Code));

        RuleFor(x => x.UpdatePosition.FTE)
            .GreaterThan(0)
            .WithMessage("FTE must be greater than 0.")
            .When(x => x.UpdatePosition.FTE.HasValue);

        RuleFor(x => x.UpdatePosition.OperationalStatus)
            .Must(status => allowedOperationalStatuses.Contains(status!))
            .WithMessage($"Operational Status must be one of: {string.Join(", ", allowedOperationalStatuses)}.")
            .When(x => !string.IsNullOrEmpty(x.UpdatePosition.OperationalStatus));
    }
}

