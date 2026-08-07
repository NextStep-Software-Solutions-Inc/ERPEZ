// ERPEZ.Domain/Entities/Procurement/BiddingDocumentGoodsDetail.cs — NEW (stub)
using ERPEZ.Domain.Common;

namespace ERPEZ.Domain.Entities.Procurement;

/// <summary>Phase 0A structured fields specific to Goods category PBDs. Built out under TC-02.</summary>
public class BiddingDocumentGoodsDetail : BaseEntity
{
    public Guid BiddingDocumentId { get; set; }
    public virtual BiddingDocument BiddingDocument { get; set; } = null!;
}