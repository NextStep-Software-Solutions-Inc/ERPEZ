using FluentValidation;

namespace ERPEZ.Application.Features.Planning.FundSource.Commands.CreateFundSource;

public class CreateFundSourceCommandValidator : AbstractValidator<CreateFundSourceCommand>
{
    private readonly string[] validTypes =
    [
        "FundCluster", "FinancingSource", "AuthorizationCode", "FundCategory"
    ];

    public CreateFundSourceCommandValidator()
    {
        // ParentId (Optional GUID)
        RuleFor(x => x.ParentId)
            .Must(id => !id.HasValue || id.Value != Guid.Empty)
            .WithMessage("If provided, the Parent ID must be a valid, non-empty GUID.")
            .When(x => x.ParentId.HasValue);

        // Name (Required String, Min/Max Length)
        RuleFor(x => x.Name)
            .NotEmpty()
            .WithMessage("Fund Source Name is required.")
            .MinimumLength(3)
            .WithMessage("Fund Source Name must be at least 3 characters long.")
            .MaximumLength(150)
            .WithMessage("Fund Source Name cannot exceed 150 characters.");

        // Code (Required String, Length, Alpha-Numeric with Hyphen/Underscore)
        RuleFor(x => x.Code)
            .NotEmpty()
            .WithMessage("Fund Source Code is required.")
            .MinimumLength(2)
            .WithMessage("Fund Source Code must be at least 2 characters long.")
            .MaximumLength(20)
            .WithMessage("Fund Source Code cannot exceed 20 characters.")
            .Matches(@"^[a-zA-Z0-9\-_]+$")
            .WithMessage("Fund Source Code can only contain letters, numbers, hyphens, and underscores.");

        // Type (Required String, Must be one of the defined valid types)
        RuleFor(x => x.Type)
            .NotEmpty()
            .WithMessage("Fund Source Type is required.")
            .Must(type => validTypes.Contains(type, StringComparer.OrdinalIgnoreCase))
            .WithMessage($"Fund Source Type must be one of the following: {string.Join(", ", validTypes)}.");
    }
}
