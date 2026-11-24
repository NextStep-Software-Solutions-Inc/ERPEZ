using ERPEZ.Domain.Enums;
using FluentValidation;

namespace ERPEZ.Application.Features.Planning.User.Commands.CreateUser;

public class CreateUserCommandValidator : AbstractValidator<CreateUserCommand>
{
    public CreateUserCommandValidator()
    {
        RuleFor(x => x.EmployeeNumber)
            .NotEmpty()
            .WithMessage("Employee Number is required.")
            .MaximumLength(50)
            .WithMessage("Employee Number cannot exceed 50 characters.");

        RuleFor(x => x.Username)
            .NotEmpty()
            .WithMessage("Username is required.")
            .MinimumLength(3)
            .WithMessage("Username must be at least 3 characters long.")
            .MaximumLength(100)
            .WithMessage("Username cannot exceed 100 characters.");

        RuleFor(x => x.Email)
            .NotEmpty()
            .WithMessage("Email is required.")
            .EmailAddress()
            .WithMessage("Email must be a valid email address.")
            .MaximumLength(255)
            .WithMessage("Email cannot exceed 255 characters.");

        RuleFor(x => x.FirstName)
            .NotEmpty()
            .WithMessage("First Name is required.")
            .MaximumLength(100)
            .WithMessage("First Name cannot exceed 100 characters.");

        RuleFor(x => x.LastName)
            .NotEmpty()
            .WithMessage("Last Name is required.")
            .MaximumLength(100)
            .WithMessage("Last Name cannot exceed 100 characters.");

        RuleFor(x => x.EmploymentStatus)
            .NotEmpty()
            .WithMessage("Employment Status is required.")
            .Must(status => Enum.GetNames<EmploymentStatusEnum>().Contains(status))
            .WithMessage($"Employment Status must be one of: {string.Join(", ", Enum.GetNames<EmploymentStatusEnum>())}.");
    }
}
