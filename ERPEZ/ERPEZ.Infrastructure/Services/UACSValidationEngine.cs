using ERPEZ.Application.Features.Planning.UACSValidation.Dtos;
using ERPEZ.Application.Interfaces;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;

namespace ERPEZ.Infrastructure.Services;

/// <summary>
/// Service for validating UACS code combinations using a rules engine.
/// </summary>
public class UACSValidationEngine : IUACSValidationEngine
{
    private readonly IUnitOfWork unitOfWork;

    public UACSValidationEngine(IUnitOfWork unitOfWork)
    {
        this.unitOfWork = unitOfWork;
    }

    /// <inheritdoc/>
    public async Task<UACSValidationResultResponse> ValidateCombinationAsync(
        Guid fundSourceId,
        Guid organizationId,
        Guid locationId,
        Guid mfopapId,
        Guid objectId,
        CancellationToken cancellationToken = default)
    {
        var messages = new List<ValidationMessage>();
        var appliedRules = new List<AppliedRule>();

        var fundSource = await unitOfWork.FundSourceRepository.GetByIdAsync(fundSourceId, cancellationToken);
        if (fundSource == null)
        {
            messages.Add(new ValidationMessage
            {
                Severity = "Error",
                Message = $"FundSource with ID {fundSourceId} not found."
            });
            return new UACSValidationResultResponse
            {
                IsValid = false,
                Messages = messages,
                AppliedRules = appliedRules
            };
        }

        var organization = await unitOfWork.OrganizationRepository.GetByIdAsync(organizationId, cancellationToken);
        if (organization == null)
        {
            messages.Add(new ValidationMessage
            {
                Severity = "Error",
                Message = $"Organization with ID {organizationId} not found."
            });
            return new UACSValidationResultResponse
            {
                IsValid = false,
                Messages = messages,
                AppliedRules = appliedRules
            };
        }

        var location = await unitOfWork.LocationRepository.GetByIdAsync(locationId, cancellationToken);
        if (location == null)
        {
            messages.Add(new ValidationMessage
            {
                Severity = "Error",
                Message = $"Location with ID {locationId} not found."
            });
            return new UACSValidationResultResponse
            {
                IsValid = false,
                Messages = messages,
                AppliedRules = appliedRules
            };
        }

        var mfopap = await unitOfWork.MFOPAPRepository.GetByIdAsync(mfopapId, cancellationToken);
        if (mfopap == null)
        {
            messages.Add(new ValidationMessage
            {
                Severity = "Error",
                Message = $"MFOPAP with ID {mfopapId} not found."
            });
            return new UACSValidationResultResponse
            {
                IsValid = false,
                Messages = messages,
                AppliedRules = appliedRules
            };
        }

        var obj = await unitOfWork.ObjectRepository.GetByIdAsync(objectId, cancellationToken);
        if (obj == null)
        {
            messages.Add(new ValidationMessage
            {
                Severity = "Error",
                Message = $"Object with ID {objectId} not found."
            });
            return new UACSValidationResultResponse
            {
                IsValid = false,
                Messages = messages,
                AppliedRules = appliedRules
            };
        }

        var allRules = await unitOfWork.UACSValidationRuleRepository.ToListAsync(
            unitOfWork.UACSValidationRuleRepository.Query(r => r.IsActive),
            cancellationToken);

        var applicableRules = allRules
            .Where(r =>
                (!r.FundSourceId.HasValue || r.FundSourceId == fundSourceId) &&
                (!r.ObjectId.HasValue || r.ObjectId == objectId) &&
                (!r.LocationId.HasValue || r.LocationId == locationId))
            .OrderBy(r => r.Priority)
            .ToList();

        foreach (var rule in applicableRules)
        {
            var ruleResult = EvaluateRule(rule, fundSourceId, organizationId, locationId, mfopapId, objectId);

            appliedRules.Add(new AppliedRule
            {
                RuleId = rule.Id,
                RuleName = rule.RuleName,
                RuleType = rule.RuleType.ToString(),
                Priority = rule.Priority,
                Passed = ruleResult.Passed
            });

            if (!ruleResult.Passed)
            {
                messages.Add(new ValidationMessage
                {
                    Severity = "Error",
                    Message = rule.ErrorMessage,
                    RuleId = rule.Id,
                    RuleName = rule.RuleName
                });
            }
        }

        var isValid = !messages.Any(m => m.Severity == "Error");

        return new UACSValidationResultResponse
        {
            IsValid = isValid,
            Messages = messages,
            AppliedRules = appliedRules
        };
    }

    private (bool Passed, string? ErrorMessage) EvaluateRule(
        Domain.Entities.Planning.UACSValidationRule rule,
        Guid fundSourceId,
        Guid organizationId,
        Guid locationId,
        Guid mfopapId,
        Guid objectId)
    {
        switch (rule.RuleType)
        {
            case UACSRuleTypeEnum.AllowedCombination:
                return EvaluateAllowedCombination(rule, fundSourceId, organizationId, locationId, mfopapId, objectId);

            case UACSRuleTypeEnum.ForbiddenCombination:
                return EvaluateForbiddenCombination(rule, fundSourceId, organizationId, locationId, mfopapId, objectId);

            case UACSRuleTypeEnum.ConditionalValidation:
                return EvaluateConditionalValidation(rule, fundSourceId, organizationId, locationId, mfopapId, objectId);

            default:
                return (true, null);
        }
    }

    private (bool Passed, string? ErrorMessage) EvaluateAllowedCombination(
        Domain.Entities.Planning.UACSValidationRule rule,
        Guid fundSourceId,
        Guid organizationId,
        Guid locationId,
        Guid mfopapId,
        Guid objectId)
    {
        if (rule.FundSourceId.HasValue && rule.FundSourceId == fundSourceId &&
            rule.ObjectId.HasValue && rule.ObjectId == objectId)
        {
            return (true, null);
        }

        if (rule.FundSourceId.HasValue && rule.FundSourceId != fundSourceId)
        {
            return (false, rule.ErrorMessage);
        }

        if (rule.ObjectId.HasValue && rule.ObjectId != objectId)
        {
            return (false, rule.ErrorMessage);
        }

        return (true, null);
    }

    private (bool Passed, string? ErrorMessage) EvaluateForbiddenCombination(
        Domain.Entities.Planning.UACSValidationRule rule,
        Guid fundSourceId,
        Guid organizationId,
        Guid locationId,
        Guid mfopapId,
        Guid objectId)
    {
        if (rule.FundSourceId.HasValue && rule.FundSourceId == fundSourceId &&
            rule.ObjectId.HasValue && rule.ObjectId == objectId)
        {
            return (false, rule.ErrorMessage);
        }

        if (rule.LocationId.HasValue && rule.LocationId == locationId &&
            rule.ObjectId.HasValue && rule.ObjectId == objectId)
        {
            return (false, rule.ErrorMessage);
        }

        return (true, null);
    }

    private (bool Passed, string? ErrorMessage) EvaluateConditionalValidation(
        Domain.Entities.Planning.UACSValidationRule rule,
        Guid fundSourceId,
        Guid organizationId,
        Guid locationId,
        Guid mfopapId,
        Guid objectId)
    {
        if (string.IsNullOrEmpty(rule.Condition))
        {
            return (true, null);
        }

        return (true, null);
    }
}
