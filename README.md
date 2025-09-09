# E-Commerce Application

Modern, scalable e-commerce application built with Clean Architecture principles.

## 🏗️ Architecture

This project follows Clean Architecture and SOLID principles with the following layers:

### Backend (.NET Core)
- **Domain Layer**: Core business entities and interfaces
- **Application Layer**: Business logic, DTOs, and service interfaces
- **Infrastructure Layer**: Data access, EF Core, repositories, and external services
- **API Layer**: Controllers, middleware, and API configuration

### Frontend (React + TypeScript)
- **Component-based architecture** with Chakra UI
- **Context API** for state management
- **React Router** for navigation
- **Axios** for API communication

## 🚀 Technologies

### Backend
- .NET Core 8.0
- Entity Framework Core
- SQL Server
- Serilog (Logging)
- AutoMapper (optional)
- MediatR (optional for CQRS)

### Frontend
- React 18+ with TypeScript
- Chakra UI (UI Framework)
- React Router (Navigation)
- Axios (HTTP Client)
- Context API (State Management)

## 📋 Features

### Current Features (MVP)
- ✅ Product catalog with categories
- ✅ Shopping cart functionality
- ✅ Order management
- ✅ Responsive design
- ✅ Dark/Light theme toggle
- ✅ Search and filter products
- ✅ Clean Architecture implementation
- ✅ Logging and error handling
- ✅ Session-based cart (no auth required)

### Planned Features (Extensible)
- 🔄 User authentication (JWT)
- 🔄 Admin panel
- 🔄 Payment integration (Stripe/iyzico)
- 🔄 Order tracking
- 🔄 Email notifications
- 🔄 Product reviews
- 🔄 Wishlist functionality
- 🔄 Multi-language support

## 🛠️ Setup Instructions

### Prerequisites
- .NET SDK 8.0+
- Node.js 18+
- SQL Server or SQL Server LocalDB

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd ECommerce/Backend
   ```

2. **Restore packages**
   ```bash
   dotnet restore
   ```

3. **Update connection string**
   - Edit `src/ECommerce.API/appsettings.json`
   - Update the `DefaultConnection` string for your SQL Server instance

4. **Create and run migrations**
   ```bash
   dotnet ef migrations add InitialCreate -p src/ECommerce.Infrastructure -s src/ECommerce.API
   dotnet ef database update -p src/ECommerce.Infrastructure -s src/ECommerce.API
   ```

5. **Run the API**
   ```bash
   dotnet run --project src/ECommerce.API
   ```

   The API will be available at: `https://localhost:7070`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd ECommerce/Frontend/ecommerce-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure API URL**
   - Copy `.env.example` to `.env`
   - Update `REACT_APP_API_URL` if needed

4. **Start the development server**
   ```bash
   npm start
   ```

   The app will be available at: `http://localhost:3000`

## 📁 Project Structure

```
ECommerce/
├── Backend/
│   ├── ECommerce.sln
│   └── src/
│       ├── ECommerce.Domain/          # Core entities and interfaces
│       ├── ECommerce.Application/     # Business logic and DTOs
│       ├── ECommerce.Infrastructure/  # Data access and services
│       └── ECommerce.API/            # Web API controllers
└── Frontend/
    └── ecommerce-frontend/
        ├── public/
        └── src/
            ├── components/           # Reusable UI components
            ├── pages/               # Page components
            ├── context/             # React Context providers
            ├── services/            # API services
            ├── types/               # TypeScript types
            └── theme/               # Chakra UI theme
```

## 🔧 Configuration

### Backend Configuration (`appsettings.json`)
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=ECommerceDb;Trusted_Connection=true"
  },
  "Serilog": {
    "MinimumLevel": {
      "Default": "Information"
    }
  }
}
```

### Frontend Configuration (`.env`)
```env
REACT_APP_API_URL=https://localhost:7070/api
```

## 🧪 Testing

### Backend Testing
```bash
cd ECommerce/Backend
dotnet test
```

### Frontend Testing
```bash
cd ECommerce/Frontend/ecommerce-frontend
npm test
```

## 📦 Building for Production

### Backend
```bash
dotnet build --configuration Release
dotnet publish --configuration Release
```

### Frontend
```bash
npm run build
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 API Documentation

Once the backend is running, you can access the Swagger documentation at:
`https://localhost:7070/swagger`

### Main API Endpoints

- `GET /api/products` - Get all products
- `GET /api/products/{id}` - Get product by ID
- `GET /api/categories` - Get all categories
- `GET /api/cart/{userId}` - Get user's cart
- `POST /api/cart/{userId}/items` - Add item to cart
- `POST /api/orders/{userId}` - Create order

## 🎨 UI Features

- **Responsive Design**: Works on desktop, tablet, and mobile
- **Dark/Light Theme**: Toggle between themes
- **Modern UI**: Clean, professional design with Chakra UI
- **Loading States**: Proper loading indicators
- **Error Handling**: User-friendly error messages
- **Toast Notifications**: Success/error feedback

## 📈 Scalability Considerations

This architecture supports future enhancements:

- **Microservices**: Each layer can be extracted into separate services
- **CQRS**: Add MediatR for command/query separation
- **Caching**: Add Redis for better performance
- **Message Queue**: Add RabbitMQ/Azure Service Bus for async processing
- **API Gateway**: Add for microservices orchestration
- **Authentication**: JWT implementation ready
- **Docker**: Containerization ready

## 🛡️ Security Features

- **Input Validation**: Model validation on API endpoints
- **CORS Configuration**: Properly configured for frontend
- **Error Handling**: Secure error responses
- **Logging**: Comprehensive request/response logging

## 📚 Learning Resources

This project demonstrates:

- Clean Architecture principles
- SOLID principles
- Repository Pattern
- Unit of Work Pattern
- Dependency Injection
- Modern React patterns
- TypeScript best practices
- UI/UX design principles

Perfect for learning enterprise-level application development!