using ERPEZ.Application.Features.Planning.KPI.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.KPI.Commands.CreateKPI;

public class CreateKPICommand : IRequest<ApiResponse<KPIDto>>
{
    public Guid? ParentKPIId { get; set; }
    public string FunctionType { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; } = string.Empty;
    public bool? IsOfficeMandate { get; set; }
}
