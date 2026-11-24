using ERPEZ.Domain.Enums;

namespace ERPEZ.Application.Features.Procurement.DirectContractings.Dtos;

public record ChangeDirectContractingStatusRequest
{
    public DirectContractingStatusEnum Status { get; init; }
}
