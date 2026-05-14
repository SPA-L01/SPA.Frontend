# Auth Module — Frontend Design (Expo React Native)

## Overview

Auth module FE kết nối với SPA Backend, quản lý session bằng AsyncStorage và expose trạng thái đăng nhập toàn cục qua React Context.

---

## File Structure

```
services/
├── api.ts              # Axios instance + request/response interceptors
└── auth.service.ts     # login, register, logout, token management

context/
└── AuthContext.tsx     # React Context + Provider + useAuth hook

app/
├── _layout.tsx         # Wrap với AuthProvider, auto-redirect
└── (auth)/
    ├── _layout.tsx     # Auth stack navigator
    ├── login.tsx       # Login screen (kết nối API thật)
    └── register.tsx    # Register screen (mới)
```

---

## Auth Flow

```
App start:
  AuthProvider.useEffect → authService.isLoggedIn()
  → token có  → redirect (tabs)
  → token không có → redirect (auth)/login

Login:
  login.tsx → useAuth().login({ email, password })
  → authService.login() → POST /api/v1/auth/login
  → lưu accessToken, refreshToken, userId vào AsyncStorage
  → AuthContext.isLoggedIn = true → redirect (tabs)

Register:
  register.tsx → useAuth().register(dto)
  → authService.register() → POST /api/v1/auth/register
  → Alert thành công → navigate về login

Logout:
  useAuth().logout()
  → POST /api/v1/auth/logout (với access token)
  → xoá tokens khỏi AsyncStorage
  → AuthContext.isLoggedIn = false → redirect (auth)/login

Auto refresh (transparent):
  api.ts response interceptor
  → nhận 401 → lấy refreshToken từ AsyncStorage
  → POST /api/v1/auth/refresh → cập nhật tokens
  → retry request gốc tự động
```

---

## Token Storage (AsyncStorage Keys)

| Key | Nội dung |
|-----|----------|
| `spa_access_token` | JWT access token (30 phút) |
| `spa_refresh_token` | JWT refresh token (7 ngày) |
| `spa_user_id` | UUID của user |

---

## Components

### `useAuth()` hook
```ts
const { isLoggedIn, loading, userId, login, logout, register } = useAuth();
```

### `authService`
```ts
authService.login(dto)          // POST /auth/login + save tokens
authService.register(dto)       // POST /auth/register
authService.logout()            // POST /auth/logout + clear tokens
authService.refreshToken()      // POST /auth/refresh + update tokens
authService.getAccessToken()    // đọc từ AsyncStorage
authService.isLoggedIn()        // true nếu có access token
```

---

## Error Handling

- Lỗi validation (400): hiển thị message từ server trong UI
- Lỗi credentials (401): hiển thị "Invalid credentials"
- Lỗi network: hiển thị generic error message
