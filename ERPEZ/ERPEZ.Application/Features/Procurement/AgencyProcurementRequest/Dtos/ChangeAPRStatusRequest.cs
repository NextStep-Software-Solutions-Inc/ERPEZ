using ERPEZ.Domain.Enums;

namespace ERPEZ.Application.Features.Procurement.AgencyProcurementRequest.Dtos;

public class ChangeAPRStatusRequest
{
    public StatusEnum Status { get; set; }
    public string? Remarks { get; set; }
}
