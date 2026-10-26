using System;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Application.Features.Procurement.NoticeToProceeds.Dtos;
using ERPEZ.Application.Features.Procurement.NoticeToProceeds.Queries.GetNoticeToProceedById;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.NoticeToProceeds.Queries.GetNoticeToProceedByContractId;

public class GetNoticeToProceedByContractIdQueryHandler(IUnitOfWork unitOfWork, ISender mediator)
    : IRequestHandler<GetNoticeToProceedByContractIdQuery, ApiResponse<NoticeToProceedDetailDto?>>
{
    public async Task<ApiResponse<NoticeToProceedDetailDto?>> Handle(GetNoticeToProceedByContractIdQuery request, CancellationToken cancellationToken)
    {
        var ntp = await unitOfWork.NoticeToProceedRepository.GetByContractIdWithDetailsAsync(request.ContractId, cancellationToken);
        if (ntp == null)
        {
            return ApiResponse<NoticeToProceedDetailDto?>.Success(null);
        }

        var detailResult = await mediator.Send(new GetNoticeToProceedByIdQuery(ntp.Id), cancellationToken);
        return ApiResponse<NoticeToProceedDetailDto?>.Success(detailResult.Data);
    }
}
