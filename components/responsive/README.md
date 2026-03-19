# 📱💻 Responsive Design System

Hệ thống responsive design được thiết kế đặc biệt cho ứng dụng Support HR, tối ưu hóa trải nghiệm người dùng trên Desktop, Tablet và Mobile.

## 🎯 Tính năng chính

### ✨ **Platform-Specific Layouts**
- **Desktop (1024px+)**: Sidebar cố định, hover effects, không gian rộng rãi
- **Tablet (768-1023px)**: Sidebar overlay, touch-optimized, layout lai
- **Mobile (<768px)**: Full-screen, bottom navigation, touch-first design

### 🔧 **Responsive Components**
- `ResponsiveLayout` - Layout chính tự động detect device
- `ResponsiveGrid` - Grid system linh hoạt  
- `ResponsiveButton` - Buttons tối ưu cho touch/mouse
- `ResponsiveCard` - Cards với spacing dynamic
- `ResponsiveImage` - Images với size responsive

### 📏 **Breakpoints**
```typescript
const breakpoints = {
  mobile: 768,    // 0-767px
  tablet: 1024,   // 768-1023px  
  desktop: 1920   // 1024px+
}
```

## 🚀 Cách sử dụng

### 1. Import components
```typescript
import { 
  ResponsiveLayout,
  ResponsiveGrid, 
  ResponsiveButton,
  ResponsiveCard,
  useDeviceDetection 
} from './thanh-phan/responsive';
```

### 2. Sử dụng ResponsiveLayout (Main wrapper)
```typescript
function App() {
  return (
    <ResponsiveLayout>
      {/* Nội dung của app */}
    </ResponsiveLayout>
  );
}
```

### 3. Detect device type
```typescript
const device = useDeviceDetection();

console.log(device.type);      // 'desktop' | 'tablet' | 'mobile'
console.log(device.isMobile);  // boolean
console.log(device.width);     // number
```

### 4. Responsive Grid
```typescript
<ResponsiveGrid 
  mobileColumns={1}    // 1 cột trên mobile
  tabletColumns={2}    // 2 cột trên tablet
  desktopColumns={4}   // 4 cột trên desktop
  gap="md"             // Khoảng cách giữa items
>
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</ResponsiveGrid>
```

### 5. Responsive Buttons
```typescript
<ResponsiveButton
  variant="primary"    // 'primary' | 'secondary' | 'outline' | 'ghost'
  size="md"           // 'sm' | 'md' | 'lg' (auto-adjusts for touch)
  fullWidth={true}    // Full width on mobile
  icon={<FaDownload />}
  onClick={handleClick}
>
  Download File
</ResponsiveButton>
```

### 6. Responsive Cards
```typescript
<ResponsiveCard
  title="Card Title"
  subtitle="Card subtitle" 
  elevation="md"       // Shadow level
  padding="lg"         // Auto-adjusts for device
  clickable={true}
  onClick={handleClick}
>
  Card content here
</ResponsiveCard>
```

## 📱 Device-specific Features

### Mobile (< 768px)
- **Bottom Navigation**: Sticky navigation bar ở dưới cùng
- **Touch Targets**: Minimum 48px touch targets
- **Pull-to-refresh**: Space for pull-to-refresh gesture
- **Safe Areas**: Hỗ trợ iPhone notch/dynamic island
- **Swipe Gestures**: Touch-friendly interactions

### Tablet (768px - 1023px) 
- **Hybrid Layout**: Kết hợp desktop và mobile
- **Touch-optimized**: Buttons và controls lớn hơn
- **Overlay Sidebar**: Sidebar dạng overlay thay vì fixed
- **Enhanced Focus**: Focus indicators lớn hơn

### Desktop (1024px+)
- **Fixed Sidebar**: Sidebar luôn hiển thị
- **Hover Effects**: Rich hover animations
- **Keyboard Navigation**: Full keyboard support
- **Multi-column**: Layout nhiều cột
- **Custom Scrollbar**: Styled scrollbars

## 🎨 CSS Utilities

### Responsive Visibility
```css
.mobile-only     /* Chỉ hiển thị trên mobile */
.tablet-only     /* Chỉ hiển thị trên tablet */
.desktop-only    /* Chỉ hiển thị trên desktop */

.mobile-hidden   /* Ẩn trên mobile */
.tablet-hidden   /* Ẩn trên tablet */
.desktop-hidden  /* Ẩn trên desktop */
```

### Responsive Spacing
```css
.spacing-responsive  /* Auto spacing: 16px/24px/32px */
.spacing-mobile      /* 16px padding */
.spacing-tablet      /* 24px padding */
.spacing-desktop     /* 32px padding */
```

### Touch Optimizations
```css
.touch-target        /* Minimum 48px touch target */
.mobile-scale-tap    /* Scale animation on tap */
.focus-responsive    /* Responsive focus indicators */
```

## 🔍 Demo Component

Xem file `thanh-phan/demo/ResponsiveDemo.tsx` để có ví dụ chi tiết về cách sử dụng tất cả components.

## 📊 Performance

- **Lazy Loading**: Components chỉ load khi cần
- **Touch Detection**: Tự động detect touch vs mouse/keyboard
- **Optimized Rendering**: Minimal re-renders khi resize
- **Memory Efficient**: Event listeners được cleanup properly

## 🎯 Best Practices

### 1. **Always wrap app với ResponsiveLayout**
```typescript
// ✅ Đúng
<ResponsiveLayout>
  <YourApp />
</ResponsiveLayout>

// ❌ Sai - Không có responsive wrapper
<YourApp />
```

### 2. **Sử dụng responsive components thay vì HTML natives**
```typescript
// ✅ Đúng - Tự động responsive
<ResponsiveButton>Click me</ResponsiveButton>

// ❌ Không tốt - Phải tự handle responsive
<button className="btn">Click me</button>
```

### 3. **Design mobile-first**
```typescript
// ✅ Đúng - Mobile first approach
<ResponsiveGrid 
  mobileColumns={1}    // Bắt đầu với mobile
  tabletColumns={2}    // Scale up cho tablet
  desktopColumns={3}   // Scale up cho desktop
/>
```

### 4. **Test trên thiết bị thật**
- Chrome DevTools cho testing ban đầu
- Test trên thiết bị thật để verify touch interactions
- Kiểm tra safe areas trên iPhone với notch

### 5. **Accessibility**
- Luôn có focus indicators rõ ràng
- Touch targets >= 48px
- Keyboard navigation support
- Screen reader compatible

## 🐛 Troubleshooting

### Lỗi thường gặp:

1. **Layout không responsive**: Đảm bảo wrap với `ResponsiveLayout`
2. **Buttons quá nhỏ trên mobile**: Sử dụng `ResponsiveButton`
3. **Sidebar không hoạt động**: Kiểm tra device detection
4. **Performance issues**: Minimize state changes trong resize handler

## 📈 Future Enhancements

- [ ] Gesture support (swipe, pinch-to-zoom)
- [ ] PWA optimizations
- [ ] Offline-first responsive components
- [ ] Responsive videos/media
- [ ] Advanced animations per device type

---

*Được thiết kế đặc biệt cho Support HR App với focus vào UX tối ưu cho recruiter workflow* 🎯