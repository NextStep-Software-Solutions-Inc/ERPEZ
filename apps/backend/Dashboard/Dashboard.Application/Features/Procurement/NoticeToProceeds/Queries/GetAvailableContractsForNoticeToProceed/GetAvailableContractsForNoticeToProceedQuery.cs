using System.Collections.Generic;
using ERPEZ.Application.Features.Procurement.NoticeToProceeds.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.NoticeToProceeds.Queries.GetAvailableContractsForNoticeToProceed;

public record GetAvailableContractsForNoticeToProceedQuery : IRequest<ApiResponse<List<AvailableContractForNoticeToProceedDto>>>;
