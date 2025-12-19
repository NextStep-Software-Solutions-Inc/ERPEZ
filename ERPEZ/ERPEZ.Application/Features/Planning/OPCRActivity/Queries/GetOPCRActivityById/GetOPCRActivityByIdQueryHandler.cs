using ERPEZ.Application.Features.Planning.OPCRActivity.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ERPEZ.Application.Features.Planning.OPCRActivity.Queries.GetOPCRActivityById;

public class GetOPCRActivityByIdQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetOPCRActivityByIdQuery, ApiResponse<OPCRActivityResponse>>
{
    public async Task<ApiResponse<OPCRActivityResponse>> Handle(GetOPCRActivityByIdQuery request, CancellationToken cancellationToken)
    {
        var opcrActivity = await unitOfWork.OPCRActivityRepository.GetSingleAsync(
            unitOfWork.OPCRActivityRepository.Query(t => t.Id == request.Id)
                .Include(t => t.OPCRPAPDepartments),
            cancellationToken: cancellationToken) ?? throw new NotFoundException("No data found.");

        var response = new OPCRActivityResponse
        {
            Id = opcrActivity.Id,
            OPCRId = opcrActivity.OPCRId,
            DUKPIAssignmentId = opcrActivity.DUKPIAssignmentId,
            Name = opcrActivity.Name,
            Description = opcrActivity.Description,
            Budget = opcrActivity.Budget,
            PAPDepartments = opcrActivity.OPCRPAPDepartments.Select(p => p.DeliveryUnitId).ToList()
        };

        return ApiResponse<OPCRActivityResponse>.Success(response, "Retrieved successfully");
    }
}
