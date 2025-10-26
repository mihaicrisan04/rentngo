# Vehicle Classes Quick Start Guide

## 🚀 Getting Started in 5 Minutes

This guide will help you quickly set up and use the new Vehicle Classes feature.

## Step 1: Start Your Development Server

```bash
npm run dev
```

## Step 2: Seed Initial Vehicle Classes

You have two options:

### Option A: Via Convex Dashboard (Recommended)

1. Open your Convex dashboard: https://dashboard.convex.dev
2. Select your project
3. Go to "Functions" tab
4. Find `migrations/seedVehicleClasses`
5. Click "Run" button
6. Wait for success message

### Option B: Via Convex CLI

```bash
npx convex run migrations/seedVehicleClasses
```

**Result**: 15 vehicle classes created (Economy, Luxury, Sport, etc.)

## Step 3: Create Your First Vehicle with a Class

1. Navigate to the admin panel
2. Click "Add Vehicle"
3. Fill in vehicle details
4. In the "Class" field, click the dropdown
5. Select from existing classes OR click "Create new class"
6. Save the vehicle

**Done!** Your vehicle now has a dynamic class reference.

## Step 4: (Optional) Migrate Existing Vehicles

If you have existing vehicles, migrate them:

### Via Convex Dashboard:
1. Go to "Functions" tab
2. Find `migrations/migrateVehicleClasses`
3. Click "Run" button
4. Review the migration summary

### Via CLI:
```bash
npx convex run migrations/migrateVehicleClasses
```

## 🎯 What You Can Do Now

### Create New Vehicle Classes

**From Vehicle Dialog:**
1. Open create/edit vehicle dialog
2. Click the "+" button next to the Class dropdown
3. Fill in: Name, Display Name (optional), Description (optional)
4. Click "Create Class"
5. The new class is automatically selected in the dropdown
6. Continue creating/editing your vehicle

**Standalone Creation:**
- You can also create classes via Convex dashboard
- Navigate to `vehicleClasses.create` function
- Provide name, displayName, description
- Set `isActive: true`

### Manage Vehicle Classes

**View All Classes:**
- Classes appear in the Select dropdown when creating/editing vehicles
- Sorted by `sortIndex`
- Only active classes are shown
- Automatically updates when new classes are created

**Edit a Class:**
- Currently: via Convex dashboard
- Future: Admin UI for class management

**Delete a Class:**
- Via Convex dashboard Functions tab
- Run: `vehicleClasses.remove` with class ID
- Note: Cannot delete if vehicles reference it

## 📋 Common Tasks

### Add a New Custom Class

```typescript
// Via Convex dashboard or code
await ctx.runMutation(api.vehicleClasses.create, {
  name: "Electric Premium",
  displayName: "Electric Premium Vehicles",
  description: "High-end electric vehicles",
  isActive: true
});
```

### List All Classes

```typescript
// In your component
const classes = useQuery(api.vehicleClasses.list, { activeOnly: true });
```

### Update Vehicle with Class

```typescript
// In your component
await updateVehicle({
  id: vehicleId,
  classId: selectedClassId,
  // ... other fields
});
```

## 🔍 Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| No classes in dropdown | Run `seedVehicleClasses` migration |
| Can't create vehicle | Ensure at least one class exists |
| Can't delete class | Check if vehicles reference it |
| Class not showing | Verify `isActive` is true |
| New class not appearing | Check creation was successful; Convex should auto-update |

## 📁 Key Files Reference

```
convex/
├── schema.ts                           # Database schema
├── vehicleClasses.ts                   # CRUD operations
├── vehicles.ts                         # Updated with classId
└── migrations/
    ├── seedVehicleClasses.ts          # Seed initial classes
    └── migrateVehicleClasses.ts       # Migrate existing vehicles

components/admin/
├── create-class-dialog.tsx            # Class creation dialog
├── create-vehicle-dialog.tsx          # Updated with Select + Button
└── edit-vehicle-dialog.tsx            # Updated with Select + Button
```

## 🎨 UI Components Usage

### Vehicle Class Selection (Built into Vehicle Dialogs)

The class selection UI is integrated directly into the create/edit vehicle dialogs:
- Standard Select dropdown populated from `vehicleClasses.list`
- Button with FolderPlus icon to create new classes
- Reactive updates via Convex queries (no manual refresh needed)

### CreateClassDialog (Standalone Usage)

```tsx
import { CreateClassDialog } from "@/components/admin/create-class-dialog";

<CreateClassDialog
  open={isOpen}
  onOpenChange={setIsOpen}
  onSuccess={(newClassId) => {
    console.log("Created class:", newClassId);
    setClassId(newClassId);
  }}
/>
```

## 🔄 Migration Path

**Current State → Future State**

```
OLD (Hardcoded Enum)          NEW (Dynamic DB)
┌─────────────────┐          ┌──────────────────┐
│ vehicle.class   │   ───→   │ vehicle.classId  │
│ "economy"       │          │ Id<"classes">    │
└─────────────────┘          └──────────────────┘
                                      ↓
                             ┌──────────────────┐
                             │ vehicleClasses   │
                             │ - name           │
                             │ - displayName    │
                             │ - description    │
                             │ - sortIndex      │
                             │ - isActive       │
                             └──────────────────┘
```

**Transition Period:**
- Both `class` and `classId` fields exist
- `class` is deprecated but kept for safety
- New vehicles use `classId` only
- After migration, `class` can be removed

## 💡 Pro Tips

1. **Naming Convention**: Use Title Case for class names (e.g., "Super Sport", not "super-sport")

2. **Descriptions**: Add helpful descriptions for future reference and admin clarity

3. **Display Names**: Use for localization or customer-facing names different from internal names (this is what shows in the dropdown)

4. **Sort Order**: Classes are sorted by `sortIndex` - lower numbers appear first

5. **Active Status**: Set `isActive: false` to hide classes without deleting them

## 🚀 Next Steps

- [ ] Run seedVehicleClasses migration
- [ ] Migrate existing vehicles (if any)
- [ ] Create new vehicles with classes
- [ ] Test class selection in vehicle dialogs
- [ ] (Future) Build custom sorting UI
- [ ] (Future) Add class management admin page

## 📚 Full Documentation

For complete details, see:
- [VEHICLE_CLASSES_IMPLEMENTATION.md](./VEHICLE_CLASSES_IMPLEMENTATION.md) - Full implementation guide
- [convex/migrations/README.md](./convex/migrations/README.md) - Migration documentation

## ✅ Verification Checklist

After setup, verify:
- [ ] Vehicle classes table has data
- [ ] Can create new vehicle with class
- [ ] Can edit vehicle and change class
- [ ] Can create new class via "+" button
- [ ] New classes appear in dropdown automatically
- [ ] Duplicate class names are rejected
- [ ] Only active classes show in dropdown

---

**Setup Time**: ~5 minutes
**Status**: Production Ready ✅
**Support**: Check implementation docs for detailed troubleshooting