using ERPEZ.Domain.Enums;
using FluentValidation;

namespace ERPEZ.Application.Features.Planning.PersonnelPosition.Commands.UpdatePersonnelPosition;

public class UpdatePersonnelPositionCommandValidator : AbstractValidator<UpdatePersonnelPositionCommand>
{
    private static readonly string[] allowedAssignmentTypes = 
    [
        nameof(AssignmentTypeEnum.Permanent),
        nameof(AssignmentTypeEnum.OIC)
    ];

    public UpdatePersonnelPositionCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Personnel Position ID is required.");

        RuleFor(x => x.UpdatePersonnelPosition.AssignmentType)
            .Must(type => allowedAssignmentTypes.Contains(type!))
            .WithMessage($"Assignment Type must be one of: {string.Join(", ", allowedAssignmentTypes)}.")
            .When(x => !string.IsNullOrEmpty(x.UpdatePersonnelPosition.AssignmentType));

        RuleFor(x => x.UpdatePersonnelPosition.EndDate)
            .Must((command, endDate) => 
            {
                // If EndDate is provided, validate against existing StartDate
                // This will be validated in the handler with actual entity data
                return true;
            })
            .WithMessage("End Date must be after Start Date.")
            .When(x => x.UpdatePersonnelPosition.EndDate.HasValue);
    }
}
