using ERPEZ.Application.Features.Procurement.DirectAcquisitions.Dtos;
using ERPEZ.Shared.Common;
using MediatR;
using Sieve.Models;

namespace ERPEZ.Application.Features.Procurement.DirectAcquisitions.Queries.GetDirectAcquisitions;

public class GetDirectAcquisitionsQuery : SieveModel, IRequest<PaginatedApiResponse<DirectAcquisitionResponse>>
{
}
