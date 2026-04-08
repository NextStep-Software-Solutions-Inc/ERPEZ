using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Object.Commands.CreateObject;

public class CreateObjectCommand : IRequest<ApiResponse<Guid>>
{
    public Guid? ParentId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public Guid? FiscalYearId { get; set; }
}
