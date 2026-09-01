using ERPEZ.Application.Features.Procurement.DirectAcquisitions.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.DirectAcquisitions.Queries.GetDirectAcquisitionSummary;

public class GetDirectAcquisitionSummaryQuery : IRequest<ApiResponse<DirectAcquisitionSummaryResponse>>
{
}
