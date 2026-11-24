using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.PMT.Commands.DeletePMT;

public record DeletePMTCommand(Guid Id) : IRequest<ApiResponse<Unit>>;
