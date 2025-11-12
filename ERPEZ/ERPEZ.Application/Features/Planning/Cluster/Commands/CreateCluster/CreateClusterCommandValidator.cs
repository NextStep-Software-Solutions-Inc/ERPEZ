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

        // Description (Optional String, Max Length)
        RuleFor(x => x.Description)
            .MaximumLength(1000)
            .WithMessage("Description cannot exceed 1000 characters.")
            .When(x => !string.IsNullOrWhiteSpace(x.Description));
    }
}