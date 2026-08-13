using ERPEZ.Application.Features.Planning.PPMP.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.PPMP.Queries.GetPPMPApprovalHistory;

public class GetPPMPApprovalHistoryQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetPPMPApprovalHistoryQuery, ApiResponse<List<ApprovalEventResponse>>>
{
    public async Task<ApiResponse<List<ApprovalEventResponse>>> Handle(GetPPMPApprovalHistoryQuery query, CancellationToken cancellationToken)
    {
        var approvalEvents = await unitOfWork.ApprovalEventRepository.GetApprovalHistoryAsync(query.PPMPId, cancellationToken);

        var response = approvalEvents.Select(evt => new ApprovalEventResponse
        {
            Id = evt.Id,
            PPMPId = evt.PPMPId,
            Role = evt.Role,
            Action = evt.Action,
            ActorId = evt.ActorId,
            ActorName = evt.ActorName,
            Notes = evt.Notes,
            Timestamp = evt.Timestamp
        }).ToList();

        return ApiResponse<List<ApprovalEventResponse>>.Success(response);
    }
}
