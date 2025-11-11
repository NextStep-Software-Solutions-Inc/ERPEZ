using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCRKPI.Queries.GetOPCRKPIById;

public class GetOPCRKPIByIdQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetOPCRKPIByIdQuery, ApiResponse<Domain.Entities.Planning.OPCRKPI>>
{
    public async Task<ApiResponse<Domain.Entities.Planning.OPCRKPI>> Handle(GetOPCRKPIByIdQuery request, CancellationToken cancellationToken)
    {
        var opcrKPI = await unitOfWork.OPCRKPIRepository.FindAsync(
           t => t.Id == request.Id,
            cancellationToken: cancellationToken) ?? throw new NotFoundException("No data found.");

        return ApiResponse<Domain.Entities.Planning.OPCRKPI>.Success(opcrKPI, "Retrieved successfully");
    }
}

