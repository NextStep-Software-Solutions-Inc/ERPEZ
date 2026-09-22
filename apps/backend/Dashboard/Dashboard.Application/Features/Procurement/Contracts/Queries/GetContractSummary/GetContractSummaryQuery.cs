using ERPEZ.Application.Features.Procurement.Contracts.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.Contracts.Queries.GetContractSummary;

public record GetContractSummaryQuery : IRequest<ApiResponse<ContractSummaryDto>>;
