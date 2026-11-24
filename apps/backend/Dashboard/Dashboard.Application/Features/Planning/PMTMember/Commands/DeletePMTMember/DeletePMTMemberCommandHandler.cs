using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.PMTMember.Commands.DeletePMTMember;

public class DeletePMTMemberCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<DeletePMTMemberCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(DeletePMTMemberCommand request, CancellationToken cancellationToken)
    {
        var pmtMember = await unitOfWork.PMTMemberRepository.GetByIdAsync(
            request.Id,
            cancellationToken
        );

        if (pmtMember == null)
            throw new NotFoundException($"PMT Member with ID '{request.Id}' not found.");

        unitOfWork.PMTMemberRepository.Remove(pmtMember);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value);
    }
}
