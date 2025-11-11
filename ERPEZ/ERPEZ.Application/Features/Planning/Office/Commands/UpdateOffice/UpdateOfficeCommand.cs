using ERPEZ.Application.Features.Planning.Office.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Office.Commands.UpdateOffice;

public class UpdateOfficeCommand : IRequest<ApiResponse<Domain.Entities.Planning.Office>>
{
    public Guid Id { get; set; }
    public required UpdateOfficeRequest UpdateOffice { get; set; }
}

