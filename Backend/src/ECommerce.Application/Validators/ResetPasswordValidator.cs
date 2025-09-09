using ECommerce.Application.DTOs.Auth;
using FluentValidation;

namespace ECommerce.Application.Validators;

/// <summary>
/// Validator for reset password requests
/// </summary>
public class ResetPasswordValidator : AbstractValidator<ResetPasswordRequest>
{
    public ResetPasswordValidator()
    {
        RuleFor(x => x.Token)
            .NotEmpty()
            .WithMessage("Reset token is required")
            .MinimumLength(10)
            .WithMessage("Invalid reset token format");

        RuleFor(x => x.Email)
            .NotEmpty()
            .WithMessage("Email is required")
            .EmailAddress()
            .WithMessage("Valid email address is required");

        RuleFor(x => x.NewPassword)
            .NotEmpty()
            .WithMessage("New password is required")
            .MinimumLength(8)
            .WithMessage("Password must be at least 8 characters long")
            .Matches(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$")
            .WithMessage("Password must contain at least one lowercase letter, one uppercase letter, one digit, and one special character");

        RuleFor(x => x.ConfirmPassword)
            .NotEmpty()
            .WithMessage("Password confirmation is required")
            .Equal(x => x.NewPassword)
            .WithMessage("Password confirmation must match the new password");
    }
}