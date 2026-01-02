# Pizza Box Admin

A comprehensive admin dashboard for managing pizza shop operations with real-time order tracking, menu management, and analytics.

## Live Demo

- **Application**: https://admin.pizzabox.ayushshende.com

## Related Repositories

- **Backend API**: https://github.com/AyushShende25/pizza-box
- **Customer Portal**: https://github.com/AyushShende25/pizza-box-client

## Tech Stack

- **Framework**: React
- **Language**: TypeScript
- **Routing**: TanStack Router
- **State Management**: TanStack Query (React Query)
- **Form Management**: TanStack Form
- **Validation**: Zod
- **Tables**: TanStack Table
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Charts**: Recharts
- **HTTP Client**: Axios
- **Real-time**: WebSockets
- **Build Tool**: Vite
- **Code Quality**: Biome

## Features

### Dashboard & Analytics
- **Statistics Overview**: Real-time order counts and sales metrics with customizable date ranges
- **Data Visualization**: Interactive charts including pie charts for order status distribution, bar charts for top-selling pizzas, monthly sales trends, and revenue analysis
- **Date Filtering**: Quick filters (7 days, 30 days, 6 months) and custom date range picker
- **Flexible Time Windows**: Monthly data views with 3M, 6M, and 12M options

### Order Management
- **Real-time Order Tracking**: Live order updates via WebSockets with instant notifications for new orders and status changes
- **Advanced Filtering**: Multi-criteria filtering by order status, payment status, and payment method with clear filters option
- **Order Details**: Comprehensive view including items, customer info, delivery address, billing summary, and special notes
- **Status Updates**: Workflow-based status transitions with validation (Pending → Confirmed → Preparing → Out for Delivery → Delivered)
- **Order Cancellation**: Controlled cancellation logic based on order state
- **Table Management**: Sortable columns (order number, date, price), server-side pagination, and responsive design

### Menu Management

**Pizza Menu**
- Full CRUD operations with image upload support
- Multi-criteria filtering (name search with debounce, category, availability, featured status)
- Default toppings assignment
- Toggle availability and featured status inline with optimistic updates
- Server-side pagination and sorting
- Price management and category tagging (veg/non-veg)

**Toppings Management**
- Complete CRUD with image support
- Category-based filtering (meat, cheese, veggies, sauce)
- Type filtering (vegetarian/non-vegetarian)
- Availability toggle
- Price configuration

**Size Management**
- CRUD operations for pizza sizes
- Display name and multiplier configuration
- Sort order management
- Availability toggle

**Crust Management**
- CRUD operations for crust types
- Additional price configuration
- Sort order management
- Description and availability settings

## Prerequisites

- Node.js 18 or higher
- npm or yarn or pnpm

## Installation

1. Clone the repository:
```bash
git clone https://github.com/AyushShende25/pizza-box-admin
cd pizza-box-admin
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Configure environment variables:
```env
VITE_PUBLIC_BACKEND_URL=http://localhost:8000/api/v1
VITE_PUBLIC_WS_URL=ws://localhost:8000
```

## Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Build

Create a production build:
```bash
npm run build
```

Preview the production build:
```bash
npm run serve
```

## Project Structure

```
pizza-box-admin/
├── src/
│   ├── api/                   # API client and query functions
│   ├── components/            # Reusable components
│   │   ├── ui/                # shadcn/ui components
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Utilities and helpers
│   ├── providers/             # Context providers
│   ├── routes/                # File-based routing
│   ├── types/                 # TypeScript type definitions
│   ├── main.tsx               # Application entry point
│   └── routeTree.gen.ts       # Generated route tree
├── public/                    # Static assets
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.ts
```

