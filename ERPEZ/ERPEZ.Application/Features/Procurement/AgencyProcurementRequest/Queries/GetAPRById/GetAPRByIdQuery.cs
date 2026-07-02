using ERPEZ.Application.Features.Procurement.AgencyProcurementRequest.Dtos;
using MediatR;

namespace ERPEZ.Application.Planning.APRs.Queries.GetAPRById;

public class GetAPRByIdQuery : IRequest<APRDetailDto>
{
    public Guid Id { get; set; }
}
