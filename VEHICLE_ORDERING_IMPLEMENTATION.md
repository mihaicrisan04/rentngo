# Vehicle Ordering Implementation Summary

## 📋 Overview

This document describes the implementation of the vehicle class and vehicle ordering feature, which allows administrators to customize the display order of vehicle classes and vehicles within each class through drag-and-drop interfaces.

## ✅ Completed Implementation

### 1. Backend Functions (`convex/vehicles.ts`)

#### New Query: `getByClass`
- **Args**: `classId: Id<"vehicleClasses">`
- **Returns**: Array of vehicles filtered by class, sorted by `classSortIndex`
- **Purpose**: Fetch all vehicles belonging to a specific class for the ordering interface
- **Features**:
  - Returns minimal vehicle data (id, make, model, year, status, sortIndex, mainImageId)
  - Automatically sorts by `classSortIndex` (defaults to 0 if not set)

#### New Mutation: `reorder`
- **Args**: `updates: Array<{ id: Id<"vehicles">, classSortIndex: number }>`
- **Returns**: `null`
- **Purpose**: Bulk update vehicle sort indices within a class
- **Features**:
  - Validates vehicle existence
  - Updates `classSortIndex` field for each vehicle
  - Used by drag-and-drop interface to save new order

### 2. UI Components

#### `components/admin/class-ordering-card.tsx`
Card component for displaying vehicle classes in the ordering interface:
- **Props**:
  - `class` - Vehicle class data (id, name, displayName, description)
  - `vehicleCount` - Number of vehicles in class
  - `vehiclePreview` - Array of vehicle make/model for preview (max 10 shown)
  - `isDragging` - Boolean for drag state styling
  - `onNavigate` - Handler for navigating to class detail (called by Manage button)
- **Features**:
  - Drag handle (GripVertical icon) on left
  - Class name/display name with vehicle count subtitle
  - "Manage →" button in top right for navigation
  - Horizontal scrollable vehicle preview list
  - Small 80x80px squares with car emoji icon
  - Make/model text below each square (very small, 10px)
  - "+X more" indicator for classes with >10 vehicles
  - Hover and drag state styling
  - Empty state message when no vehicles
  - Clicking card does NOT navigate (only drag handle is interactive)
  - Manage button has stopPropagation to prevent drag on button click

#### `components/admin/vehicle-ordering-card.tsx`
Card component for displaying vehicles in the ordering interface:
- **Props**:
  - `vehicle` - Vehicle data (id, make, model, year, status, mainImageId)
  - `imageUrl` - Optional image URL for thumbnail
  - `isDragging` - Boolean for drag state styling
- **Features**:
  - Drag handle (GripVertical icon)
  - 64x64px thumbnail with fallback "No Image" state
  - Vehicle make, model, and year
  - Status badge with color coding (available/rented/maintenance)
  - Hover and drag state styling
  - Compact 80px height design

### 3. Admin Pages

#### `/app/admin/vehicles/ordering/page.tsx`
Main ordering page for vehicle classes:
- **Features**:
  - Vertical list of class cards (drag-and-drop enabled)
  - "Add Class" button in header (opens CreateClassDialog)
  - Click "Manage" button on class card to navigate to vehicle ordering for that class
  - Real-time vehicle count and preview for each class
  - Empty state with "Create First Class" button
  - Loading state with spinner
  - Toast notifications for success/error
  - Auto-saves order on drop using `vehicleClasses.reorder`
  - Reverts order on save failure
- **Tech Stack**:
  - `@dnd-kit/core` for drag-and-drop
  - `@dnd-kit/sortable` for vertical list strategy
  - Convex reactive queries for real-time updates
  - React state for optimistic updates

#### `/app/admin/vehicles/ordering/[classId]/page.tsx`
Detail page for ordering vehicles within a specific class:
- **Features**:
  - Back button to return to class ordering
  - Class name in header (from dynamic breadcrumb)
  - Vertical list of vehicle cards (drag-and-drop enabled)
  - Vehicle thumbnails with image URL fetching
  - Status badges on each vehicle
  - Empty state with helpful message
  - Loading state with spinner
  - Toast notifications for success/error
  - Auto-saves order on drop using `vehicles.reorder`
  - Reverts order on save failure
  - Max-width container (3xl) for better readability
