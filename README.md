# 🛒 E-Commerce with Stripe Checkout

Dự án demo E-Commerce tích hợp **Stripe Checkout** để thanh toán online.

## 🚀 Cách chạy project

### 1. Clone repository
```
git clone <your-repo-url>
cd <your-repo-folder>
```

2. Cài đặt dependencies
bash
Sao chép
Chỉnh sửa
npm install
3. Cấu hình biến môi trường
Tạo file .env.local và thêm Stripe Secret Key:

env
Sao chép
Chỉnh sửa
STRIPE_SECRET_KEY=sk_test_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
4. Chạy development server
bash
Sao chép
Chỉnh sửa
npm run dev
Mở http://localhost:3000 để xem kết quả.

💳 Thanh toán thử với Stripe
Stripe cung cấp thẻ test để kiểm thử hệ thống, KHÔNG trừ tiền thật.

Khi đến bước thanh toán, bạn nhập thông tin sau:

Số thẻ (Card Number): 4242 4242 4242 4242

Ngày hết hạn (MM/YY): 03/29

CVC: 999

ZIP Code: 70000

👉 Sau khi bấm thanh toán, bạn sẽ được redirect về trang Success nếu giao dịch thành công.

📦 Tính năng
Xem danh sách sản phẩm

Thêm sản phẩm vào giỏ hàng

Checkout với Stripe

Xem trạng thái đơn hàng (Shipping, Success)
