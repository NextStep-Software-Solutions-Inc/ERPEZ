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
        int q1,
        int q2,
        int q3,
        int q4);
}
