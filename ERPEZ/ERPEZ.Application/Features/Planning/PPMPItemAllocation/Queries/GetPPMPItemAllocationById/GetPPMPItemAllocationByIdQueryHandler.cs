using ERPEZ.Application.Features.Planning.PPMPItemAllocation.Dtos;
using ERPEZ.Application.Features.Planning.PPMP.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Exceptions;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.PPMPItemAllocation.Queries.GetPPMPItemAllocationById;

public class GetPPMPItemAllocationByIdQueryHandler(IUnitOfWork unitOfWork) 
    : IRequestHandler<GetPPMPItemAllocationByIdQuery, ApiResponse<PPMPItemAllocationResponse>>
{
    public async Task<ApiResponse<PPMPItemAllocationResponse>> Handle(
        GetPPMPItemAllocationByIdQuery query, 
        CancellationToken cancellationToken)
    {
        var allocation = await unitOfWork.PPMPItemAllocationRepository.GetByIdWithDetailsAsync(query.Id, cancellationToken);
        if (allocation == null)
            throw new NotFoundException("PPMP Item Allocation not found.");

        return ApiResponse<PPMPItemAllocationResponse>.Success(PPMPResponseMapper.MapAllocation(allocation));
    }
}