- **Tech Stack**:
  - `@dnd-kit/core` for drag-and-drop
  - `@dnd-kit/sortable` for vertical list strategy
  - Convex reactive queries for real-time updates
  - Image URL fetching per vehicle via wrapper component

### 4. Updated Pages

#### `/app/admin/vehicles/page.tsx`
Added "Manage Ordering" button to vehicle management page:
- **Changes**:
  - New button with ArrowUpDown icon
  - Links to `/admin/vehicles/ordering`
  - Positioned next to "Add Vehicle" button
  - Uses outline variant for secondary action
  - Imports useRouter for navigation

#### `/app/admin/layout.tsx`
Enhanced breadcrumb system with dynamic class name fetching:
- **Changes**:
  - Detects ordering routes (`/admin/vehicles/ordering/[classId]`)
  - Fetches class data when on class detail page
  - Displays class `displayName` or `name` in breadcrumb
  - Uses Convex query with skip pattern for conditional fetching
  - Maintains automatic breadcrumb generation for other routes
  - Properly handles path segments and href generation

## 🎯 Key Features

✅ **Vertical Drag-and-Drop** - Both classes and vehicles use vertical list layout
✅ **Real-time Updates** - Convex reactive queries keep data in sync
✅ **Optimistic UI** - Immediate feedback with revert on error
✅ **Image Loading** - Dynamic image URL fetching per vehicle
✅ **Empty States** - Helpful messages and CTAs when no data
✅ **Loading States** - Spinners during data fetching
✅ **Toast Notifications** - Success/error feedback for user actions
✅ **Dynamic Breadcrumbs** - Class names appear in navigation
✅ **Status Badges** - Color-coded vehicle status indicators
✅ **Responsive Design** - Works on all screen sizes
✅ **Type Safety** - Full TypeScript support throughout

## 📁 File Structure

```
rentngo/
├── app/admin/vehicles/
│   ├── page.tsx                          # ✅ Updated with ordering button
│   └── ordering/
│       ├── page.tsx                      # ✅ NEW: Class ordering view
│       └── [classId]/
│           └── page.tsx                  # ✅ NEW: Vehicle ordering view
├── components/admin/
│   ├── class-ordering-card.tsx           # ✅ NEW: Class card component
│   └── vehicle-ordering-card.tsx         # ✅ NEW: Vehicle card component
├── convex/
│   └── vehicles.ts                       # ✅ Updated with getByClass & reorder
└── app/admin/
    └── layout.tsx                        # ✅ Updated breadcrumbs
```

## 🔧 Technical Details

### Drag-and-Drop Implementation
Uses `@dnd-kit` library with the following setup:
- **Sensors**: PointerSensor and KeyboardSensor for accessibility
- **Strategy**: `verticalListSortingStrategy` for vertical lists
- **Collision**: `closestCenter` detection algorithm
- **Transform**: CSS transform for smooth animations
- **Reordering**: `arrayMove` utility for state updates

### Data Flow
1. User drags item to new position
2. Component updates local state optimistically
3. Component calls Convex mutation with new indices
4. On success: Toast notification, state remains updated
5. On error: Toast notification, state reverts to server data

### Image URL Fetching Pattern
```typescript
// Wrapper component to satisfy React Hooks rules
function VehicleCardWithImage({ vehicle }) {
  const imageUrl = useQuery(
    api.vehicles.getImageUrl,
    vehicle.mainImageId ? { imageId: vehicle.mainImageId } : "skip"
  );
  return <SortableVehicleCard vehicle={vehicle} imageUrl={imageUrl ?? null} />;
}
```

### Breadcrumb Dynamic Fetching
```typescript
const classIdSegment = isOrderingRoute && pathSegments.length > 3 
  ? pathSegments[3] 
  : null;

const vehicleClass = useQuery(
  api.vehicleClasses.getById,
  classIdSegment ? { id: classIdSegment as Id<"vehicleClasses"> } : "skip"
);
```

## 🎨 Design Specs

