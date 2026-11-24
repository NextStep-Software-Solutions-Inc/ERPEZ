using ERPEZ.Domain.Enums;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.RequestForQuotation.Commands.ChangeRFQStatus;

public class ChangeRFQStatusCommand : IRequest<ApiResponse<bool>>
{
    public Guid RFQId { get; set; }
    public StatusEnum Status { get; set; }
    public string? Remarks { get; set; }
}
