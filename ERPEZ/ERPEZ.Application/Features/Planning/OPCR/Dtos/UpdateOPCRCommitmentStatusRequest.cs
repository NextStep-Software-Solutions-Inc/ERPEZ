// UpdateOPCRCommitmentStatusRequest.cs
namespace ERPEZ.Application.Features.Planning.OPCR.Dtos;

public record UpdateOPCRCommitmentStatusRequest
{
    public required string CommitmentStatus { get; set; }
}
