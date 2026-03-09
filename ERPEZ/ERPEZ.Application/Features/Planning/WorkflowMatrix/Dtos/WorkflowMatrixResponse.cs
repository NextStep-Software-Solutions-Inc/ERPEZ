namespace ERPEZ.Application.Features.Planning.WorkflowMatrix.Dtos;

public record WorkflowMatrixResponse
{
    public Guid Id { get; init; }
    public Guid FiscalYearId { get; init; }
    public int FiscalYear { get; init; }
    public Guid OfficeId { get; init; }
    public string OfficeName { get; init; } = string.Empty;
    public string? DocumentType { get; init; }
    
    // Position information
    public Guid RecommendingApproverPositionId { get; init; }
    public string RecommendingApproverPositionTitle { get; init; } = string.Empty;
    
    public Guid FinalApproverPositionId { get; init; }
    public string FinalApproverPositionTitle { get; init; } = string.Empty;
    
    // Resolved user information (who currently holds the positions)
    public Guid? RecommendingApproverId { get; init; }
    public string? RecommendingApproverName { get; init; }
    
    public Guid? FinalApproverId { get; init; }
    public string? FinalApproverName { get; init; }
    
    public DateTime CreatedAt { get; init; }
    public string CreatedBy { get; init; } = string.Empty;
    public DateTime? UpdatedAt { get; init; }
    public string? UpdatedBy { get; init; }
}
