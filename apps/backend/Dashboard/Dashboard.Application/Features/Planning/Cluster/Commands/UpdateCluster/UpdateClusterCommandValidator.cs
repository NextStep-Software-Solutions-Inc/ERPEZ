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

        // Code (Optional String, Max Length if provided)
        RuleFor(x => x.UpdateCluster.Code)
            .NotEmpty()
            .WithMessage("Cluster Code is required.")
            .MaximumLength(50)
            .WithMessage("Cluster Code cannot exceed 50 characters.")
            .When(x => !string.IsNullOrWhiteSpace(x.UpdateCluster.Code));

        // Address (Optional String, Max Length)
        RuleFor(x => x.UpdateCluster.Address)
            .MaximumLength(500)
            .WithMessage("Address cannot exceed 500 characters.")
            .When(x => !string.IsNullOrWhiteSpace(x.UpdateCluster.Address));

        // MaxSubUnits (Optional Integer, must be positive)
        RuleFor(x => x.UpdateCluster.MaxSubUnits)
            .GreaterThan(0)
            .WithMessage("MaxSubUnits must be greater than zero.")
            .When(x => x.UpdateCluster.MaxSubUnits.HasValue);
    }
}
