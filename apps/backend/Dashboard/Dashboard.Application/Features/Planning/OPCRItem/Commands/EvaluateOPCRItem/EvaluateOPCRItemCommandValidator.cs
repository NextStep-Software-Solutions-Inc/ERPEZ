// EvaluateOPCRItemCommandValidator.cs
using ERPEZ.Domain.Enums;
using FluentValidation;
using System.Linq;

namespace ERPEZ.Application.Features.Planning.OPCRItem.Commands.EvaluateOPCRItem;

public class EvaluateOPCRItemCommandValidator
    : AbstractValidator<EvaluateOPCRItemCommand>
{
    public EvaluateOPCRItemCommandValidator()
    {
        RuleFor(x => x.OPCRItemId)
            .NotEmpty()
            .WithMessage("OPCR Item ID is required.");

        RuleFor(x => x.Request)
            .NotNull()
            .WithMessage("Request body is required.");

        RuleFor(x => x.Request.ActualAccomplishment)
            .MaximumLength(1000)
            .When(x => x.Request.ActualAccomplishment != null)
            .WithMessage("Actual accomplishment cannot exceed 1000 characters.");

        RuleFor(x => x.Request.DimensionRate)
            .Must(HaveUniqueMeasurementDimensionPairs)
            .WithMessage("Duplicate rating entries are not allowed for the same FYActiveKPIMeasurementId and dimension.");

        RuleForEach(x => x.Request.DimensionRate).ChildRules(rating =>
        {
            rating.RuleFor(r => r.FYActiveKPIMeasurementId)
                .NotEmpty()
                .WithMessage("FYActiveKPIMeasurementId is required per rating.");

            rating.RuleFor(r => r.Dimension)
                .IsInEnum()
                .WithMessage("Dimension must be one of: Efficiency, Quality, Timeliness.");

            rating.RuleFor(r => r.SelfRating)
                .InclusiveBetween(1, 5)
                .WithMessage("Self rating must be between 1 and 5.");
        });

        RuleForEach(x => x.Request.Mov).ChildRules(mov =>
        {
            mov.RuleFor(m => m.FYActiveKPIMeasurementId)
                .NotEmpty()
                .WithMessage("FYActiveKPIMeasurementId is required per MOV.");

            mov.RuleFor(m => m.Mov)
                .NotEmpty()
                .WithMessage("MOV is required.")
                .MaximumLength(500)
                .WithMessage("MOV cannot exceed 500 characters.");

            mov.RuleFor(m => m.FileId)
                .NotEmpty()
                .WithMessage("File ID is required per MOV.");
        });
    }

    private static bool HaveUniqueMeasurementDimensionPairs(
        System.Collections.Generic.IEnumerable<ERPEZ.Application.Features.Planning.OPCRItem.Dtos.DimensionRateRequest>? ratings)
    {
        if (ratings == null)
            return true;

        var keys = ratings
            .Select(r =>
                $"{r.FYActiveKPIMeasurementId:D}|{r.Dimension}")
            .ToList();

        return keys.Count == keys.Distinct().Count();
    }
}