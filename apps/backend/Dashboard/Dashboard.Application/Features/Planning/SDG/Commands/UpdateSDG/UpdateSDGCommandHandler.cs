using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.SDG.Commands.UpdateSDG;

public class UpdateSDGCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<UpdateSDGCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(UpdateSDGCommand request, CancellationToken cancellationToken)
    {
        var sdg = await unitOfWork.SDGRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException($"SDG with ID {request.Id} not found.");

        if (request.Name != null)
        {
            var existingSDG = await unitOfWork.SDGRepository
                .FindAsync(x => x.Name == request.Name && x.Id != request.Id, cancellationToken);
            if (existingSDG != null)
                throw new ConflictException($"SDG with name '{request.Name}' already exists.");
        }

        sdg.Name = request.Name ?? sdg.Name;
        sdg.Description = request.Description ?? sdg.Description;
        sdg.SdgCode = request.SdgCode ?? sdg.SdgCode;

        unitOfWork.SDGRepository.Update(sdg);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "SDG updated successfully.");
    }
}
