using ERPEZ.Application.Features.Planning.OPCRActivity.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCRActivity.Queries.GetOPCRActivityById;

public class GetOPCRActivityByIdQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetOPCRActivityByIdQuery, ApiResponse<OPCRActivityResponse>>
{
    public async Task<ApiResponse<OPCRActivityResponse>> Handle(GetOPCRActivityByIdQuery request, CancellationToken cancellationToken)
    {
        var getOPCRActivitieQuery = unitOfWork.OPCRActivityRepository
            .Query(t => t.Id == request.Id)
            .Select(t => new OPCRActivityResponse
            {
                Id = t.Id,
                OPCRId = t.OPCRId,
                DUKPIAssignmentId = t.DUKPIAssignmentId,
                Name = t.Name,
                Description = t.Description,
                Budget = t.Budget,
                PAPDepartments = t.OPCRPAPDepartments.Select(p => p.DeliveryUnitId).ToList()
            });

        var response = await unitOfWork.OPCRActivityRepository.GetSingleAsync(getOPCRActivitieQuery, cancellationToken) ?? throw new NotFoundException("No data found.");

        return ApiResponse<OPCRActivityResponse>.Success(response, "Retrieved successfully");
    }
}
