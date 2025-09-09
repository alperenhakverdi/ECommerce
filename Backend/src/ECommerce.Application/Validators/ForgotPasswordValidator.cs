using ECommerce.Application.DTOs.Auth;
using FluentValidation;

namespace ECommerce.Application.Validators;

/// <summary>
/// Validator for forgot password requests
/// </summary>
public class ForgotPasswordValidator : AbstractValidator<ForgotPasswordRequest>
{
    public ForgotPasswordValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty()
            .WithMessage("Email is required")
            .EmailAddress()
            .WithMessage("Valid email address is required")
            .MaximumLength(255)
            .WithMessage("Email must not exceed 255 characters");
    }
}