### Class Ordering Cards
- Full-width layout
- Padding: 16px (p-4)
- Drag handle: Left side, GripVertical icon
- Header: Class name (18px bold), vehicle count (12px muted)
- Manage button: Top right, ghost variant, with ArrowRight icon
- Vehicle preview: Horizontal scrollable list
  - Each item: 80x80px square with car emoji (🚗)
  - Text: 10px font size, 2 lines max (line-clamp-2)
  - Shows up to 10 vehicles
  - "+X more" card for classes with >10 vehicles
  - Scrollbar: Thin, muted thumb, transparent track
- Empty state: Dashed border box with centered text
- Hover: Shadow increase, border highlight
- Drag: Opacity 50%, scale 105%, shadow increase
- Card itself is NOT clickable (only Manage button navigates)

### Vehicle Ordering Cards
- Max-width: 3xl container
- Height: ~80px compact design
- Padding: 12px (p-3)
- Thumbnail: 64x64px, rounded, with fallback
- Content: Make/model, year, status badge
- Status colors:
  - Available: Green
  - Rented: Blue
  - Maintenance: Orange
- Hover: Shadow increase, border highlight
- Drag: Opacity 50%, scale 105%, shadow increase

### Empty States
- Centered layout
- Border: 2px dashed
- Padding: 48px vertical (py-12)
- Text: Muted foreground color
- CTA button when applicable

## 🚀 Usage Guide

### Reordering Vehicle Classes
1. Navigate to `/admin/vehicles`
2. Click "Manage Ordering" button
3. Drag class cards up/down by the grip handle to reorder
4. Order saves automatically
5. Click "Manage" button on any class card to order vehicles within it

### Reordering Vehicles Within a Class
1. From class ordering page, click a class card
2. Or navigate to `/admin/vehicles/ordering/[classId]`
3. Drag vehicle cards up/down to reorder
4. Order saves automatically
5. Click back button to return to class ordering

### Adding New Classes
1. From class ordering page, click "Add Class" button
2. Fill in class details (name, displayName, description)
3. New class appears at bottom of list
4. Drag by grip handle to desired position
5. Click "Manage" button to add vehicles to the new class

## ⚠️ Important Notes

1. **Sort Index Initialization**: Vehicles created before this feature will have `classSortIndex: undefined`, which defaults to 0 when sorting
2. **Image Loading**: Images load asynchronously; thumbnails show "No Image" during loading
3. **Error Handling**: Failed saves show toast and revert UI to server state
4. **Breadcrumb Loading**: Class name in breadcrumb loads asynchronously
5. **Empty Classes**: Classes with no vehicles show "No vehicles in this class yet" message
6. **Keyboard Accessibility**: Drag-and-drop supports keyboard navigation via KeyboardSensor

## 🐛 Troubleshooting

**Issue**: Drag-and-drop not working
- **Solution**: Ensure `@dnd-kit` packages are installed; check console for errors

**Issue**: Images not showing in vehicle cards
- **Solution**: Verify `mainImageId` exists and storage URLs are accessible

**Issue**: Order not saving
- **Solution**: Check Convex mutations are deployed; verify network connectivity

**Issue**: Breadcrumb showing ID instead of class name
- **Solution**: Wait for async query to load; check class exists in database

**Issue**: "React Hook" errors in console
- **Solution**: Code uses proper hook patterns; ensure React version is compatible

## 📊 Database Schema

### vehicleClasses Table
- `sortIndex` (number) - Order of classes in admin interface

### vehicles Table
- `classId` (optional Id<"vehicleClasses">) - Reference to vehicle class
- `classSortIndex` (optional number) - Order within class (NEW: utilized by this feature)

## 🔮 Future Enhancements

- [ ] Bulk operations (move multiple vehicles between classes)
- [ ] Search/filter in ordering views
- [ ] Undo/redo functionality
- [ ] Keyboard shortcuts (Ctrl+Z, Ctrl+Y)
- [ ] Advanced animations (spring physics)
- [ ] Collapsible class sections on main page
- [ ] Split view (classes + vehicles simultaneously)
- [ ] Export/import ordering configurations
- [ ] Analytics (most viewed classes/vehicles)

---

**Implementation Date**: January 2025
**Status**: ✅ Complete - Ready for Use
**Dependencies**: @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities (already installed)