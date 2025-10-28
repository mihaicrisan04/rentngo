# Vehicle Classes - Quick Reference Card

## 🚀 First Time Setup (Run Once)

```bash
# 1. Start your dev server
npm run dev

# 2. Seed initial classes (creates 15 standard classes)
npx convex run migrations/seedVehicleClasses

# 3. Migrate existing vehicles (if you have any)
npx convex run migrations/migrateVehicleClasses
```

## 🎯 Daily Usage

### Creating a Vehicle with a Class

1. Open admin panel → "Create Vehicle"
2. Fill in vehicle details
3. **Class field**: 
   - Click dropdown → Select existing class
   - OR click **📁 +** button → Create new class
4. Save vehicle

### Creating a New Class

**Option A: From Vehicle Dialog** (Recommended)
1. Click the **📁 +** button next to Class dropdown
2. Fill in:
   - **Name**: `Electric Premium` (required)
   - **Display Name**: `Electric Premium Vehicles` (optional)
   - **Description**: `High-end electric vehicles` (optional)
3. Click "Create Class"
4. ✨ New class auto-selected and appears in dropdown!

**Option B: Via Convex Dashboard**
1. Go to Convex Dashboard → Functions
2. Run `vehicleClasses.create`
3. Args: `{ name: "...", displayName: "...", isActive: true }`

## 📋 Common Tasks

### List All Classes
```typescript
const classes = useQuery(api.vehicleClasses.list, { activeOnly: true });
```

### Create a Class
```typescript
const classId = await createClass({
  name: "Super Premium",
  displayName: "Super Premium Vehicles",
  description: "Ultra high-end luxury",
  isActive: true
});
```

### Update a Class
```typescript
await updateClass({
  id: classId,
  name: "Updated Name",
  isActive: false  // Hide without deleting
});
```

### Delete a Class (via Dashboard)
```typescript
// Function: vehicleClasses.remove
// Args: { id: "..." }
// Note: Fails if vehicles reference this class
```

## 🎨 UI Components

### The Class Selection UI
```
┌──────────────────────────────────┐
│ Class: [Luxury ▼] [📁 +]        │
│         └─ Select   └─ Create    │
└──────────────────────────────────┘
```

### Dropdown Shows
- Economy
- Compact
- Intermediate
- Standard
- Full-Size
- Premium
- Luxury
- Sport
- Super Sport
- Supercars
- Executive
- Business
- Van
- Convertible
- Commercial

## 🔄 How Auto-Updates Work

```
User clicks [📁 +]
    ↓
Creates new class
    ↓
Convex mutation runs
    ↓
Database updated
    ↓
Convex reactive query detects change
    ↓
React re-renders automatically
    ↓
✨ New class appears in dropdown!
```

**No refresh needed!** Thanks to Convex reactive queries.

## 🐛 Quick Fixes

| Problem | Solution |
|---------|----------|
| Empty dropdown | `npx convex run migrations/seedVehicleClasses` |
| Can't save vehicle | Ensure you selected a class |
| New class missing | Check `isActive: true` |
| Can't delete class | Reassign vehicles first |

## 📝 Validation Rules

### Class Name
- ✅ Required
- ✅ Letters, numbers, spaces, hyphens only
- ✅ Max 50 characters
- ✅ Must be unique
- ❌ No special characters

### Display Name
- Optional
- Max 50 characters
- Shows in dropdown instead of name

### Description
- Optional
- Max 200 characters
- For admin reference

## 🎯 Best Practices

1. **Name**: Use Title Case → `Super Sport` (not `super-sport`)
2. **Display Name**: Use for customer-facing names
3. **Description**: Explain what vehicles fit this class
4. **Sort Order**: Auto-assigned, can customize later
5. **Active Status**: Use `isActive: false` to hide (don't delete)

## 📊 Database Schema

```typescript
// vehicleClasses table
{
  _id: Id<"vehicleClasses">,
  name: string,              // "Luxury"
  displayName?: string,      // "Luxury Vehicles"
  description?: string,      // "Top-tier luxury..."
  sortIndex: number,         // 6
  isActive: boolean,         // true
}

// vehicles table (updated)
{
  // ... other fields
  classId?: Id<"vehicleClasses">,  // NEW!
  classSortIndex?: number,          // For future sorting
  class?: "economy" | "luxury"...,  // DEPRECATED!
}
```

## 🚀 Future Features (Already Prepared)

- [ ] Drag-and-drop class reordering
- [ ] Drag-and-drop vehicle reordering within classes
- [ ] Class management admin page
- [ ] Class icons/images
- [ ] Class-specific pricing rules
- [ ] Class analytics

## 📁 Key Files

```
convex/
├── vehicleClasses.ts        ← CRUD operations
├── schema.ts                ← Database schema
└── migrations/
    ├── seedVehicleClasses.ts
    └── migrateVehicleClasses.ts

components/admin/
├── create-class-dialog.tsx   ← Dialog component
├── create-vehicle-dialog.tsx ← Has Select + Button
└── edit-vehicle-dialog.tsx   ← Has Select + Button
```

## 💡 Tips

- **Creating First Vehicle?** → Run seed migration first!
- **New Class Not Showing?** → Check browser console for errors
- **Need Custom Sort?** → Edit `sortIndex` via Convex dashboard
- **Want to Hide a Class?** → Set `isActive: false` (don't delete)
- **Migrating Data?** → Old `class` field still works during transition

## 🎓 Learn More

- **Full Guide**: `VEHICLE_CLASSES_IMPLEMENTATION.md`
- **Quick Start**: `VEHICLE_CLASSES_QUICKSTART.md`
- **Summary**: `VEHICLE_CLASSES_SUMMARY.md`
- **Migrations**: `convex/migrations/README.md`

---

**Status**: ✅ Production Ready  
**Last Updated**: 2024  
**Quick Setup**: 3 minutes