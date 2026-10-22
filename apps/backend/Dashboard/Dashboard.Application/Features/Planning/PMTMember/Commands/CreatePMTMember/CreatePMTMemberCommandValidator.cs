using ERPEZ.Domain.Enums;
using FluentValidation;

namespace ERPEZ.Application.Features.Planning.PMTMember.Commands.CreatePMTMember;

public class CreatePMTMemberCommandValidator : AbstractValidator<CreatePMTMemberCommand>
{
    public CreatePMTMemberCommandValidator()
    {
        RuleFor(x => x.PMTId)
            .NotEmpty()
            .WithMessage("PMT ID is required.");

        RuleFor(x => x.UserId)
            .NotEmpty()
            .WithMessage("User ID is required.");

        RuleFor(x => x.Role)
            .NotEmpty()
            .WithMessage("Role is required.")
            .Must(role => Enum.GetNames<PMTRoleEnum>().Contains(role))
            .WithMessage($"Role must be one of: {string.Join(", ", Enum.GetNames<PMTRoleEnum>())}.");

        RuleFor(x => x.AppointmentDate)
            .NotEmpty()
            .WithMessage("Appointment Date is required.")
            .LessThanOrEqualTo(DateTime.UtcNow)
            .WithMessage("Appointment Date cannot be in the future.");
    }
}
