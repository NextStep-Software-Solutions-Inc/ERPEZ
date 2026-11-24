using System;

namespace ERPEZ.Application.Features.Procurement.DirectAcquisitions.Dtos;

public class ApproveDirectAcquisitionRequest
{
    public Guid? ApprovedFileId { get; set; }
    public string? ApprovedFileName { get; set; }
    public string? ApprovedFileType { get; set; } = "pdf";
}
