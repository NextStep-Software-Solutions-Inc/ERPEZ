using ERPEZ.Application.Features.Planning.FiscalYear.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.FiscalYear.Commands.CreateFiscalYear;

public class CreateFiscalYearCommand : IRequest<ApiResponse<FiscalYearResponse>>
{
    public int Year { get; set; }
    public string? Description { get; set; }
    public List<FunctionAllocationRequest> FunctionAllocations { get; set; } = [];
}
