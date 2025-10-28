# Vehicle Ordering - Quick Start Guide

## 🚀 Getting Started

The vehicle ordering feature allows you to customize the display order of vehicle classes and vehicles within each class through an intuitive drag-and-drop interface.

## 📍 Access the Feature

1. **From Admin Dashboard**: Navigate to `/admin/vehicles`
2. **Click**: "Manage Ordering" button (next to "Add Vehicle")
3. **You're in!**: `/admin/vehicles/ordering`

## 🎯 Main Features

### 1. Class Ordering Page (`/admin/vehicles/ordering`)

**What you'll see:**
- Vertical list of all vehicle classes
- Each class card shows:
  - Class name with vehicle count
  - Horizontal scrollable list of vehicle thumbnails
  - Up to 10 vehicles shown with make/model
  - "+X more" indicator for classes with >10 vehicles
  - "Manage" button to enter class ordering

**Actions:**
- **Drag & Drop**: Click and hold the grip icon (☰) on any card, drag up/down to reorder
- **Add Class**: Click "Add Class" button in top right
- **View Details**: Click "Manage" button on any class card to order vehicles within that class

**Auto-Save:** Changes save automatically when you drop a card!

### 2. Vehicle Ordering Page (`/admin/vehicles/ordering/[classId]`)

**What you'll see:**
- List of vehicles in the selected class
- Each vehicle card shows:
  - Thumbnail image (or "No Image" placeholder)
  - Make and model
  - Year
  - Status badge (Available/Rented/Maintenance)

**Actions:**
- **Drag & Drop**: Click and hold the grip icon (☰) on any card, drag up/down to reorder
- **Go Back**: Click back arrow button to return to class ordering

**Auto-Save:** Changes save automatically when you drop a card!

## 💡 Tips & Tricks

### Best Practices
1. **Order by Popularity**: Place most popular classes at the top
2. **Featured First**: Put premium/luxury classes early for visibility
3. **Seasonal Ordering**: Adjust order based on season (e.g., convertibles in summer)
4. **Within Classes**: Order vehicles by price, popularity, or availability

### Visual Feedback
- **Hover**: Cards get a subtle shadow and border highlight
- **Dragging**: Active card becomes semi-transparent and slightly larger
- **Success**: Green toast notification appears
- **Error**: Red toast notification + automatic revert to previous order

### Keyboard Support
- **Tab**: Navigate between cards
- **Space/Enter**: Activate drag mode
- **Arrow Keys**: Move card up/down while dragging
- **Escape**: Cancel drag operation

## 🔄 Workflow Example

### Scenario: Reorder classes to highlight luxury vehicles

1. Navigate to `/admin/vehicles`
2. Click "Manage Ordering"
3. Find "Luxury" class card
4. Click and hold the grip icon
5. Drag to top of list
6. Release
7. ✅ Success toast appears - order saved!

### Scenario: Organize vehicles within "Economy" class

1. From class ordering page, click "Manage" button on "Economy" card
2. See all economy vehicles listed
3. Drag "Toyota Corolla 2024" to top (most popular)
4. Drag "Honda Civic 2024" below it
5. Release
6. ✅ Success toast appears - order saved!
7. Click back arrow to return

## 📊 How Ordering Works

### Class Sort Order
- Stored in `vehicleClasses.sortIndex` field
- Lower index = appears higher in list
- Indices are 0-based (0, 1, 2, 3...)
- Updated via `vehicleClasses.reorder` mutation

### Vehicle Sort Order
- Stored in `vehicles.classSortIndex` field
- Lower index = appears higher within its class
- Indices are 0-based (0, 1, 2, 3...)
- Only affects order within same class
- Updated via `vehicles.reorder` mutation

## 🎨 Visual Guide

```
Class Ordering Page Layout:
┌─────────────────────────────────────────────────────┐
│ Class Ordering                      [Add Class]     │
├─────────────────────────────────────────────────────┤
│ ┌───────────────────────────────────────────────┐   │
│ │ ☰ Luxury             [Manage →]               │   │
│ │   8 vehicles                                  │   │
│ │   ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐  │   │
│ │   │🚗│ │🚗│ │🚗│ │🚗│ │🚗│ │🚗│ │🚗│ │🚗│  │   │
│ │   └──┘ └──┘ └──┘ └──┘ └──┘ └──┘ └──┘ └──┘  │   │
│ │   BMW  Merc Audi Lexus Porsc Jagu Tesla Volvo│   │
│ │   5    E-Cl A6   ES    911   XF   Model Seri │   │
│ └───────────────────────────────────────────────┘   │
│ ┌───────────────────────────────────────────────┐   │
│ │ ☰ Economy            [Manage →]               │   │
│ │   12 vehicles                                 │   │
│ │   ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐ ... ┌───┐  │   │
│ │   │🚗│ │🚗│ │🚗│ │🚗│ │🚗│ │🚗│     │+6 │  │   │
│ │   └──┘ └──┘ └──┘ └──┘ └──┘ └──┘     └───┘  │   │
│ │   Toyo Hond Hyun Kia  Niss Ford      more   │   │
│ │   Coro Civi Elan Rio  Sent Fies             │   │
│ └───────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

```
Vehicle Ordering Page Layout:
┌─────────────────────────────────────────┐
│ [←] Luxury                              │
│     Drag and drop to reorder vehicles   │
├─────────────────────────────────────────┤
│ ┌─────────────────────────────────────┐ │
│ │ ☰ [img] BMW 5 Series      Available │ │
│ │         2024                         │ │
│ └─────────────────────────────────────┘ │
│ ┌─────────────────────────────────────┐ │
│ │ ☰ [img] Mercedes E-Class  Available │ │
│ │         2024                         │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

## ⚠️ Important Notes

1. **Real-time Updates**: Changes are immediately visible to other admins
2. **No Confirmation**: Drops save instantly - no undo button (yet)
3. **Error Handling**: If save fails, order reverts automatically
4. **New Vehicles**: Newly added vehicles appear at the bottom of their class
5. **New Classes**: Newly created classes appear at the bottom of the list

## 🆘 Troubleshooting

### Cards won't drag
- **Check**: Make sure you're clicking on the grip icon (☰)
- **Try**: Refresh the page
- **Browser**: Ensure JavaScript is enabled

### Order not saving
- **Check**: Network connection
- **Look for**: Red error toast notification
- **Action**: Try dragging again

### Images not loading
- **Normal**: Images load asynchronously
- **Wait**: Give it a few seconds
- **Missing**: Some vehicles may not have images set

### Breadcrumb shows ID
- **Normal**: Class name loads asynchronously
- **Wait**: Should update within 1-2 seconds
- **Issue**: If persists, class may not exist

## 📱 Browser Support

✅ Chrome (recommended)
✅ Firefox
✅ Safari
✅ Edge
⚠️ Mobile browsers (touch drag supported but less optimal)

## 🔗 Related Features

- **Vehicle Management**: `/admin/vehicles` - Add/edit vehicles
- **Class Management**: Create classes via "Add Class" button
- **Featured Cars**: Separate feature for homepage highlights

## 📚 Technical Details

For developers and advanced users, see:
- `VEHICLE_ORDERING_IMPLEMENTATION.md` - Full technical documentation
- `VEHICLE_CLASSES_IMPLEMENTATION.md` - Vehicle classes system overview

---

**Need Help?** Contact the development team or check the full implementation docs.

**Last Updated**: January 2025