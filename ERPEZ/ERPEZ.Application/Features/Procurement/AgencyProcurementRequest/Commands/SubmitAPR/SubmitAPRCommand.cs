using MediatR;

namespace ERPEZ.Application.Features.Procurement.APRs.Commands.SubmitAPR;

public class SubmitAPRCommand : IRequest<string>
{
    public Guid Id { get; set; }
}
