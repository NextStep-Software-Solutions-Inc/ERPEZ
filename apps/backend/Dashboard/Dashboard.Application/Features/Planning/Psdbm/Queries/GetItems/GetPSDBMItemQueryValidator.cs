using FluentValidation;

namespace ERPEZ.Application.Features.Planning.Psdbm.Queries.GetItems;

public class GetPsdbmItemsQueryValidator : AbstractValidator<GetPsdbmItemsQuery>
{
    public GetPsdbmItemsQueryValidator()
    {
        RuleFor(x => x.Mode)
            .NotEmpty()
            .WithMessage("Mode is required.")
            .Must(m => m is "main" or "regional" or "lgu")
            .WithMessage("Mode must be 'main', 'regional', or 'lgu'.");

        RuleFor(x => x.PageNumber)
            .GreaterThanOrEqualTo(1)
            .WithMessage("PageNumber must be at least 1.");

        RuleFor(x => x.PageSize)
            .InclusiveBetween(1, 500)
            .WithMessage("PageSize must be between 1 and 500.");

        RuleFor(x => x.Depot)
            .NotEmpty()
            .WithMessage("Depot is required for regional and lgu modes.")
            .When(x => x.Mode is "regional" or "lgu");
    }
}