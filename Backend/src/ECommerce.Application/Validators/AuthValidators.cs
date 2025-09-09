using FluentValidation;
using ECommerce.Application.DTOs.Auth;

namespace ECommerce.Application.Validators;

public class RegisterRequestValidator : AbstractValidator<RegisterRequestDto>
{
    public RegisterRequestValidator()
    {
        RuleFor(x => x.FirstName)
            .NotEmpty().WithMessage("First name is required")
            .Length(2, 50).WithMessage("First name must be between 2 and 50 characters")
            .Matches("^[a-zA-ZğüşıöçĞÜŞIÖÇ\\s]+$").WithMessage("First name can only contain letters and spaces");

        RuleFor(x => x.LastName)
            .NotEmpty().WithMessage("Last name is required")
            .Length(2, 50).WithMessage("Last name must be between 2 and 50 characters")
            .Matches("^[a-zA-ZğüşıöçĞÜŞIÖÇ\\s]+$").WithMessage("Last name can only contain letters and spaces");

        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email is required")
            .EmailAddress().WithMessage("Please enter a valid email address")
            .MaximumLength(200).WithMessage("Email must be less than 200 characters");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("Password is required")
            .MinimumLength(6).WithMessage("Password must be at least 6 characters long")
            .Matches(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)").WithMessage("Password must contain at least one lowercase letter, one uppercase letter, and one digit");

        RuleFor(x => x.ConfirmPassword)
            .NotEmpty().WithMessage("Please confirm your password")
            .Equal(x => x.Password).WithMessage("Passwords do not match");
    }
}

public class LoginRequestValidator : AbstractValidator<LoginRequestDto>
{
    public LoginRequestValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email is required")
            .EmailAddress().WithMessage("Please enter a valid email address");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("Password is required");
    }
}