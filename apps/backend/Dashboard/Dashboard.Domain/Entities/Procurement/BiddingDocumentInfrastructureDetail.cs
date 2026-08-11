// ERPEZ.Domain/Entities/Procurement/BiddingDocumentInfrastructureDetail.cs — NEW (stub)
using ERPEZ.Domain.Common;

namespace ERPEZ.Domain.Entities.Procurement;

/// <summary>Phase 0A structured fields specific to Infrastructure category PBDs. Built out under TC-02.</summary>
public class BiddingDocumentInfrastructureDetail : BaseEntity
{
    public Guid BiddingDocumentId { get; set; }
    public virtual BiddingDocument BiddingDocument { get; set; } = null!;
}