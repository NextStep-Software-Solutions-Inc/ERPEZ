using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.Projects.Commands.CreateProcurementProject;

public record CreateProcurementProjectCommand : IRequest<ApiResponse<Guid>>
{
    public required string Title { get; init; }
    public required decimal ABC { get; init; }
    public string Status { get; init; } = "Draft";
    public string ResolutionType { get; init; } = "Recommend Mode of Procurement";
    public string ResolutionNumber { get; init; } = string.Empty;
    public DateTime DateResolved { get; init; } = DateTime.UtcNow;
    public string? WhereasClause { get; init; }
    public Guid? EndUserRepresentativeId { get; init; }
    public Guid? TechRepresentativeId { get; init; }
}
