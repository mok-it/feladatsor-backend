# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the backend for the Medve Matek (Bear Math) voluntary organization, built with NestJS, Prisma, PostgreSQL, and GraphQL. It manages mathematical exercises, users, and educational content.

### Deployments
- **Development**: https://be-feladatsor-dev-1029503388169.europe-west3.run.app (auto-deployed from main branch)
- **Production**: https://be-feladatsor-prod-1029503388169.europe-west3.run.app (manually deployed from version tags)

## Development Commands

### Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Install dependencies
npm install

# Start PostgreSQL database with Docker Compose
docker compose -f docker-compose.db.yml up

# OR start PostgreSQL in a local k8s cluster
skaffold deploy -m=postgresql --port-forward

# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate:dev

# Seed database with test data
npm run db:seed
```

### Development Server
```bash
# Start development server with hot reload
npm run start:dev

# Start production server
npm run start:prod

# Debug mode
npm run start:debug
```

### Code Quality & Testing
```bash
# Run linter and fix issues
npm run lint

# Format code
npm run format

# Run tests
npm test

# Run tests in watch mode
npm test:watch

# Run tests with coverage
npm run test:cov
```

### Database Operations
```bash
# Generate Prisma client after schema changes
npm run db:generate

# Create and apply migration (development)
npm run db:migrate:dev

# Deploy migrations (production)
npm run db:migrate:prod

# Seed database with initial data
npm run db:seed
```

### GraphQL
```bash
# Generate TypeScript types from GraphQL schemas
npm run graphql:generate
```

### Infrastructure
```bash
# Deploy PostgreSQL with Skaffold
npm run skaffold

# Start PostgreSQL with Docker Compose
docker compose -f docker-compose.db.yml up
```

## Architecture

### Core Technologies
- **NestJS**: Node.js framework with TypeScript, decorators, and dependency injection
- **Prisma**: Type-safe ORM and database toolkit
- **GraphQL**: API query language with Apollo Server
- **PostgreSQL**: Primary database
- **Firebase Auth**: User authentication
- **Sharp**: Image processing
- **ExcelJS**: Excel file generation and processing

### Module Structure
The application follows NestJS modular architecture:

- **auth/**: JWT and Firebase authentication, guards, decorators
- **exercise/**: Core exercise management, search functionality
- **exercise-check/**: Exercise validation and review system
- **exercise-comment/**: Commenting system for exercises
- **exercise-compose/**: Exercise composition and grouping
- **exercise-group/**: Exercise categorization
- **exercise-history/**: Exercise change tracking
- **exercise-tag/**: Tagging system for exercises
- **user/**: User management and profiles
- **image/**: Image upload and processing
- **excel-export/**: Excel file generation
- **load-old-excel/**: Legacy data import
- **stat/**: Statistics and analytics
- **funky-pool/**: Additional exercise pool functionality
- **health/**: Health check endpoints
- **config/**: Environment configuration management
- **prisma/**: Database schema, migrations, and seeding

### Database Schema Key Models
- **Exercise**: Main exercise entity with description, solution, images, and metadata
- **ExerciseTag**: Hierarchical tagging system for categorization
- **User**: User accounts with roles and authentication
- **ExerciseCheck**: Exercise validation and approval workflow
- **ExerciseHistory**: Audit trail for exercise changes
- **ExerciseComment**: Comments and feedback on exercises
- **ExerciseCompose**: Exercise grouping and composition

### Authentication & Authorization
- Firebase token validation for user authentication
- JWT tokens for session management
- Role-based access control with guards
- Public endpoints marked with `@Public()` decorator

### File Storage
- Images stored in `./data/` directory
- Generated files (Excel exports) in `./generated/` directory
- Image processing with Sharp (resize to 1920px width, 80% quality)

### GraphQL API
- Schema-first approach with `.graphql` files in each module
- Type generation from GraphQL schemas to `src/graphql/graphqlTypes.ts`
- Apollo Server with landing page disabled in production
- Modular resolvers organized by domain
- Main GraphQL endpoint: `/graphql`

### REST Endpoints
Besides GraphQL, the app exposes a few REST endpoints:
- `GET /images/{:id}`: Retrieve uploaded images
- `POST /image/upload`: Upload new images
- `GET /health`: Health check endpoint
- `POST /load-old-excel/load`: Load legacy Excel data
- `/images` and `/generated`: Static file serving for images and generated artifacts

### Configuration
Environment variables managed through `env-var` library:
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: JWT signing secret
- `FIREBASE_VALIDATE_URL`: Firebase token validation endpoint
- `FILE_STORAGE_FOLDER`: Image storage location
- `PORT`/`HOST`: Server configuration

### Development Workflow
1. Make schema changes in `prisma/schema.prisma`
2. Run `npm run db:generate` to update Prisma client
3. Create migration with `npm run db:migrate:dev`
4. Update GraphQL schemas in `.graphql` files
5. Run `npm run graphql:generate` to update TypeScript types
6. Run `npm run lint` before committing

### Testing Strategy
- Unit tests with Jest (`*.spec.ts` files)
- E2E tests in `test/` directory
- Health checks available at `/health` endpoint
- Database health monitoring with Prisma

### Docker Support
- Production Docker image: `kosbalint/be-feladatsor`
- Database migrations run automatically in container
- Environment variables loaded from `stack.env`
- PostgreSQL health checks configured

### Key Business Logic
- Exercise lifecycle: DRAFT → CREATED → APPROVED → DELETED
- Exercise checking workflow with aggregated status
- Contributor tracking for collaborative work
- Image processing and storage for exercise content
- Excel import/export for bulk operations
- Hierarchical exercise tagging system