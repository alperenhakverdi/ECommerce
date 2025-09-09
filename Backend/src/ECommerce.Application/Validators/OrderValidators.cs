using FluentValidation;
using ECommerce.Application.DTOs;

namespace ECommerce.Application.Validators;

public class CreateOrderValidator : AbstractValidator<CreateOrderDto>
{
    public CreateOrderValidator()
    {
        RuleFor(x => x.CustomerName)
            .NotEmpty().WithMessage("Customer name is required")
            .Length(2, 100).WithMessage("Customer name must be between 2 and 100 characters")
            .Matches("^[a-zA-ZğüşıöçĞÜŞIÖÇ\\s]+$").WithMessage("Customer name can only contain letters and spaces");

        RuleFor(x => x.CustomerEmail)
            .NotEmpty().WithMessage("Customer email is required")
            .EmailAddress().WithMessage("Please enter a valid email address")
            .MaximumLength(200).WithMessage("Email must be less than 200 characters");

        RuleFor(x => x.AddressId)
            .NotEmpty().WithMessage("Shipping address is required")
            .Must(BeValidGuid).WithMessage("Please select a valid shipping address");
    }

    private bool BeValidGuid(Guid addressId)
    {
        return addressId != Guid.Empty;
    }
}

public class UpdateOrderStatusValidator : AbstractValidator<UpdateOrderStatusDto>
{
    public UpdateOrderStatusValidator()
    {
        RuleFor(x => x.Status)
            .IsInEnum().WithMessage("Please select a valid order status");
    }
}