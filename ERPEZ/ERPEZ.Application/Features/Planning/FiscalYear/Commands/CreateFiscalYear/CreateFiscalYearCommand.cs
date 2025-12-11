using ERPEZ.Application.Features.Planning.FiscalYear.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.FiscalYear.Commands.CreateFiscalYear;

public record CreateFiscalYearCommand : IRequest<ApiResponse<Guid>>
{
    public int Year { get; init; }
    public string? Description { get; init; }
    public List<FunctionAllocationRequest> FunctionAllocations { get; init; } = [];
}
