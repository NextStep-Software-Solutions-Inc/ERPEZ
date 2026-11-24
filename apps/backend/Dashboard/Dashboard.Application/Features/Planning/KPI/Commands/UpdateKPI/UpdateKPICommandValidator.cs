using ERPEZ.Domain.Enums;
using FluentValidation;

namespace ERPEZ.Application.Features.Planning.KPI.Commands.UpdateKPI;

public class UpdateKPICommandValidator : AbstractValidator<UpdateKPICommand>
{
    private readonly string[] validStatuses = Enum.GetNames<StatusEnum>();

    public UpdateKPICommandValidator()
    {
        // 1. Primary ID Validation (Crucial for updates)
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("KPI ID is required for update.")
            .Must(id => id != Guid.Empty)
            .WithMessage("KPI ID must be a valid, non-empty GUID.");

        // TODO: Version 2 - FunctionType replaced with FunctionCategory
        // // 4. FunctionType (Optional String?) - Check only if provided
        // RuleFor(x => x.Dto.FunctionType)
        //     .MaximumLength(100)
        //     .WithMessage("Function Type cannot exceed 100 characters.")
        //     .Must(type => validFunctionTypes.Contains(type))
        //     .WithMessage($"FunctionType must be one of: {string.Join(", ", validFunctionTypes)}.")
        //     .When(x => !string.IsNullOrWhiteSpace(x.Dto.FunctionType));

        // 5. Name (Optional String?) - Check only if provided
        RuleFor(x => x.Dto.Name)
            .MinimumLength(5)
            .WithMessage("KPI Name must be at least 5 characters long.")
            .MaximumLength(250)
            .WithMessage("KPI Name cannot exceed 250 characters.")
            .When(x => !string.IsNullOrWhiteSpace(x.Dto.Name));

        // 6. Description (Optional String?) - Check only if provided
        RuleFor(x => x.Dto.Description)
            .MaximumLength(1000)
            .WithMessage("Description cannot exceed 1000 characters.")
            .When(x => !string.IsNullOrWhiteSpace(x.Dto.Description));

        RuleFor(x => x.Dto.Status)
            .Must(status => validStatuses.Contains(status, StringComparer.OrdinalIgnoreCase))
            .WithMessage($"Status must be one of the following: {string.Join(", ", validStatuses)}.")
            .When(x => !string.IsNullOrWhiteSpace(x.Dto.Status));

        // TODO: Version 2 - Legacy boolean flags commented out
        // // Optional boolean flags: IsFixed, IsGlobal, IsMultiple, IsActive accept true/false/null (not provided)
        // RuleFor(x => x.Dto.IsFixed)
        //     .Must(val => !val.HasValue || val is bool)
        //     .WithMessage("IsFixed must be a boolean value if provided.");

        // RuleFor(x => x.Dto.IsGlobal)
        //     .Must(val => !val.HasValue || val is bool)
        //     .WithMessage("IsGlobal must be a boolean value if provided.");

        // RuleFor(x => x.Dto.IsMultiple)
        //     .Must(val => !val.HasValue || val is bool)
        //     .WithMessage("IsMultiple must be a boolean value if provided.");

        // RuleFor(x => x.Dto.IsActive)
        //     .Must(val => !val.HasValue || val is bool)
        //     .WithMessage("IsActive must be a boolean value if provided.");

        // RuleFor(x => x.Dto.IsAverage)
        //     .Must(val => !val.HasValue || val is bool)
        //     .WithMessage("IsAverage must be a boolean value if provided.");

        // 8. SDGIds (List<Guid>) - Optional for partial update
        RuleFor(x => x.Dto.SDGIds)
            .ForEach(sdgId => sdgId.NotEmpty().WithMessage("SDG ID must be a valid, non-empty GUID."))
            .When(x => x.Dto.SDGIds != null && x.Dto.SDGIds.Count != 0);

        // 9. MFOPAPId (Guid?) - Optional for partial update
        RuleFor(x => x.Dto.MFOPAPId)
            .Must(id => !id.HasValue || id.Value != Guid.Empty)
            .WithMessage("If provided, the MFOPAP ID must be a valid, non-empty GUID.")
            .When(x => x.Dto.MFOPAPId.HasValue);

        // 10. Attributes (List<Guid>) - Optional for partial update
        RuleFor(x => x.Dto.AttributeIds)
            .ForEach(attrId => attrId.NotEmpty()
            .WithMessage("Attribute ID must be a valid, non-empty GUID."))
            .When(x => x.Dto.AttributeIds != null && x.Dto.AttributeIds.Count != 0);

    }
}
