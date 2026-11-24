namespace ERPEZ.Application.Features.Planning.WorkflowMatrix.Dtos;

public record WorkflowMatrixResponse
{
    public Guid Id { get; init; }
    public Guid FiscalYearId { get; init; }
    public int FiscalYear { get; init; }
    public Guid OfficeId { get; init; }
    public string OfficeName { get; init; } = string.Empty;
    public string? DocumentType { get; init; }
    public string Status { get; init; } = string.Empty;
    
    // Nested approver information
    public ApproverInfo RecommendingApprover { get; init; } = new();
    public ApproverInfo FinalApprover { get; init; } = new();
    
    public DateTime CreatedAt { get; init; }
    public string CreatedBy { get; init; } = string.Empty;
    public DateTime? UpdatedAt { get; init; }
    public string? UpdatedBy { get; init; }
}

/// <summary>
/// Approver details including position and current user assignment
/// </summary>
public record ApproverInfo
{
    /// <summary>
    /// Position details (organizational structure)
    /// </summary>
    public PositionInfo Position { get; init; } = new();
    
    /// <summary>
    /// Current user assigned to this position (null if position is vacant)
    /// </summary>
    public UserInfo? CurrentUser { get; init; }
}

/// <summary>
/// Position information
/// </summary>
public record PositionInfo
{
    public Guid Id { get; init; }
    public string Title { get; init; } = string.Empty;
    public string Code { get; init; } = string.Empty;
}

/// <summary>
/// User information (resolved from PersonnelPosition at runtime)
/// </summary>
public record UserInfo
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string Email { get; init; } = string.Empty;
}
