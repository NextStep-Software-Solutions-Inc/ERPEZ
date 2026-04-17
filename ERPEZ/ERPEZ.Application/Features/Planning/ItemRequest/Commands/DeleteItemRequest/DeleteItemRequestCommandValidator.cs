using FluentValidation;

namespace ERPEZ.Application.Features.Planning.ItemRequest.Commands.DeleteItemRequest;

public class DeleteItemRequestCommandValidator : AbstractValidator<DeleteItemRequestCommand>
{
    public DeleteItemRequestCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Item Request ID is required.");
    }
}
