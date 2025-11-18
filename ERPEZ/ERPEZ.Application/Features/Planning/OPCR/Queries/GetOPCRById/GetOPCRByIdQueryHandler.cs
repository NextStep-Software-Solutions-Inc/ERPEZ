using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCR.Queries.GetOPCRById;

public class GetOPCRByIdQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetOPCRByIdQuery, ApiResponse<Domain.Entities.Planning.OPCR>>
{
    public async Task<ApiResponse<Domain.Entities.Planning.OPCR>> Handle(GetOPCRByIdQuery request, CancellationToken cancellationToken)
    {
        var duAllocation = await unitOfWork.OPCRRepository.FindAsync(
           t => t.Id == request.Id,
            cancellationToken: cancellationToken) ?? throw new NotFoundException("No data found.");

        return ApiResponse<Domain.Entities.Planning.OPCR>.Success(duAllocation, "Retrieved successfully");
    }
}
