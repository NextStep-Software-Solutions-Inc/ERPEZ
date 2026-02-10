using ERPEZ.Application.Features.Planning.OfficeType.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OfficeType.Commands.UpdateOfficeType;

public record UpdateOfficeTypeCommand : IRequest<ApiResponse<Unit>>
{
    public required Guid Id { get; init; }
    public required UpdateOfficeTypeRequest UpdateOfficeType { get; init; }
}
