using FluentValidation;

namespace ERPEZ.Application.Features.Planning.Cluster.Commands.UpdateCluster;

public class UpdateClusterCommandValidator : AbstractValidator<UpdateClusterCommand>
{
    public UpdateClusterCommandValidator()
    {
        // Primary ID Validation (Required for update)
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Cluster ID is required for update.")
            .Must(id => id != Guid.Empty)
            .WithMessage("Cluster ID must be a valid, non-empty GUID.");

        // Name (Optional String, Min/Max Length if provided)
        RuleFor(x => x.UpdateCluster.Name)
            .MinimumLength(3)
            .WithMessage("Cluster Name must be at least 3 characters long.")
            .MaximumLength(256)
            .WithMessage("Cluster Name cannot exceed 256 characters.")
            .When(x => !string.IsNullOrWhiteSpace(x.UpdateCluster.Name));

        // Description (Optional String, Max Length if provided)
        RuleFor(x => x.UpdateCluster.Description)
            .MaximumLength(1000)
            .WithMessage("Description cannot exceed 1000 characters.")
            .When(x => !string.IsNullOrWhiteSpace(x.UpdateCluster.Description));
    }
}
