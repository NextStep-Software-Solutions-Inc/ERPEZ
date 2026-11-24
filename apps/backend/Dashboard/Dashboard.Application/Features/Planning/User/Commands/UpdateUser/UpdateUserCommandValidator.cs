using ERPEZ.Domain.Enums;
using FluentValidation;

namespace ERPEZ.Application.Features.Planning.User.Commands.UpdateUser;

public class UpdateUserCommandValidator : AbstractValidator<UpdateUserCommand>
{
    public UpdateUserCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("User ID is required.");

        RuleFor(x => x.UpdateUser.EmployeeNumber)
            .MaximumLength(50)
            .WithMessage("Employee Number cannot exceed 50 characters.")
            .When(x => !string.IsNullOrEmpty(x.UpdateUser.EmployeeNumber));

        RuleFor(x => x.UpdateUser.Username)
            .MinimumLength(3)
            .WithMessage("Username must be at least 3 characters long.")
            .MaximumLength(100)
            .WithMessage("Username cannot exceed 100 characters.")
            .When(x => !string.IsNullOrEmpty(x.UpdateUser.Username));

        RuleFor(x => x.UpdateUser.Email)
            .EmailAddress()
            .WithMessage("Email must be a valid email address.")
            .MaximumLength(255)
            .WithMessage("Email cannot exceed 255 characters.")
            .When(x => !string.IsNullOrEmpty(x.UpdateUser.Email));

        RuleFor(x => x.UpdateUser.FirstName)
            .MaximumLength(100)
            .WithMessage("First Name cannot exceed 100 characters.")
            .When(x => !string.IsNullOrEmpty(x.UpdateUser.FirstName));

        RuleFor(x => x.UpdateUser.LastName)
            .MaximumLength(100)
            .WithMessage("Last Name cannot exceed 100 characters.")
            .When(x => !string.IsNullOrEmpty(x.UpdateUser.LastName));

        RuleFor(x => x.UpdateUser.EmploymentStatus)
            .Must(status => Enum.GetNames<EmploymentStatusEnum>().Contains(status!))
            .WithMessage($"Employment Status must be one of: {string.Join(", ", Enum.GetNames<EmploymentStatusEnum>())}.")
            .When(x => !string.IsNullOrEmpty(x.UpdateUser.EmploymentStatus));
    }
}
