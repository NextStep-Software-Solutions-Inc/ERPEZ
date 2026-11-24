using System;
using ERPEZ.Application.Features.Procurement.NoticeToProceeds.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.NoticeToProceeds.Queries.GetNoticeToProceedByContractId;

public record GetNoticeToProceedByContractIdQuery(Guid ContractId) : IRequest<ApiResponse<NoticeToProceedDetailDto?>>;
