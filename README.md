# Healthcare Billing Dashboard

A modern healthcare billing dashboard built with Next.js 14, TypeScript, and Tailwind CSS. The dashboard features a revenue forecasting tool using Monte Carlo simulation to help healthcare providers predict their revenue based on claim payment probabilities.

## Features

- **Dashboard Summary**

  - Total billing amount and claim count
  - Interactive bar chart visualization of claim distribution by status
  - Color-coded status representation with tooltips

- **Claims Table**

  - Filterable and sortable table of billing records
  - Search functionality across all fields
  - Status-based filtering
  - Column sorting with visual indicators

- **Revenue Forecasting**
  - Monte Carlo simulation for revenue prediction (2000 iterations)
  - Adjustable payment probabilities for different claim statuses
  - Data-driven initial probability suggestions
  - Interactive area chart showing revenue distribution
  - Statistical analysis including mean, range, and percentiles
  - Expected revenue indicator in the chart
  - Hover tooltips with detailed percentile information

## Technical Stack

- Next.js 14 with App Router
- TypeScript
- Tailwind CSS
- shadcn/ui component library
- React Server Components
- Server Actions
- Recharts for data visualization

## Component Architecture

The application is structured into three main components:

1. **DashboardSummary**

   - Displays key metrics and claim distribution
   - Uses Recharts for interactive bar visualization
   - Implements color-coded status representation

2. **ClaimsTable**

   - Implements filtering and sorting functionality with visual indicators
   - Uses Table component from shadcn/ui
   - Client-side filtering and sorting for optimal performance
   - Consistent date formatting to prevent hydration mismatches

3. **RevenueForecast**
   - Implements Monte Carlo simulation with seeded random generation
   - Uses Slider components for probability adjustment
   - Memoized simulation calculations for performance
   - Interactive area chart with percentile visualization
   - Expected value reference line

## State Management

- Local state management using React's useState and useMemo hooks
- Server-side data fetching using Server Actions
- Client-side filtering and sorting for optimal performance
- Data reset functionality to restore initial state

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Development

The project uses the following key dependencies:

- Recharts for data visualization
- shadcn/ui for the component library
- Lucide React for icons
- Next.js Server Actions for data handling

## Performance Considerations

- Monte Carlo simulation uses seeded random generation for consistent SSR/CSR results
- Simulation calculations are memoized to prevent unnecessary recalculations
- Consistent number and date formatting to prevent hydration mismatches
- Client-side filtering and sorting for optimal performance
- Responsive design for all screen sizes
