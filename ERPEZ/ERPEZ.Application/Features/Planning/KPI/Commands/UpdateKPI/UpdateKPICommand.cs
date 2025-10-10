using ERPEZ.Application.Features.Planning.KPI.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.KPI.Commands.UpdateKPI;

public class UpdateKPICommand : IRequest<ApiResponse<Domain.Entities.Planning.KPI>>
{
    public Guid Id { get; set; }
    public required UpdateKPIDto UpdateKPI { get; set; }
}

