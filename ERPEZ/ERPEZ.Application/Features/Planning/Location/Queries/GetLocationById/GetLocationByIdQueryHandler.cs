using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Location.Queries.GetLocationById;

public class GetLocationByIdQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetLocationByIdQuery, ApiResponse<Domain.Entities.Planning.Location>>
{
    public async Task<ApiResponse<Domain.Entities.Planning.Location>> Handle(
        GetLocationByIdQuery request,
        CancellationToken cancellationToken)
    {
        var location = await unitOfWork.LocationRepository.FindAsync(
           t => t.Id == request.Id,
            cancellationToken: cancellationToken) ?? throw new NotFoundException("No data found.");

        return ApiResponse<Domain.Entities.Planning.Location>.Success(location, "Retrieved successfully");
    }
}
