using ERPEZ.Domain.Enums;
using MediatR;
using ERPEZ.Shared.Common;

namespace ERPEZ.Application.Features.Procurement.AgencyProcurementRequest.Commands.ChangeAPRStatus;

public class ChangeAPRStatusCommand : IRequest<ApiResponse<Guid>>
{
    public Guid Id { get; set; }
    public StatusEnum Status { get; set; }
    public string? Remarks { get; set; }
}
