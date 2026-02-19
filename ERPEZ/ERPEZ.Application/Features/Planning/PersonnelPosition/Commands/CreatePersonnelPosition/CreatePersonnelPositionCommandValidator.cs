using ERPEZ.Domain.Enums;
using FluentValidation;

namespace ERPEZ.Application.Features.Planning.PersonnelPosition.Commands.CreatePersonnelPosition;

public class CreatePersonnelPositionCommandValidator : AbstractValidator<CreatePersonnelPositionCommand>
{
    private static readonly string[] allowedAssignmentTypes = 
    [
        nameof(AssignmentTypeEnum.Permanent),
        nameof(AssignmentTypeEnum.OIC)
    ];

    public CreatePersonnelPositionCommandValidator()
    {
        RuleFor(x => x.UserId)
            .NotEmpty()
            .WithMessage("User ID is required.");

        RuleFor(x => x.PositionId)
            .NotEmpty()
            .WithMessage("Position ID is required.");

        RuleFor(x => x.AssignmentType)
            .NotEmpty()
            .WithMessage("Assignment Type is required.")
            .Must(type => allowedAssignmentTypes.Contains(type))
            .WithMessage($"Assignment Type must be one of: {string.Join(", ", allowedAssignmentTypes)}.");

        RuleFor(x => x.StartDate)
            .NotEmpty()
            .WithMessage("Start Date is required.")
            .LessThanOrEqualTo(DateTime.UtcNow)
            .WithMessage("Start Date cannot be in the future.");

        RuleFor(x => x.EndDate)
            .GreaterThan(x => x.StartDate)
            .WithMessage("End Date must be after Start Date.")
            .When(x => x.EndDate.HasValue);
    }
}
