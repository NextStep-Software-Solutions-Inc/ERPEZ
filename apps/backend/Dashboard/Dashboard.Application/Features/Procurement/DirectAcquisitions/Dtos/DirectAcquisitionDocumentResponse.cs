using System;

namespace ERPEZ.Application.Features.Procurement.DirectAcquisitions.Dtos;

public class DirectAcquisitionDocumentResponse
{
    public Guid Id { get; set; }
    public Guid DirectAcquisitionId { get; set; }
    public Guid? DirectPurchaseEntryId { get; set; }
    public Guid FileId { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string? FileType { get; set; }
    public string? BlobUrl { get; set; }
    public string DocumentType { get; set; } = string.Empty;
    public DateTime UploadedAt { get; set; }
}
