using MediatR;

namespace ERPEZ.Application.Features.Procurement.AgencyProcurementRequest.Commands.SubmitAPR;

public class SubmitAPRCommand : IRequest<string>
{
    public Guid Id { get; set; }
}
