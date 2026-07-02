using MediatR;

namespace ERPEZ.Application.Planning.APRs.Commands.SubmitAPR;

public class SubmitAPRCommand : IRequest<string>
{
    public Guid Id { get; set; }
}
