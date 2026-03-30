using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCR.Commands.CreateOPCR;

public class CreateOPCRCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<CreateOPCRCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreateOPCRCommand request, CancellationToken cancellationToken)
    {
        _ = await unitOfWork.OfficeRepository.GetByIdAsync(request.OfficeId, cancellationToken) ?? throw new NotFoundException("Office not found.");

        var opcr = new Domain.Entities.Planning.OPCR
        {
            OfficeId = request.OfficeId,
            FiscalYearId = request.FiscalYearId,
            Name = request.Name ?? string.Empty,
            Code = request.Code ?? string.Empty,
            CreatedAt = DateTime.UtcNow
        };
        await unitOfWork.OPCRRepository.AddAsync(opcr, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);
       
        return ApiResponse<Guid>.Success(opcr.Id, "OPCR created successfully.");
    }
}
