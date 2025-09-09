using FluentValidation;
using ECommerce.Application.DTOs;

namespace ECommerce.Application.Validators;

public class CreateCategoryValidator : AbstractValidator<CreateCategoryDto>
{
    public CreateCategoryValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Category name is required")
            .Length(1, 100).WithMessage("Category name must be between 1 and 100 characters")
            .Matches("^[a-zA-Z0-9\\s&-.,()]+$").WithMessage("Category name contains invalid characters");

        RuleFor(x => x.Description)
            .MaximumLength(500).WithMessage("Description must be less than 500 characters");
    }
}

public class UpdateCategoryValidator : AbstractValidator<UpdateCategoryDto>
{
    public UpdateCategoryValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Category name is required")
            .Length(1, 100).WithMessage("Category name must be between 1 and 100 characters")
            .Matches("^[a-zA-Z0-9\\s&-.,()]+$").WithMessage("Category name contains invalid characters");

        RuleFor(x => x.Description)
            .MaximumLength(500).WithMessage("Description must be less than 500 characters");

        RuleFor(x => x.IsActive)
            .NotNull().WithMessage("Category status is required");
    }
}