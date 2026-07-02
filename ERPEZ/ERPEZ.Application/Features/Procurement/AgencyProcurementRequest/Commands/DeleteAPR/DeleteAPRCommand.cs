using MediatR;

namespace ERPEZ.Application.Features.Procurement.AgencyProcurementRequest.Commands.DeleteAPR;

public record DeleteAPRCommand : IRequest<Unit>
{
    public Guid Id { get; init; }
}
