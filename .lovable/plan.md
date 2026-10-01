# Hero "Find a Car" panel, sorting polish, and AI describe-your-car search

## 1. Hero search panel restyled (like the CarMax reference)
- Replace the current inline bar with a wide panel that overlaps the bottom of the hero image: solid card surface, soft shadow, "Find a Car" heading with a short accent underline.
- One row of underlined dropdowns on desktop: Make, Model (filled from the chosen make), Fuel Type, Year, Min Price, Max Price, then a bold accent "Search" button with a double-chevron.
- Keyword field kept as a small "or search by keyword" line beneath the row.
- Mobile: dropdowns stack two per row, full-width button.
- The three existing hero buttons stay exactly as they are; uses the existing Noir & Chrome colours (no red/blue copy of CarMax).
- Search still hands off to the marketplace with all filters pre-applied.

## 2. Marketplace sorting
Sorting already exists (Newest, Price low/high, Lowest mileage, Newest year). Polish:
- Add "Highest mileage" option.
- Keep the chosen sort when arriving from the hero or AI search, and show the sort control prominently above results on mobile.

## 3. "Describe your ideal car" AI search
- A "Describe it instead" tab in the hero panel and a matching box on the marketplace: buyer types e.g. "family SUV under 3M, automatic, petrol, not older than 2018".
- AI turns the text into filters (make, model, body type, fuel, transmission, year range, price range, max mileage, sort, keyword), shows them as removable chips, then opens the marketplace with them applied.
- Clear message if the AI can't understand the request or is busy; no disruptive error toasts.

## Technical details
- New backend function `ai-search-filters`: validates input (max ~500 chars), calls Lovable AI Gateway Responses API with `openai/gpt-6-astra`, streamed, structured output limited to the marketplace's existing URL params (`q, make, model, body, fuel, trans, minYear, maxYear, minPrice, maxPrice, maxMileage, sort`). Values clamped server-side (price to 200M). Handles 402/429 with friendly messages. Rate-limited via existing `rate_limits` table.
- Hero.tsx: new panel layout; models fetched per make from `vehicles`.
- MarketplaceSort.tsx: add `mileage_desc`; Marketplace.tsx sort switch updated.
- Shared helper converts AI filter JSON to URL params for both hero and marketplace.
