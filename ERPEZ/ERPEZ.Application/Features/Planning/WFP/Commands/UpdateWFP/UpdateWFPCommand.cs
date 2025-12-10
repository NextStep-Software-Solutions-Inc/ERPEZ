using ERPEZ.Application.Features.Planning.WFP.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.WFP.Commands.UpdateWFP;

public class UpdateWFPCommand : IRequest<ApiResponse<Domain.Entities.Planning.WFP>>
{
    public Guid Id { get; set; }
    public UpdateWFPRequest UpdateWFP { get; set; } = null!;
}

