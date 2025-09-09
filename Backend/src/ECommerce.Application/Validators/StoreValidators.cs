using FluentValidation;
using ECommerce.Application.DTOs;

namespace ECommerce.Application.Validators;

public class CreateStoreValidator : AbstractValidator<CreateStoreDto>
{
    public CreateStoreValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Store name is required")
            .Length(2, 200).WithMessage("Store name must be between 2 and 200 characters")
            .Matches("^[a-zA-Z0-9\\s\\-&.'\"]+$").WithMessage("Store name can only contain letters, numbers, spaces and common punctuation");

        RuleFor(x => x.Description)
            .NotEmpty().WithMessage("Store description is required")
            .Length(10, 1000).WithMessage("Store description must be between 10 and 1000 characters");

        RuleFor(x => x.LogoUrl)
            .Must(BeValidUrl).WithMessage("Logo URL must be a valid URL")
            .When(x => !string.IsNullOrEmpty(x.LogoUrl));

        RuleFor(x => x.BannerUrl)
            .Must(BeValidUrl).WithMessage("Banner URL must be a valid URL")
            .When(x => !string.IsNullOrEmpty(x.BannerUrl));

        RuleFor(x => x.ContactEmail)
            .NotEmpty().WithMessage("Contact email is required")
            .EmailAddress().WithMessage("Please enter a valid email address")
            .Length(1, 200).WithMessage("Email must be less than 200 characters");

        RuleFor(x => x.ContactPhone)
            .NotEmpty().WithMessage("Contact phone is required")
            .Matches("^\\+?[0-9\\s\\-()]+$").WithMessage("Please enter a valid phone number")
            .Length(1, 20).WithMessage("Phone number must be less than 20 characters");

        RuleFor(x => x.Website)
            .Must(BeValidUrl).WithMessage("Website must be a valid URL")
            .When(x => !string.IsNullOrEmpty(x.Website));

        RuleFor(x => x.BusinessAddress)
            .NotEmpty().WithMessage("Business address is required")
            .Length(10, 500).WithMessage("Business address must be between 10 and 500 characters");

        RuleFor(x => x.TaxNumber)
            .Length(1, 50).WithMessage("Tax number must be less than 50 characters")
            .When(x => !string.IsNullOrEmpty(x.TaxNumber));
    }

    private bool BeValidUrl(string url)
    {
        if (string.IsNullOrEmpty(url))
            return true;

        return Uri.TryCreate(url, UriKind.Absolute, out Uri? validatedUri) &&
               (validatedUri.Scheme == Uri.UriSchemeHttp || validatedUri.Scheme == Uri.UriSchemeHttps);
    }
}

public class UpdateStoreValidator : AbstractValidator<UpdateStoreDto>
{
    public UpdateStoreValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Store name is required")
            .Length(2, 200).WithMessage("Store name must be between 2 and 200 characters")
            .Matches("^[a-zA-Z0-9\\s\\-&.'\"]+$").WithMessage("Store name can only contain letters, numbers, spaces and common punctuation");

        RuleFor(x => x.Description)
            .NotEmpty().WithMessage("Store description is required")
            .Length(10, 1000).WithMessage("Store description must be between 10 and 1000 characters");

        RuleFor(x => x.LogoUrl)
            .Must(BeValidUrl).WithMessage("Logo URL must be a valid URL")
            .When(x => !string.IsNullOrEmpty(x.LogoUrl));

        RuleFor(x => x.BannerUrl)
            .Must(BeValidUrl).WithMessage("Banner URL must be a valid URL")
            .When(x => !string.IsNullOrEmpty(x.BannerUrl));

        RuleFor(x => x.ContactEmail)
            .NotEmpty().WithMessage("Contact email is required")
            .EmailAddress().WithMessage("Please enter a valid email address")
            .Length(1, 200).WithMessage("Email must be less than 200 characters");

        RuleFor(x => x.ContactPhone)
            .NotEmpty().WithMessage("Contact phone is required")
            .Matches("^\\+?[0-9\\s\\-()]+$").WithMessage("Please enter a valid phone number")
            .Length(1, 20).WithMessage("Phone number must be less than 20 characters");

        RuleFor(x => x.Website)
            .Must(BeValidUrl).WithMessage("Website must be a valid URL")
            .When(x => !string.IsNullOrEmpty(x.Website));

        RuleFor(x => x.BusinessAddress)
            .NotEmpty().WithMessage("Business address is required")
            .Length(10, 500).WithMessage("Business address must be between 10 and 500 characters");

        RuleFor(x => x.TaxNumber)
            .Length(1, 50).WithMessage("Tax number must be less than 50 characters")
            .When(x => !string.IsNullOrEmpty(x.TaxNumber));

        RuleFor(x => x.IsActive)
            .NotNull().WithMessage("Active status is required");
    }

    private bool BeValidUrl(string url)
    {
        if (string.IsNullOrEmpty(url))
            return true;

        return Uri.TryCreate(url, UriKind.Absolute, out Uri? validatedUri) &&
               (validatedUri.Scheme == Uri.UriSchemeHttp || validatedUri.Scheme == Uri.UriSchemeHttps);
    }
}

public class StoreApprovalValidator : AbstractValidator<StoreApprovalDto>
{
    public StoreApprovalValidator()
    {
        RuleFor(x => x.IsApproved)
            .NotNull().WithMessage("Approval status is required");

        RuleFor(x => x.ApprovalNotes)
            .MaximumLength(500).WithMessage("Approval notes must be less than 500 characters")
            .When(x => !string.IsNullOrEmpty(x.ApprovalNotes));
    }
}