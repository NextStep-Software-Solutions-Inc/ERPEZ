using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Object.Commands.DeleteObject;

public record class DeleteObjectCommand(Guid Id) : IRequest<ApiResponse<Unit>>;
