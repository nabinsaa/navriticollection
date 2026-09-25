# 🚀 Quick Start Guide - Categories & Settings

## ⚡ Getting Started in 3 Steps

### Step 1: Run Database Migration

1. Open **Supabase Dashboard**
2. Go to **SQL Editor**
3. Copy entire contents of `CATEGORIES_AND_SETTINGS_SCHEMA.sql`
4. Paste and click **Run**
5. Wait for success message

✅ This creates:
- Categories table with 6 default categories
- Enhanced settings with 23 configurable options
- All necessary RLS policies

---

### Step 2: Manage Categories

1. **Login as admin**
2. Go to **Admin Panel** → **Categories**
3. You'll see 6 default categories:
   - Saree
   - Kurti
   - Suit Set
   - Lehenga
   - Gown
   - Dupatta

#### Add New Category
1. Click **"+ Add Category"** button
2. Fill in details:
   - **Name**: Category name (e.g., "Accessories")
   - **Slug**: Auto-generated (e.g., "accessories")
   - **Description**: Brief description
   - **Image**: Click to upload (optional)
   - **Display Order**: Number for sorting
   - **Status**: Active/Inactive
3. Click **"Add Category"**

#### Edit Category
1. Click **Edit** icon on category card
2. Modify details
3. Click **"Update Category"**

#### Hide/Show Category
1. Click **Hide** button to make inactive
2. Click **Show** button to make active
3. Inactive categories don't appear in shop

#### Delete Category
1. Click **Delete** icon (trash)
2. Confirm deletion
3. Category removed permanently

---

### Step 3: Configure Store Settings

1. Go to **Admin Panel** → **Settings**
2. You'll see 6 tabs

#### 📋 General Tab
- **Store Name**: Your store's name (updates everywhere)
- **Store Description**: Brief description for SEO
- **Email**: Contact email
- **Phone**: Contact phone
- **Address**: Physical address

#### 🖼️ Images Tab
- **Store Logo**: 
  - Click upload area
  - Select image (max 5MB)
  - Recommended: 200x200px square
  - Preview appears
  - Click X to remove

- **Store Banner**:
  - Click upload area
  - Select image (max 5MB)
  - Recommended: 1920x400px landscape
  - Preview appears
  - Click X to remove

#### 💰 Pricing Tab
- **Currency**: Select from NPR, USD, JPY, EUR, GBP, INR
- **Shipping Fee**: Default shipping cost
- **Free Shipping Threshold**: Minimum order for free shipping
- **Minimum Order**: Minimum order amount (0 for no minimum)
- **Tax Rate**: Tax percentage (0-100)

#### 📦 Orders Tab
- **Default Order Status**: Status for new orders (Pending/Confirmed/Processing)
- **Low Stock Threshold**: Alert when stock falls below this number

#### ⚙️ Features Tab
- **Enable Reviews**: Toggle product reviews on/off
- **Enable Wishlist**: Toggle wishlist feature on/off
- **Enable Notifications**: Toggle notification alerts on/off

#### 🌐 Social Media Tab
- **Facebook**: Your Facebook page URL
- **Instagram**: Your Instagram profile URL
- **Twitter**: Your Twitter profile URL
- **YouTube**: Your YouTube channel URL
- **WhatsApp**: Your WhatsApp number

#### 💾 Save Settings
- Click **"Save All Settings"** button (top right)
- Wait for success message
- Settings apply immediately across the app

---

## 🎯 Common Tasks

### Task 1: Add a New Product Category

**Scenario**: You want to add "Accessories" category

1. Go to **Admin Panel** → **Categories**
2. Click **"+ Add Category"**
3. Fill in:
   - Name: `Accessories`
   - Slug: `accessories` (auto-generated)
   - Description: `Fashion accessories and jewelry`
   - Image: Upload accessory image
   - Display Order: `7`
   - Status: `Active`
4. Click **"Add Category"**
5. ✅ Category appears in shop filter!

---

### Task 2: Change Store Name

**Scenario**: Rebrand from "Vastra Elegance" to "Ethnic Couture"

1. Go to **Admin Panel** → **Settings** → **General** tab
2. Change **Store Name** to `Ethnic Couture`
3. Click **"Save All Settings"**
4. ✅ Store name updates in:
   - Header
   - Sidebar
   - Admin Panel
   - Browser tab title

---

### Task 3: Upload Store Logo

**Scenario**: Add your brand logo

1. Go to **Admin Panel** → **Settings** → **Images** tab
2. Click upload area under **Store Logo**
3. Select your logo file (PNG recommended)
4. Preview appears
5. Click **"Save All Settings"**
6. ✅ Logo displays in header and throughout app

---

### Task 4: Change Currency

**Scenario**: Switch from NPR to USD

1. Go to **Admin Panel** → **Settings** → **Pricing** tab
2. Change **Currency** to `USD - US Dollar ($)`
3. Click **"Save All Settings"**
4. ✅ All prices display in USD with $ symbol

---

### Task 5: Enable/Disable Features

**Scenario**: Turn off wishlist feature

1. Go to **Admin Panel** → **Settings** → **Features** tab
2. Toggle **Enable Wishlist** to OFF
3. Click **"Save All Settings"**
4. ✅ Wishlist feature disabled across app

---

## 📱 Where Settings Appear

