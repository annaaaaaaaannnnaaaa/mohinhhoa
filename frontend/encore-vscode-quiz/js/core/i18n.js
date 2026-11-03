const T = {
  "en": {
    "login": "Log in",
    "lsub": "Log in to discover your next live experience!",
    "cus": "Customer",
    "adm": "Administrator/ Ticket Checker",
    "em": "Email / User name",
    "pw": "Password",
    "rem": "Remember me?",
    "fg": "Forgot password?",
    "or": "Or log in with",
    "no": "Don't have an account?",
    "su": "Sign up now",
    "bad": "Invalid username or password",
    "perm": "Your account does not have permission to access the admin dashboard",
    "reg": "Sign up",
    "rsub": "Create an account for a seamless ticket-buying experience.",
    "fn": "Full name",
    "ph": "Phone number",
    "cp": "Confirm password",
    "ca": "Create Account",
    "has": "Already have an account?",
    "li": "Log in",
    "dup": "This email is already registered",
    "mis": "Passwords do not match",
    "inv": "Please fill in all fields with a valid email and phone number"
  },
  "vi": {
    "login": "Đăng nhập",
    "lsub": "Chào mừng trở lại hệ thống bán vé concert",
    "cus": "Khách hàng",
    "adm": "Quản trị viên / Soát vé",
    "em": "Email / Tên đăng nhập",
    "pw": "Mật khẩu",
    "rem": "Ghi nhớ đăng nhập",
    "fg": "Quên mật khẩu?",
    "or": "Hoặc đăng nhập bằng",
    "no": "Chưa có tài khoản?",
    "su": "Đăng ký ngay",
    "bad": "Sai tài khoản hoặc mật khẩu",
    "perm": "Tài khoản khách hàng không có quyền truy cập trang Admin",
    "reg": "Đăng ký",
    "rsub": "Tạo tài khoản để trải nghiệm mua vé nhanh chóng",
    "fn": "Họ và tên",
    "ph": "Số điện thoại",
    "cp": "Xác nhận mật khẩu",
    "ca": "Đăng ký tài khoản",
    "has": "Đã có tài khoản?",
    "li": "Đăng nhập ngay",
    "dup": "Email đã được đăng ký",
    "mis": "Mật khẩu xác nhận không khớp",
    "inv": "Vui lòng nhập đủ thông tin hợp lệ"
  }
};

const LANG = () => localStorage.getItem('enc_lang') || 'en';

const t = key => T[LANG()][key];
