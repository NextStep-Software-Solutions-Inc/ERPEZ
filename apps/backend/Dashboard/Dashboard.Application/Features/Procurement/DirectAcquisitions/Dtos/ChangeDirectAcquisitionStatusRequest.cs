using ERPEZ.Domain.Enums;

namespace ERPEZ.Application.Features.Procurement.DirectAcquisitions.Dtos;

public class ChangeDirectAcquisitionStatusRequest
{
    public DirectAcquisitionStatusEnum Status { get; set; }
}
