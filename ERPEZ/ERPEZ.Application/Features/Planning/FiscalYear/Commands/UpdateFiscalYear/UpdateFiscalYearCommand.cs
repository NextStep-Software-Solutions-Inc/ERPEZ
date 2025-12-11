using ERPEZ.Application.Features.Planning.FiscalYear.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.FiscalYear.Commands.UpdateFiscalYear;

public record UpdateFiscalYearCommand : IRequest<ApiResponse<Unit>>
{
    public Guid Id { get; init; }
    public string? Description { get; init; }
    public List<FunctionAllocationRequest> FunctionAllocations { get; init; } = [];
}
