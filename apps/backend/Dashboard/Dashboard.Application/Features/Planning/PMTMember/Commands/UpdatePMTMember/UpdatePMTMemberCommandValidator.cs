using ERPEZ.Domain.Enums;
using FluentValidation;

namespace ERPEZ.Application.Features.Planning.PMTMember.Commands.UpdatePMTMember;

public class UpdatePMTMemberCommandValidator : AbstractValidator<UpdatePMTMemberCommand>
{
    public UpdatePMTMemberCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("PMT Member ID is required.");

        RuleFor(x => x.UpdatePMTMember.Role)
            .Must(role => Enum.GetNames<PMTRoleEnum>().Contains(role!))
            .WithMessage($"Role must be one of: {string.Join(", ", Enum.GetNames<PMTRoleEnum>())}.")
            .When(x => !string.IsNullOrEmpty(x.UpdatePMTMember.Role));

        RuleFor(x => x.UpdatePMTMember.AppointmentDate)
            .LessThanOrEqualTo(DateTime.UtcNow)
            .WithMessage("Appointment Date cannot be in the future.")
            .When(x => x.UpdatePMTMember.AppointmentDate.HasValue);
    }
}
