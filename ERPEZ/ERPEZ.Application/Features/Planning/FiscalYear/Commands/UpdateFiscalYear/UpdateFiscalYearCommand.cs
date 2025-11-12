using ERPEZ.Application.Features.Planning.FiscalYear.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.FiscalYear.Commands.UpdateFiscalYear;

public class UpdateFiscalYearCommand : IRequest<ApiResponse<FiscalYearResponse>>
{
    public Guid Id { get; set; }
    public string? Description { get; set; }
    public List<FunctionAllocationRequest> FunctionAllocations { get; set; } = new();
}
