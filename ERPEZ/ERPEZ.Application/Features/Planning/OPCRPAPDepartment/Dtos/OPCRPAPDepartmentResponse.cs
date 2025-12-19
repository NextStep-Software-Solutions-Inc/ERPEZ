using ERPEZ.Application.Features.Planning.DeliveryUnit.Dtos;

namespace ERPEZ.Application.Features.Planning.OPCRPAPDepartment.Dtos;

public record OPCRPAPDepartmentResponse
{
    public Guid Id { get; init; }
    public Guid OPCRActivityId { get; init; }
    public required DeliveryUnitResponse DeliveryUnit { get; init; }
}
