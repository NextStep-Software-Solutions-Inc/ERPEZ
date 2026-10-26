using System;
using ERPEZ.Application.Features.Procurement.BidEvaluations.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.BidEvaluations.Queries.GetProjectBidEvaluation;

public record GetProjectBidEvaluationQuery(Guid ProjectId) : IRequest<ApiResponse<BiddingEvaluationResponse>>;
