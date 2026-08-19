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

        RuleFor(x => x.Max)
            .InclusiveBetween(1, 1000)
            .WithMessage("Max must be between 1 and 1000.");

        RuleFor(x => x.Depot)
            .NotEmpty()
            .WithMessage("Depot is required for regional and lgu modes.")
            .When(x => x.Mode is "regional" or "lgu");
    }
}