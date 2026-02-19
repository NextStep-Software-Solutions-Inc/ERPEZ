using ERPEZ.Domain.Enums;
using FluentValidation;

namespace ERPEZ.Application.Features.Planning.PMTMember.Commands.CreatePMTMember;

public class CreatePMTMemberCommandValidator : AbstractValidator<CreatePMTMemberCommand>
{
    private static readonly string[] allowedRoles = 
    [
        nameof(PMTRoleEnum.Chair),
        nameof(PMTRoleEnum.ViceChair),
        nameof(PMTRoleEnum.Member),
        nameof(PMTRoleEnum.Secretariat)
    ];

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
            .Must(role => allowedRoles.Contains(role))
            .WithMessage($"Role must be one of: {string.Join(", ", allowedRoles)}.");

        RuleFor(x => x.AppointmentDate)
            .NotEmpty()
            .WithMessage("Appointment Date is required.")
            .LessThanOrEqualTo(DateTime.UtcNow)
            .WithMessage("Appointment Date cannot be in the future.");
    }
}
