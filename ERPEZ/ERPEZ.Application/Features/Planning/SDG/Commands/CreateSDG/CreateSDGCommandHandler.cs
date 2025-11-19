using ERPEZ.Application.Features.Planning.SDG.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.SDG.Commands.CreateSDG;

public class CreateSDGCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<CreateSDGCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreateSDGCommand request, CancellationToken cancellationToken)
    {
        var existingSDG = await unitOfWork.SDGRepository.FindAsync(x => x.Name == request.Name, cancellationToken);
        if (existingSDG != null)
        {
            throw new ConflictException($"SDG with name '{request.Name}' already exists.");
        }

        var sdg = new Domain.Entities.Planning.SDG
        {
            Name = request.Name,
            Description = request.Description
        };

        await unitOfWork.SDGRepository.AddAsync(sdg, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        var response = new SDGResponse
        {
            Id = sdg.Id,
            Name = sdg.Name,
            Description = sdg.Description
        };

        return ApiResponse<Guid>.Success(sdg.Id, "SDG created successfully.");
    }
}