### Store Name
- ✅ Header (top of every page)
- ✅ Sidebar menu
- ✅ Admin Panel title
- ✅ Browser tab title
- ✅ Footer (if implemented)

### Store Logo
- ✅ Header (next to store name)
- ✅ Login modal
- ✅ Email templates (future)

### Currency
- ✅ All product prices
- ✅ Cart totals
- ✅ Order summaries
- ✅ Admin dashboard

### Categories
- ✅ Shop page filter sidebar
- ✅ Product cards
- ✅ Product detail page
- ✅ Search results

### Features
- ✅ Reviews: Product detail page
- ✅ Wishlist: Product cards, sidebar menu
- ✅ Notifications: Header, admin dashboard

---

## 🔧 Troubleshooting

### Issue: Categories not appearing in shop

**Solution:**
1. Check if categories are **Active** (not Inactive)
2. Verify SQL migration was run
3. Refresh the shop page
4. Check browser console for errors

### Issue: Settings not saving

**Solution:**
1. Check you're logged in as **admin**
2. Verify RLS policies are set up
3. Check browser console for errors
4. Try refreshing and saving again

### Issue: Images not uploading

**Solution:**
1. Check file size (max 5MB)
2. Verify file format (PNG, JPG, JPEG)
3. Check browser console for errors
4. Try a different image

### Issue: Store name not updating

**Solution:**
1. Save settings first
2. Refresh the page
3. Clear browser cache
4. Check SettingsContext is working

---

## 💡 Pro Tips

### Tip 1: Category Images
- Use consistent image sizes (e.g., 400x400px)
- Use high-quality images
- Keep file sizes under 1MB for faster loading
- Use transparent backgrounds for logos

### Tip 2: Store Logo
- Use PNG with transparent background
- Square aspect ratio works best
- Minimum 200x200px for clarity
- Keep it simple and recognizable

### Tip 3: Store Banner
- Use landscape orientation (1920x400px)
- High-quality photography
- Brand colors and messaging
- Keep text minimal and readable

### Tip 4: Category Organization
- Use logical display order (1, 2, 3...)
- Group similar categories together
- Use clear, descriptive names
- Add helpful descriptions

### Tip 5: Settings Management
- Save settings regularly
- Test changes after saving
- Keep backup of important settings
- Document your configuration

---

## 📊 Database Structure

### Categories Table
```
id              | integer (auto)
name            | text (unique)
slug            | text (unique)
description     | text
image           | text (base64)
is_active       | boolean
display_order   | integer
created_at      | timestamp
updated_at      | timestamp
```

### Store Settings Table
```
id              | integer (auto)
setting_key     | text (unique)
setting_value   | text
updated_at      | timestamp
```

**Total Settings:** 23 configurable options

---

## 🎨 UI Components

### Categories Page
- **Grid Layout**: 3 columns on desktop, 1 on mobile
- **Card Design**: Image + info + actions
- **Modal Form**: Add/Edit categories
- **Search Bar**: Filter categories
- **Status Filter**: All/Active/Inactive

### Settings Page
- **Tabbed Interface**: 6 organized tabs
- **Form Inputs**: Text, number, select, toggle
- **Image Upload**: Preview + remove
- **Save Button**: Always visible in header
- **Responsive**: Works on all devices

---

## ✅ Checklist

Before going live:

- [ ] SQL migration executed
- [ ] Categories created and organized
- [ ] Category images uploaded
- [ ] Store name configured
- [ ] Store logo uploaded
- [ ] Store banner uploaded
- [ ] Currency set correctly
- [ ] Shipping fees configured
- [ ] Tax rate set (if applicable)
- [ ] Features toggled as needed
- [ ] Social media links added
- [ ] All settings saved
- [ ] Tested in shop page
- [ ] Verified across devices

---

## 🚀 Quick Commands

### SQL: View Categories
```sql
SELECT * FROM categories ORDER BY display_order;
```

### SQL: View Settings
```sql
SELECT * FROM store_settings ORDER BY setting_key;
```

### SQL: Update Store Name
```sql
UPDATE store_settings 
SET setting_value = 'New Store Name' 
WHERE setting_key = 'store_name';
```

### SQL: Activate Category
```sql
UPDATE categories 
SET is_active = true 
WHERE slug = 'category-slug';
```

---

## 📞 Support

### Documentation Files
- `CATEGORY_SETTINGS_IMPLEMENTATION.md` - Complete technical docs
- `CATEGORIES_AND_SETTINGS_SCHEMA.sql` - Database migration
- `QUICK_START_CATEGORIES_SETTINGS.md` - This file

### Common Questions

**Q: Can I have subcategories?**
A: Currently no, but you can use descriptive names like "Sarees - Silk" or "Sarees - Cotton"

**Q: How many categories can I have?**
A: Unlimited! The system supports as many as you need.

**Q: Can I reorder categories?**
A: Yes! Use the "Display Order" field (lower numbers appear first).

**Q: Do settings update in real-time?**
A: Yes! Settings apply immediately after saving.

**Q: Can I upload multiple images per category?**
A: Currently one image per category. You can change it anytime.

---

## 🎉 You're All Set!

Your store now has:
- ✅ Dynamic category management
- ✅ Comprehensive settings control
- ✅ Image upload capabilities
- ✅ Real-time updates
- ✅ Professional admin interface

**Start customizing your store now!** 🚀
