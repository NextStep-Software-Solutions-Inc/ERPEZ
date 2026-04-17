using ERPEZ.Application.Features.Planning.PPMPExpenditureItem.Dtos;
using ERPEZ.Shared.Common;
using MediatR;
using Sieve.Models;

namespace ERPEZ.Application.Features.Planning.PPMPExpenditureItem.Queries.GetPPMPExpenditureItems;

public record GetPPMPExpenditureItemsQuery(SieveModel SieveModel) : IRequest<PaginatedApiResponse<PPMPExpenditureItemResponse>>;
