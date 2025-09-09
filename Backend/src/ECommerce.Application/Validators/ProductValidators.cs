using FluentValidation;
using ECommerce.Application.DTOs;

namespace ECommerce.Application.Validators;

public class CreateProductValidator : AbstractValidator<CreateProductDto>
{
    public CreateProductValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Product name is required")
            .Length(1, 200).WithMessage("Product name must be between 1 and 200 characters");

        RuleFor(x => x.Description)
            .MaximumLength(1000).WithMessage("Description must be less than 1000 characters");

        RuleFor(x => x.Price)
            .GreaterThan(0).WithMessage("Price must be greater than 0")
            .LessThanOrEqualTo(999999.99m).WithMessage("Price must be less than or equal to 999,999.99");

        RuleFor(x => x.Stock)
            .GreaterThanOrEqualTo(0).WithMessage("Stock cannot be negative")
            .LessThanOrEqualTo(100000).WithMessage("Stock must be less than or equal to 100,000");

        RuleFor(x => x.ImageUrl)
            .MaximumLength(500).WithMessage("Image URL must be less than 500 characters")
            .Must(BeValidImageUrl).WithMessage("Please provide a valid image URL")
            .When(x => !string.IsNullOrEmpty(x.ImageUrl));

        RuleFor(x => x.CategoryId)
            .NotEmpty().WithMessage("Category is required")
            .Must(BeValidGuid).WithMessage("Please select a valid category");
    }

    private bool BeValidImageUrl(string imageUrl)
    {
        if (string.IsNullOrEmpty(imageUrl)) return true;
        
        return Uri.TryCreate(imageUrl, UriKind.Absolute, out var uri) &&
               (uri.Scheme == Uri.UriSchemeHttp || uri.Scheme == Uri.UriSchemeHttps) &&
               (imageUrl.EndsWith(".jpg", StringComparison.OrdinalIgnoreCase) ||
                imageUrl.EndsWith(".jpeg", StringComparison.OrdinalIgnoreCase) ||
                imageUrl.EndsWith(".png", StringComparison.OrdinalIgnoreCase) ||
                imageUrl.EndsWith(".gif", StringComparison.OrdinalIgnoreCase) ||
                imageUrl.EndsWith(".webp", StringComparison.OrdinalIgnoreCase) ||
                imageUrl.Contains("unsplash.com") ||
                imageUrl.Contains("images.")) ;
    }

    private bool BeValidGuid(Guid categoryId)
    {
        return categoryId != Guid.Empty;
    }
}

public class UpdateProductValidator : AbstractValidator<UpdateProductDto>
{
    public UpdateProductValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Product name is required")
            .Length(1, 200).WithMessage("Product name must be between 1 and 200 characters");

        RuleFor(x => x.Description)
            .MaximumLength(1000).WithMessage("Description must be less than 1000 characters");

        RuleFor(x => x.Price)
            .GreaterThan(0).WithMessage("Price must be greater than 0")
            .LessThanOrEqualTo(999999.99m).WithMessage("Price must be less than or equal to 999,999.99");

        RuleFor(x => x.Stock)
            .GreaterThanOrEqualTo(0).WithMessage("Stock cannot be negative")
            .LessThanOrEqualTo(100000).WithMessage("Stock must be less than or equal to 100,000");

        RuleFor(x => x.ImageUrl)
            .MaximumLength(500).WithMessage("Image URL must be less than 500 characters")
            .Must(BeValidImageUrl).WithMessage("Please provide a valid image URL")
            .When(x => !string.IsNullOrEmpty(x.ImageUrl));

        RuleFor(x => x.CategoryId)
            .NotEmpty().WithMessage("Category is required")
            .Must(BeValidGuid).WithMessage("Please select a valid category");

        RuleFor(x => x.IsActive)
            .NotNull().WithMessage("Product status is required");
    }

    private bool BeValidImageUrl(string imageUrl)
    {
        if (string.IsNullOrEmpty(imageUrl)) return true;
        
        return Uri.TryCreate(imageUrl, UriKind.Absolute, out var uri) &&
               (uri.Scheme == Uri.UriSchemeHttp || uri.Scheme == Uri.UriSchemeHttps) &&
               (imageUrl.EndsWith(".jpg", StringComparison.OrdinalIgnoreCase) ||
                imageUrl.EndsWith(".jpeg", StringComparison.OrdinalIgnoreCase) ||
                imageUrl.EndsWith(".png", StringComparison.OrdinalIgnoreCase) ||
                imageUrl.EndsWith(".gif", StringComparison.OrdinalIgnoreCase) ||
                imageUrl.EndsWith(".webp", StringComparison.OrdinalIgnoreCase) ||
                imageUrl.Contains("unsplash.com") ||
                imageUrl.Contains("images."));
    }

    private bool BeValidGuid(Guid categoryId)
    {
        return categoryId != Guid.Empty;
    }
}