using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Office.Queries.GetOfficeByIdQuery;

public class GetOfficeByIdQueryHandler(IUnitOfWork _unitOfWork) : IRequestHandler<GetOfficeByIdQuery, ApiResponse<Domain.Entities.Planning.Office>>
{
    public async Task<ApiResponse<Domain.Entities.Planning.Office>> Handle(GetOfficeByIdQuery request, CancellationToken cancellationToken)
    {
        var office = await _unitOfWork.OfficeRepository.FindAsync(
           t => t.Id == request.Id,
            cancellationToken: cancellationToken) ?? throw new NotFoundException("No data found.");

        return ApiResponse<Domain.Entities.Planning.Office>.Success(office, "Retrieved successfully");
    }
}
