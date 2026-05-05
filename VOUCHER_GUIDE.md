# Voucher System - Hướng dẫn Sử dụng

## Tổng Quan

Hệ thống voucher cho phép người bán tạo, phân phối và quản lý các mã giảm giá linh hoạt. Người mua có thể áp dụng voucher trong quá trình thanh toán để giảm giá đơn hàng.

## Kiến Trúc

### Database Models

#### Voucher
- `id`: UUID (khóa chính)
- `code`: Mã voucher duy nhất (VD: SAVE20, FREESHIP)
- `type`: Loại giảm giá (FIXED_AMOUNT, PERCENTAGE, FREE_SHIPPING)
- `value`: Giá trị giảm (số tiền hoặc %)
- `minOrderAmount`: Giá trị đơn hàng tối thiểu
- `maxDiscount`: Giảm giá tối đa (cho % vouchers)
- `maxUses`: Tổng lần dùng toàn bộ
- `maxUsesPerUser`: Tối đa lần dùng trên mỗi người dùng
- `currentUses`: Lần dùng hiện tại
- `applicableCategories`: Danh mục áp dụng (JSON array)
- `applicableProductIds`: Sản phẩm áp dụng (JSON array)
- `applicableSellers`: Người bán áp dụng (JSON array)
- `excludedUserIds`: Người dùng bị loại (JSON array)
- `startsAt`: Ngày bắt đầu
- `expiresAt`: Ngày hết hạn
- `status`: ACTIVE | INACTIVE | EXPIRED

#### VoucherUsage
- `voucherId`: FK -> Voucher.id
- `userId`: FK -> User.id
- `orderId`: FK -> Order.id
- `createdAt`: Thời điểm sử dụng

#### Order (mở rộng)
- `voucherCode`: Mã voucher được áp dụng
- `appliedVoucherId`: FK -> Voucher.id
- `discount`: Số tiền giảm giá (đã tính)

### API Endpoints

#### Tạo Voucher (Seller/Admin)
```
POST /api/vouchers
Content-Type: application/json
Authorization: Bearer <token>

{
  "code": "SAVE20",
  "type": "PERCENTAGE",
  "value": 20,
  "minOrderAmount": 100000,
  "maxDiscount": 200000,
  "maxUses": 100,
  "maxUsesPerUser": 3,
  "applicableCategories": ["cat-001"],
  "applicableProductIds": [],
  "applicableSellers": ["seller-001"],
  "excludedUserIds": [],
  "startsAt": "2026-05-05T00:00:00Z",
  "expiresAt": "2026-06-05T23:59:59Z"
}

Response:
{
  "success": true,
  "data": {
    "voucher": {
      "id": "voucher-001",
      "code": "SAVE20",
      "type": "PERCENTAGE",
      "value": 20,
      ...
    }
  }
}
```

#### Áp Dụng Voucher (Checkout)
```
POST /api/vouchers/apply
Content-Type: application/json
Authorization: Bearer <token>

{
  "voucherCode": "SAVE20",
  "subtotal": 500000,
  "categoryIds": ["cat-001"],
  "productIds": ["prod-001"],
  "sellerId": "seller-001"
}

Response:
{
  "success": true,
  "data": {
    "voucherId": "voucher-001",
    "code": "SAVE20",
    "type": "PERCENTAGE",
    "discount": 100000,
    "isValid": true
  }
}
```

#### Danh Sách Voucher
```
GET /api/vouchers?page=1&limit=20&status=ACTIVE&type=PERCENTAGE
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "pages": 3
  }
}
```

#### Voucher Khả Dụng Cho Người Dùng
```
GET /api/vouchers/me/available
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "vouchers": [...]
  }
}
```

#### Lấy Voucher Theo Code (Public)
```
GET /api/vouchers/code/SAVE20

Response:
{
  "success": true,
  "data": {
    "voucher": {...}
  }
}
```

#### Lấy Voucher Theo ID
```
GET /api/vouchers/:id

Response:
{
  "success": true,
  "data": {
    "voucher": {...}
  }
}
```

#### Cập Nhật Voucher
```
PATCH /api/vouchers/:id
Content-Type: application/json
Authorization: Bearer <token>

{
  "maxUses": 200,
  "status": "INACTIVE",
  "applicableCategories": ["cat-001", "cat-002"]
}
```

#### Deactivate Voucher
```
DELETE /api/vouchers/:id
Authorization: Bearer <token>
```

## Frontend Usage

### VoucherInput Component

```tsx
import { VoucherInput } from '@/features/voucher/components/VoucherInput';

export function CheckoutForm() {
  const [discount, setDiscount] = useState(0);
  const [code, setCode] = useState('');

  return (
    <>
      <VoucherInput
        subtotal={5000}
        onVoucherApplied={(discount, code) => {
          setDiscount(discount);
          setCode(code);
        }}
        onVoucherRemoved={() => {
          setDiscount(0);
          setCode('');
        }}
      />
      <p>Discount: {discount}</p>
    </>
  );
}
```

