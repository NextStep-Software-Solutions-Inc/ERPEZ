using ERPEZ.Domain.Enums;
using FluentValidation;

namespace ERPEZ.Application.Features.Planning.PersonnelPosition.Commands.UpdatePersonnelPosition;

public class UpdatePersonnelPositionCommandValidator : AbstractValidator<UpdatePersonnelPositionCommand>
{
    public UpdatePersonnelPositionCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Personnel Position ID is required.");

        RuleFor(x => x.UpdatePersonnelPosition.AssignmentType)
            .Must(type => Enum.GetNames<AssignmentTypeEnum>().Contains(type!))
            .WithMessage($"Assignment Type must be one of: {string.Join(", ", Enum.GetNames<AssignmentTypeEnum>())}.")
            .When(x => !string.IsNullOrEmpty(x.UpdatePersonnelPosition.AssignmentType));

        RuleFor(x => x.UpdatePersonnelPosition.EndDate)
            .GreaterThan(x => x.UpdatePersonnelPosition.StartDate)
            .WithMessage("End Date must be after Start Date.")
            .When(x => x.UpdatePersonnelPosition.EndDate.HasValue && x.UpdatePersonnelPosition.StartDate.HasValue);
    }
}
