# My Node Backend

This project is a Node.js backend for a smart fridge application, utilizing Prisma as the ORM for database interactions. The backend handles user registration, authentication, and other related functionalities.

## Project Structure

```
my-node-backend
├── prisma
│   ├── schema.prisma        # Defines the Prisma schema and database models
│   └── migrations           # Contains migration files for schema updates
├── src
│   ├── controllers          # Contains controller files for handling requests
│   │   └── userController.js
│   ├── models               # Contains model definitions for database interactions
│   │   └── User.js
│   ├── routes               # Contains route definitions for API endpoints
│   │   └── userRoutes.js
│   ├── services             # Contains business logic for user operations
│   │   └── userService.js
│   ├── app.js               # Initializes the Express application
│   └── server.js            # Starts the server and listens for requests
├── .env                     # Contains environment variables
├── package.json             # Configuration file for npm
└── README.md                # Documentation for the project
```

## Getting Started

### Prerequisites

- Node.js
- npm
- A database (e.g., PostgreSQL, MySQL)

### Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd my-node-backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up your database and update the `.env` file with your database connection string.

4. Run the Prisma migrations:
   ```
   npx prisma migrate dev
   ```

5. Start the server:
   ```
   npm start
   ```

### API Endpoints

- **POST /api/users/register**: Register a new user
- **POST /api/users/login**: Authenticate a user

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or features.

## License

This project is licensed under the MIT License.