using ERPEZ.Application.Features.Procurement.DirectContractings.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.DirectContractings.Queries.GetDirectContractingSummary;

public record GetDirectContractingSummaryQuery : IRequest<ApiResponse<DirectContractingSummaryDto>>;
