using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.RatingScaleTemplate.Commands.DeleteRatingScaleTemplate;

public record DeleteRatingScaleTemplateCommand(Guid Id) : IRequest<ApiResponse<Unit>>;
