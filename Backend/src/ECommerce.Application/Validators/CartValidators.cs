using FluentValidation;
using ECommerce.Application.DTOs;

namespace ECommerce.Application.Validators;

public class AddToCartValidator : AbstractValidator<AddToCartDto>
{
    public AddToCartValidator()
    {
        RuleFor(x => x.ProductId)
            .NotEmpty().WithMessage("Product is required")
            .Must(BeValidGuid).WithMessage("Please select a valid product");

        RuleFor(x => x.Quantity)
            .GreaterThan(0).WithMessage("Quantity must be greater than 0")
            .LessThanOrEqualTo(99).WithMessage("Quantity cannot exceed 99 items");
    }

    private bool BeValidGuid(Guid productId)
    {
        return productId != Guid.Empty;
    }
}

public class UpdateCartItemValidator : AbstractValidator<UpdateCartItemDto>
{
    public UpdateCartItemValidator()
    {
        RuleFor(x => x.Quantity)
            .GreaterThan(0).WithMessage("Quantity must be greater than 0")
            .LessThanOrEqualTo(99).WithMessage("Quantity cannot exceed 99 items");
    }
}