### voucherApi

```tsx
import { voucherApi } from '@/features/voucher/api/voucherApi';

// Áp dụng voucher
const result = await voucherApi.applyVoucher('SAVE20', 500000);

// Lấy vouchers khả dụng
const vouchers = await voucherApi.getAvailableVouchers();

// Tạo voucher mới (seller/admin)
const newVoucher = await voucherApi.createVoucher({
  code: 'FLASH50',
  type: 'FIXED_AMOUNT',
  value: 50000,
  startsAt: '2026-05-05T00:00:00Z',
  expiresAt: '2026-05-06T23:59:59Z',
});
```

## Flow Áp Dụng Voucher

1. **Người mua** nhập mã voucher trong checkout
2. **Frontend** gọi `POST /vouchers/apply` với subtotal và chi tiết cart
3. **Backend** validate:
   - Mã tồn tại và hoạt động
   - Chưa hết hạn
   - Giá trị đơn ≥ minOrderAmount
   - Người dùng chưa vượt maxUsesPerUser
   - Sản phẩm/danh mục áp dụng
4. **Backend** trả về discount amount
5. **Frontend** cập nhật UI (hiển thị discount, cập nhật total)
6. **Người mua** confirm order với voucherCode
7. **Backend** trong `createOrder`:
   - Tính toán discount
   - Lưu voucherCode và appliedVoucherId vào Order
   - Tạo VoucherUsage record
   - Increment voucher.currentUses

## Loại Voucher

### 1. Fixed Amount (FIXED_AMOUNT)
- Giảm số tiền cố định
- VD: -50.000 VNĐ cho đơn từ 100.000 VNĐ
```json
{
  "code": "SAVE50K",
  "type": "FIXED_AMOUNT",
  "value": 50000,
  "minOrderAmount": 100000
}
```

### 2. Percentage (PERCENTAGE)
- Giảm theo %
- Có maxDiscount để giới hạn
- VD: -20% tối đa 200.000 VNĐ
```json
{
  "code": "SAVE20PCT",
  "type": "PERCENTAGE",
  "value": 20,
  "maxDiscount": 200000,
  "minOrderAmount": 50000
}
```

### 3. Free Shipping (FREE_SHIPPING)
- Miễn phí vận chuyển
```json
{
  "code": "FREESHIP",
  "type": "FREE_SHIPPING",
  "value": 0,
  "minOrderAmount": 200000
}
```

## Validation Rules

- **Code**: Duy nhất, 3-50 ký tự, uppercase
- **Type**: FIXED_AMOUNT | PERCENTAGE | FREE_SHIPPING
- **Value**: > 0, % ≤ 100
- **Dates**: expiresAt > startsAt
- **Limits**: maxUses ≥ 1, maxUsesPerUser ≥ 1
- **Usage**: currentUses ≤ maxUses, userUsage ≤ maxUsesPerUser

## Migration

Chạy migration để tạo tables:

```bash
cd database
npm run migrate
```

Nếu database không kết nối, chạy SQL thủ công từ file migration được tạo.

## Testing

### Tạo test voucher
```typescript
const testVoucher = await voucherApi.createVoucher({
  code: 'TEST' + Date.now(),
  type: 'FIXED_AMOUNT',
  value: 50000,
  minOrderAmount: 100000,
  maxUses: 10,
  maxUsesPerUser: 1,
  startsAt: new Date().toISOString(),
  expiresAt: new Date(Date.now() + 7*24*60*60*1000).toISOString(), // 7 ngày
});
```

### Áp dụng test
```typescript
const applied = await voucherApi.applyVoucher(testVoucher.code, 150000);
console.log(applied); // {discount: 50000, isValid: true, ...}
```

## Production Checklist

- [ ] Database migration chạy thành công
- [ ] Kiểm tra indexes trên `vouchers.code` và `vouchers.status`
- [ ] Kiểm tra FK constraints
- [ ] Setup seller permissions để tạo voucher
- [ ] Cấu hình rate limiting cho endpoints
- [ ] Cấu hình email notification cho voucher hết hạn
- [ ] Cấu hình monitoring cho voucher usage
- [ ] Backup strategy cho voucher data

## Future Enhancements

1. **Redis Caching**: Cache vouchers nóng để tăng tốc độ lookup
2. **Email Notifications**: Gửi email khi voucher khả dụng
3. **Affiliate Vouchers**: Tự động tạo voucher cho affiliate links
4. **A/B Testing**: Theo dõi effectiveness của từng voucher
5. **Tiered Discounts**: Nhiều mức giảm tùy theo subtotal
6. **Stackable Vouchers**: Áp dụng nhiều voucher cùng lúc
7. **QR Code Vouchers**: Voucher dạng QR code offline
8. **Automatic Generation**: Tạo voucher tự động theo rules
