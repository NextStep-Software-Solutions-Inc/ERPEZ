using ERPEZ.Application.Features.Planning.KPI.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.KPI.Commands.UpdateKPI;

public class UpdateKPICommand : IRequest<ApiResponse<KPIResponse>>
{
    public Guid Id { get; set; }
    public required UpdateKPIRequest UpdateKPI { get; set; }
}

