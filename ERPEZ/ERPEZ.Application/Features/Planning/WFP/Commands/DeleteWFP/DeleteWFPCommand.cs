using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.WFP.Commands.DeleteWFP;

public record DeleteWFPCommand(Guid Id) : IRequest<ApiResponse<Unit>>;
