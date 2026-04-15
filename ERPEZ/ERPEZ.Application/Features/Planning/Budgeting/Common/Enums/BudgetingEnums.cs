namespace ERPEZ.Application.Features.Planning.Budgeting.Common.Enums;

public enum SourceDocumentTypeEnum
{
    NEPGAA,
    PRE,
    MOA,
    Others
}

public enum CeilingStatusEnum
{
    Draft,
    Indicative,
    Final,
    Locked
}

public enum CeilingTargetTypeEnum
{
    OrganizationalUnit,
    WFP
}

public enum LIBLevelEnum
{
    Office,
    Department
}

public enum LIBSourceTypeEnum
{
    OPCR,
    WFP
}

public enum LIBStatusEnum
{
    Draft,
    Submitted,
    Approved,
    Returned,
    Consolidated
}

public enum LIBTimelineTypeEnum
{
    Monthly,
    Quarterly
}

public enum LIBAmendmentReasonEnum
{
    UnforeseenModification,
    Reassessment,
    AdditionalRequirements
}

public enum LIBAmendmentStatusEnum
{
    Draft,
    Submitted,
    Approved,
    Returned
}