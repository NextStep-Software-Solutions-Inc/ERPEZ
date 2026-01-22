using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.UACSCodeSegment.Commands.DeleteUACSCodeSegment;

public class DeleteUACSCodeSegmentCommandHandler(IUnitOfWork unitOfWork) 
    : IRequestHandler<DeleteUACSCodeSegmentCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(DeleteUACSCodeSegmentCommand request, CancellationToken cancellationToken)
    {
        var codeSegment = await unitOfWork.UACSCodeSegmentRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("UACS code segment not found.");

        unitOfWork.UACSCodeSegmentRepository.Remove(codeSegment);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, $"UACS code segment with ID {request.Id} deleted successfully.");
    }
}
