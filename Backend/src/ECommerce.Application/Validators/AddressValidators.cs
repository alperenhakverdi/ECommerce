using FluentValidation;
using ECommerce.Application.DTOs;

namespace ECommerce.Application.Validators;

public class CreateAddressValidator : AbstractValidator<CreateAddressDto>
{
    public CreateAddressValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Address title is required")
            .Length(1, 50).WithMessage("Title must be between 1 and 50 characters")
            .Must(BeValidAddressTitle).WithMessage("Title must be one of: Home, Work, Office, Other");

        RuleFor(x => x.FirstName)
            .NotEmpty().WithMessage("First name is required")
            .Length(1, 100).WithMessage("First name must be between 1 and 100 characters")
            .Matches("^[a-zA-ZğüşıöçĞÜŞIÖÇ\\s]+$").WithMessage("First name can only contain letters and spaces");

        RuleFor(x => x.LastName)
            .NotEmpty().WithMessage("Last name is required")
            .Length(1, 100).WithMessage("Last name must be between 1 and 100 characters")
            .Matches("^[a-zA-ZğüşıöçĞÜŞIÖÇ\\s]+$").WithMessage("Last name can only contain letters and spaces");

        RuleFor(x => x.AddressLine1)
            .NotEmpty().WithMessage("Address line 1 is required")
            .Length(1, 200).WithMessage("Address line 1 must be between 1 and 200 characters");

        RuleFor(x => x.AddressLine2)
            .MaximumLength(200).WithMessage("Address line 2 must be less than 200 characters");

        RuleFor(x => x.City)
            .NotEmpty().WithMessage("City is required")
            .Length(1, 100).WithMessage("City must be between 1 and 100 characters")
            .Matches("^[a-zA-ZğüşıöçĞÜŞIÖÇ\\s]+$").WithMessage("City can only contain letters and spaces");

        RuleFor(x => x.State)
            .NotEmpty().WithMessage("State/Province is required")
            .Length(1, 100).WithMessage("State/Province must be between 1 and 100 characters");

        RuleFor(x => x.PostalCode)
            .NotEmpty().WithMessage("Postal code is required")
            .Length(1, 20).WithMessage("Postal code must be between 1 and 20 characters")
            .Matches("^[0-9\\s-]+$").WithMessage("Postal code can only contain numbers, spaces and dashes");

        RuleFor(x => x.Country)
            .NotEmpty().WithMessage("Country is required")
            .Length(1, 100).WithMessage("Country must be between 1 and 100 characters")
            .Must(BeValidCountry).WithMessage("Please select a valid country");

        RuleFor(x => x.PhoneNumber)
            .Matches("^\\+?[0-9\\s\\-()]+$").WithMessage("Please enter a valid phone number")
            .When(x => !string.IsNullOrEmpty(x.PhoneNumber));

        RuleFor(x => x.IsDefault)
            .NotNull().WithMessage("Default address setting is required");
    }

    private bool BeValidAddressTitle(string title)
    {
        var validTitles = new[] { "Home", "Work", "Office", "Other" };
        return validTitles.Contains(title);
    }

    private bool BeValidCountry(string country)
    {
        var validCountries = new[] { "Turkey", "United States", "Germany", "France", "Other" };
        return validCountries.Contains(country);
    }
}

public class UpdateAddressValidator : AbstractValidator<UpdateAddressDto>
{
    public UpdateAddressValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Address title is required")
            .Length(1, 50).WithMessage("Title must be between 1 and 50 characters")
            .Must(BeValidAddressTitle).WithMessage("Title must be one of: Home, Work, Office, Other");

        RuleFor(x => x.FirstName)
            .NotEmpty().WithMessage("First name is required")
            .Length(1, 100).WithMessage("First name must be between 1 and 100 characters")
            .Matches("^[a-zA-ZğüşıöçĞÜŞIÖÇ\\s]+$").WithMessage("First name can only contain letters and spaces");

        RuleFor(x => x.LastName)
            .NotEmpty().WithMessage("Last name is required")
            .Length(1, 100).WithMessage("Last name must be between 1 and 100 characters")
            .Matches("^[a-zA-ZğüşıöçĞÜŞIÖÇ\\s]+$").WithMessage("Last name can only contain letters and spaces");

        RuleFor(x => x.AddressLine1)
            .NotEmpty().WithMessage("Address line 1 is required")
            .Length(1, 200).WithMessage("Address line 1 must be between 1 and 200 characters");

        RuleFor(x => x.AddressLine2)
            .MaximumLength(200).WithMessage("Address line 2 must be less than 200 characters");

        RuleFor(x => x.City)
            .NotEmpty().WithMessage("City is required")
            .Length(1, 100).WithMessage("City must be between 1 and 100 characters")
            .Matches("^[a-zA-ZğüşıöçĞÜŞIÖÇ\\s]+$").WithMessage("City can only contain letters and spaces");

        RuleFor(x => x.State)
            .NotEmpty().WithMessage("State/Province is required")
            .Length(1, 100).WithMessage("State/Province must be between 1 and 100 characters");

        RuleFor(x => x.PostalCode)
            .NotEmpty().WithMessage("Postal code is required")
            .Length(1, 20).WithMessage("Postal code must be between 1 and 20 characters")
            .Matches("^[0-9\\s-]+$").WithMessage("Postal code can only contain numbers, spaces and dashes");

        RuleFor(x => x.Country)
            .NotEmpty().WithMessage("Country is required")
            .Length(1, 100).WithMessage("Country must be between 1 and 100 characters")
            .Must(BeValidCountry).WithMessage("Please select a valid country");

        RuleFor(x => x.PhoneNumber)
            .Matches("^\\+?[0-9\\s\\-()]+$").WithMessage("Please enter a valid phone number")
            .When(x => !string.IsNullOrEmpty(x.PhoneNumber));

        RuleFor(x => x.IsDefault)
            .NotNull().WithMessage("Default address setting is required");
    }

    private bool BeValidAddressTitle(string title)
    {
        var validTitles = new[] { "Home", "Work", "Office", "Other" };
        return validTitles.Contains(title);
    }

    private bool BeValidCountry(string country)
    {
        var validCountries = new[] { "Turkey", "United States", "Germany", "France", "Other" };
        return validCountries.Contains(country);
    }
}