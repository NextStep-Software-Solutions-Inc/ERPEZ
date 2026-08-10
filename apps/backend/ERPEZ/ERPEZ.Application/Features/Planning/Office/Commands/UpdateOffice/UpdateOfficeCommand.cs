using ERPEZ.Application.Features.Planning.Office.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Office.Commands.UpdateOffice;

public record UpdateOfficeCommand : IRequest<ApiResponse<Unit>>
{
    public Guid Id { get; init; }
    public required UpdateOfficeRequest UpdateOffice { get; init; }
}

