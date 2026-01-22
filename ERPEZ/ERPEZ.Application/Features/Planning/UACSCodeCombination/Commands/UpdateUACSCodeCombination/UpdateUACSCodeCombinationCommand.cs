using ERPEZ.Application.Features.Planning.UACSCodeCombination.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.UACSCodeCombination.Commands.UpdateUACSCodeCombination;

public class UpdateUACSCodeCombinationCommand : IRequest<ApiResponse<Unit>>
{
    public Guid Id { get; set; }
    public required UpdateUACSCodeCombinationRequest UpdateUACSCodeCombination { get; set; }
}
