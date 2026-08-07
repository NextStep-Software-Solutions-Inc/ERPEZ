using ERPEZ.Application.Features.Planning.ProcurementItem.Dtos;
using ERPEZ.Shared.Common;
using MediatR;
using Sieve.Models;

namespace ERPEZ.Application.Features.Planning.ProcurementItem.Queries.GetProcurementItems;

public record GetProcurementItemsQuery(SieveModel SieveModel) : IRequest<PaginatedApiResponse<ProcurementItemResponse>>;
