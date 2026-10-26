using System;
using System.Collections.Generic;
using ERPEZ.Application.Features.Procurement.BidEvaluations.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.BidEvaluations.Queries.GetProjectBiddingSubmissions;

public record GetProjectBiddingSubmissionsQuery(Guid ProjectId) : IRequest<ApiResponse<List<BiddingSubmissionResponse>>>;
