using ERPEZ.Application.Features.Planning.Location.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Location.Queries.GetLocationById;

public class GetLocationByIdQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetLocationByIdQuery, ApiResponse<LocationDetailedResponse>>
{
    public async Task<ApiResponse<LocationDetailedResponse>> Handle(
        GetLocationByIdQuery request,
        CancellationToken cancellationToken)
    {
        var location = await unitOfWork.LocationRepository.FindAsync(
           t => t.Id == request.Id,
            cancellationToken: cancellationToken) ?? throw new NotFoundException("No data found.");

        var response = new LocationDetailedResponse
        {
            Id = location.Id,
            Name = location.Name,
            Code = location.Code,
            Region = null,
            Province = null,
            Municipality = null,
            Barangay = null,
            CreatedAt = location.CreatedAt,
            CreatedBy = location.CreatedBy,
            UpdatedAt = location.UpdatedAt,
            UpdatedBy = location.UpdatedBy
        };

        return ApiResponse<LocationDetailedResponse>.Success(response, "Retrieved successfully");
    }
}
