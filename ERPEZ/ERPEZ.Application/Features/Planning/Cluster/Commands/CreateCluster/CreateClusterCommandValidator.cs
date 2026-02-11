using FluentValidation;

namespace ERPEZ.Application.Features.Planning.Cluster.Commands.CreateCluster;

public class CreateClusterCommandValidator : AbstractValidator<CreateClusterCommand>
{
    public CreateClusterCommandValidator()
    {
        // Name (Required String, Min/Max Length)
        RuleFor(x => x.Name)
            .NotEmpty()
            .WithMessage("Cluster Name is required.")
            .MinimumLength(3)
            .WithMessage("Cluster Name must be at least 3 characters long.")
            .MaximumLength(256)
            .WithMessage("Cluster Name cannot exceed 256 characters.");

        // Code (Required String, Max Length)
        RuleFor(x => x.Code)
            .NotEmpty()
            .WithMessage("Cluster Code is required.")
            .MaximumLength(50)
            .WithMessage("Cluster Code cannot exceed 50 characters.");

        // Address (Optional String, Max Length)
        RuleFor(x => x.Address)
            .MaximumLength(500)
            .WithMessage("Address cannot exceed 500 characters.")
            .When(x => !string.IsNullOrWhiteSpace(x.Address));

        // MaxSubUnits (Optional Integer, must be positive)
        RuleFor(x => x.MaxSubUnits)
            .GreaterThan(0)
            .WithMessage("MaxSubUnits must be greater than zero.")
            .When(x => x.MaxSubUnits.HasValue);
    }
}
