using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.TenantManagement.Application.Features.Inquiries.Commands.UpdateInquiryStatus;

public class UpdateInquiryStatusCommand : IRequest<ApiResponse<bool>>
{
    public string ReferenceCode { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string? Notes { get; set; }
    public string? AssignedTo { get; set; }
}
