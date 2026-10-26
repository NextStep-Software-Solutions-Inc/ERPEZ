using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.FiscalYear.Queries.GetFiscalYearById;

public class GetFiscalYearByIdQuery : IRequest<ApiResponse<ERPEZ.Application.Features.Planning.FiscalYear.Dtos.FiscalYearResponse>>
{
    public Guid Id { get; }
    public GetFiscalYearByIdQuery(Guid id) => Id = id;
}
