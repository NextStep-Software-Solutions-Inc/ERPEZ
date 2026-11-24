using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.GeneralRatingScale.Commands.DeleteGeneralRatingScale;

public record DeleteGeneralRatingScaleCommand(Guid Id) : IRequest<ApiResponse<Unit>>;
