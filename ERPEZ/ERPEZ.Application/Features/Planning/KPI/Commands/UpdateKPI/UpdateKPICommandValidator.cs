using ERPEZ.Domain.Enums;
using FluentValidation;

namespace ERPEZ.Application.Features.Planning.KPI.Commands.UpdateKPI;

public class UpdateKPICommandValidator : AbstractValidator<UpdateKPICommand>
{
    private readonly string[] validStatuses = Enum.GetNames<StatusEnum>();
    private readonly string[] validFunctionTypes = Enum.GetNames<FunctionTypeEnum>();

    public UpdateKPICommandValidator()
    {
        // 1. Primary ID Validation (Crucial for updates)
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("KPI ID is required for update.")
            .Must(id => id != Guid.Empty)
            .WithMessage("KPI ID must be a valid, non-empty GUID.");

        // 4. FunctionType (Optional String?) - Check only if provided
        RuleFor(x => x.FunctionType)
            .MaximumLength(100)
            .WithMessage("Function Type cannot exceed 100 characters.")
                .Must(type => validFunctionTypes.Contains(type))
                .WithMessage($"FunctionType must be one of: {string.Join(", ", validFunctionTypes)}.")
            .When(x => !string.IsNullOrWhiteSpace(x.FunctionType));

        // 5. Name (Optional String?) - Check only if provided
        RuleFor(x => x.Name)
            .MinimumLength(5)
            .WithMessage("KPI Name must be at least 5 characters long.")
            .MaximumLength(250)
            .WithMessage("KPI Name cannot exceed 250 characters.")
            .When(x => !string.IsNullOrWhiteSpace(x.Name));

        // 6. Description (Optional String?) - Check only if provided
        RuleFor(x => x.Description)
            .MaximumLength(1000)
            .WithMessage("Description cannot exceed 1000 characters.")
            .When(x => !string.IsNullOrWhiteSpace(x.Description));

        RuleFor(x => x.Status)
            .Must(status => validStatuses.Contains(status, StringComparer.OrdinalIgnoreCase))
            .WithMessage($"Status must be one of the following: {string.Join(", ", validStatuses)}.")
            .When(x => !string.IsNullOrWhiteSpace(x.Status));

        RuleFor(x => x.IsOfficeMandate)
            .NotNull()
            .WithMessage("Is Office Mandate must be provided (true or false).");

        RuleFor(x => x.IsPercentage)
            .NotNull()
            .WithMessage("Is Percentage must be provided (true or false).");

        RuleFor(x => x.IsTargetValueAllocable)
            .NotNull()
            .WithMessage("Is Target Value Allocable must be provided (true or false).");

        // 8. SDGIds (List<Guid>) - Optional for partial update
        RuleFor(x => x.SDGIds)
            .ForEach(sdgId => sdgId.NotEmpty().WithMessage("SDG ID must be a valid, non-empty GUID."))
            .When(x => x.SDGIds != null && x.SDGIds.Any());

        // 9. KPIRatings (List<CreateKPIRatingRequest>) - Optional for partial update
        RuleFor(x => x.KPIRatings)
            .NotNull()
            .WithMessage("KPI Ratings list cannot be null.")
            .When(x => x.KPIRatings != null);

        // 10. KPITargets (List<CreateKPITargetRequest>) - Optional for partial update
        RuleFor(x => x.KPITargets)
            .NotNull()
            .WithMessage("KPI Targets list cannot be null.")
            .When(x => x.KPITargets != null);

        // 11. KPIMOVs (List<CreateKPIMOVRequest>) - Optional for partial update
        RuleFor(x => x.KPIMOVs)
            .NotNull()
            .WithMessage("KPI Mode of Verifications list cannot be null.")
            .When(x => x.KPIMOVs != null);

        // 12. MFOPAPIds (List<Guid>) - Optional for partial update
        RuleFor(x => x.MFOPAPIds)
            .ForEach(mfopapId => mfopapId.NotEmpty().WithMessage("MFOPAP ID must be a valid, non-empty GUID."))
            .When(x => x.MFOPAPIds != null && x.MFOPAPIds.Any());

        // 13. Attributes (List<Guid>) - Optional for partial update
        RuleFor(x => x.Attributes)
            .ForEach(attrId => attrId.NotEmpty().WithMessage("Attribute ID must be a valid, non-empty GUID."))
            .When(x => x.Attributes != null && x.Attributes.Any());

    }
}
