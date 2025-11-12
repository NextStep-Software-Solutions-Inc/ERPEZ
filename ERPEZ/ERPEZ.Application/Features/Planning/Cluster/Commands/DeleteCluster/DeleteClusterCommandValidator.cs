using FluentValidation;

namespace ERPEZ.Application.Features.Planning.Cluster.Commands.DeleteCluster;

public class DeleteClusterCommandValidator : AbstractValidator<DeleteClusterCommand>
{
    public DeleteClusterCommandValidator()
    {
        // Primary ID Validation (Required for deletion)
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Cluster ID is required for deletion.")
            .Must(id => id != Guid.Empty)
            .WithMessage("Cluster ID must be a valid, non-empty GUID.");
    }
}