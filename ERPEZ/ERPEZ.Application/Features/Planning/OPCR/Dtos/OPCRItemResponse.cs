using ERPEZ.Application.Features.Planning.KPIAssignment.Dtos;
using ERPEZ.Application.Features.Planning.OPCRActivity.Dtos;
using ERPEZ.Application.Features.Planning.OPCRItemRating.Dtos; 
using ERPEZ.Application.Features.Planning.OPCRItemMOV.Dtos; 

namespace ERPEZ.Application.Features.Planning.OPCR.Dtos;

public record OPCRItemResponse
{
    public Guid Id { get; init; }
    public Guid OPCRId { get; init; }
    public Guid KPIAssignmentId { get; init; }

    // ✅ Add this — denormalized shortcut so FE can group without drilling
    public string? FunctionCategory { get; init; }
    public int Q1Target { get; init; }
    public int Q2Target { get; init; }
    public int Q3Target { get; init; }
    public int Q4Target { get; init; }
    public bool IsShopped { get; init; }
    public string? ActualAccomplishment { get; init; }
    public string? Justification { get; init; }
    public KPIAssignmentResponse? KPIAssignment { get; init; }
    public List<OPCRActivityResponse> OPCRActivities { get; init; } = [];
    public List<OPCRItemRatingResponse> OPCRItemRatings { get; init; } = [];
    public List<OPCRItemMOVResponse> OPCRItemMOVs { get; init; } = [];  
    public DateTime CreatedAt { get; init; }
    public string CreatedBy { get; init; } = string.Empty;
}