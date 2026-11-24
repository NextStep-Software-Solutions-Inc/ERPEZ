using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.PPMPItem.Commands.DeletePPMPItem;

public record DeletePPMPItemCommand(Guid Id) : IRequest<ApiResponse<Guid>>;
