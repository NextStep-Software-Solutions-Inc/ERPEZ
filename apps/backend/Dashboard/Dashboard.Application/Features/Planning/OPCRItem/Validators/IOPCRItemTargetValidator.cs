using ERPEZ.Domain.Enums;

namespace ERPEZ.Application.Features.Planning.OPCRItem.Validators;

public interface IOPCRItemTargetValidator
{
    void Validate(
        string kpiName,
        DistributionBehaviorEnum distributionBehavior,
        bool isLocked,
        bool isShopped,
        decimal assignedAnnualTarget,
        decimal? assignedQ1,
        decimal? assignedQ2,
        decimal? assignedQ3,
        decimal? assignedQ4,
        decimal q1,
        decimal q2,
        decimal q3,
        decimal q4);
}
