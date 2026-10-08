// ERPEZ.Domain/Entities/Procurement/BiddingDocumentConsultingDetail.cs — NEW (stub)
using ERPEZ.Domain.Common;

namespace ERPEZ.Domain.Entities.Procurement;

/// <summary>Phase 0A structured fields specific to Consulting Services category PBDs. Built out under TC-02.</summary>
public class BiddingDocumentConsultingDetail : TenantScopedEntity
{
    public Guid BiddingDocumentId { get; set; }
    public virtual BiddingDocument BiddingDocument { get; set; } = null!;
}