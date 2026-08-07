using System;
using ERPEZ.Application.Features.Procurement.DirectContractings.Dtos;
using ERPEZ.Shared.Common;
using MediatR;
using Sieve.Models;

namespace ERPEZ.Application.Features.Procurement.DirectContractings.Queries.GetDirectContractings;

public class GetDirectContractingsQuery : SieveModel, IRequest<PaginatedApiResponse<DirectContractingResponse>>
{
}
