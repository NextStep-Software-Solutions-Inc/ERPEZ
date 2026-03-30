using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCR.Commands.UpdateOPCR;

public class UpdateOPCRCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<UpdateOPCRCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(UpdateOPCRCommand request, CancellationToken cancellationToken)
    {
        var dto = request.UpdateOPCR;
        var opcr = await unitOfWork.OPCRRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken) ?? throw new NotFoundException("OPCR not found.");
        opcr.Name = !string.IsNullOrWhiteSpace(dto?.Name) ? dto!.Name : opcr.Name;
        opcr.Code = !string.IsNullOrWhiteSpace(dto?.Code) ? dto!.Code : opcr.Code;

        unitOfWork.OPCRRepository.Update(opcr);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "OPCR updated successfully.");
    }
}
