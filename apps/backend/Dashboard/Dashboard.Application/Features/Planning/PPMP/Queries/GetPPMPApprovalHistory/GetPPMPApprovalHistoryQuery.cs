using ERPEZ.Application.Features.Planning.PPMP.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.PPMP.Queries.GetPPMPApprovalHistory;

public record GetPPMPApprovalHistoryQuery(Guid PPMPId) : IRequest<ApiResponse<List<ApprovalEventResponse>>>;
