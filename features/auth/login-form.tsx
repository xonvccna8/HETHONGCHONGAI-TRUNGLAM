"use client";

import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
  type User,
} from "@firebase/auth";
import { AlertCircle, ArrowRight, Check, Eye, EyeOff, LoaderCircle, LockKeyhole, Mail, ShieldCheck, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { ensureFirebasePersistence, firebaseAuth, firebaseAuthConfigured } from "@/src/auth/firebase-client";

type Mode = "login" | "register";

const firebaseErrors: Record<string, string> = {
  "auth/email-already-in-use": "Email này đã được đăng ký.",
  "auth/invalid-credential": "Email hoặc mật khẩu chưa chính xác.",
  "auth/invalid-email": "Địa chỉ email chưa hợp lệ.",
  "auth/weak-password": "Mật khẩu chưa đủ mạnh.",
  "auth/popup-closed-by-user": "Cửa sổ Google đã được đóng trước khi hoàn tất.",
  "auth/popup-blocked": "Trình duyệt đang chặn cửa sổ đăng nhập Google.",
  "auth/unauthorized-domain": "Tên miền này chưa được cho phép trong Firebase Authentication.",
  "auth/operation-not-allowed": "Phương thức đăng nhập này chưa được bật trong Firebase.",
  "auth/too-many-requests": "Có quá nhiều lần thử. Vui lòng đợi một lúc rồi thử lại.",
};

function readableError(error: unknown) {
  const code = typeof error === "object" && error && "code" in error ? String((error as { code?: string }).code) : "";
  return firebaseErrors[code] ?? "Không thể xác thực lúc này. Vui lòng thử lại.";
}

function passwordStrength(value: string) {
  return [value.length >= 8, /[A-ZÀ-Ỹ]/u.test(value), /[a-zà-ỹ]/u.test(value), /\d/u.test(value), /[^\p{L}\p{N}]/u.test(value)].filter(Boolean).length;
}

export function LoginForm({ startWithSample = false }: { startWithSample?: boolean }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState<"email" | "google" | "reset" | "">("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const strength = useMemo(() => passwordStrength(password), [password]);

  async function establishSession(user: User, preferredName?: string) {
    const idToken = await user.getIdToken(true);
    const response = await fetch("/api/auth/firebase-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken, name: preferredName || user.displayName || undefined }),
    });
    const body = await response.json();
    if (!response.ok) throw new Error(body.error ?? "Không thể tạo phiên đăng nhập.");
    router.push(startWithSample ? "/workspace?sample=1" : "/workspace");
    router.refresh();
  }

  function switchMode(next: Mode) {
    setMode(next); setError(""); setNotice(""); setPassword(""); setConfirmPassword("");
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setNotice("");
    if (!firebaseAuthConfigured()) { setError("Firebase chưa được cấu hình đầy đủ."); return; }
    if (mode === "register") {
      if (name.trim().length < 2) { setError("Vui lòng nhập họ và tên."); return; }
      if (password.length < 8 || strength < 3) { setError("Mật khẩu cần ít nhất 8 ký tự, gồm chữ và số."); return; }
      if (password !== confirmPassword) { setError("Hai mật khẩu chưa trùng khớp."); return; }
      if (!acceptedTerms) { setError("Vui lòng đồng ý với điều khoản và chính sách bảo mật."); return; }
    }
    setLoading("email");
    try {
      await ensureFirebasePersistence();
      if (mode === "register") {
        const credential = await createUserWithEmailAndPassword(firebaseAuth, email.trim(), password);
        await updateProfile(credential.user, { displayName: name.trim() });
        await sendEmailVerification(credential.user).catch(() => undefined);
        await establishSession(credential.user, name.trim());
      } else {
        const credential = await signInWithEmailAndPassword(firebaseAuth, email.trim(), password);
        await establishSession(credential.user);
      }
    } catch (authError) {
      setError(authError instanceof Error && !String((authError as { code?: string }).code ?? "").startsWith("auth/") ? authError.message : readableError(authError));
    } finally { setLoading(""); }
  }

  async function signInGoogle() {
    setLoading("google"); setError(""); setNotice("");
    try {
      await ensureFirebasePersistence();
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      const credential = await signInWithPopup(firebaseAuth, provider);
      await establishSession(credential.user);
    } catch (authError) { setError(readableError(authError)); }
    finally { setLoading(""); }
  }

  async function resetPassword() {
    if (!email.trim()) { setError("Nhập email trước khi yêu cầu đặt lại mật khẩu."); return; }
    setLoading("reset"); setError(""); setNotice("");
    try {
      await sendPasswordResetEmail(firebaseAuth, email.trim());
      setNotice("Đã gửi hướng dẫn đặt lại mật khẩu tới email của bạn.");
    } catch (authError) { setError(readableError(authError)); }
    finally { setLoading(""); }
  }

  const busy = Boolean(loading);
  return (
    <div>
      <div className="grid grid-cols-2 rounded-2xl bg-[var(--surface-2)] p-1.5" role="tablist" aria-label="Chọn hình thức xác thực">
        {(["login", "register"] as const).map((item) => <button key={item} type="button" role="tab" aria-selected={mode === item} onClick={() => switchMode(item)} className={`rounded-xl px-4 py-2.5 text-sm font-black transition ${mode === item ? "bg-[var(--surface)] text-[var(--ink)] shadow-sm" : "text-[var(--muted)] hover:text-[var(--ink)]"}`}>{item === "login" ? "Đăng nhập" : "Đăng ký"}</button>)}
      </div>

      <button type="button" onClick={signInGoogle} disabled={busy} className="focus-ring mt-5 flex w-full items-center justify-center gap-3 rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-5 py-3.5 text-sm font-black transition hover:-translate-y-0.5 hover:border-[var(--brand)] disabled:opacity-55">
        {loading === "google" ? <LoaderCircle size={18} className="animate-spin" /> : <GoogleMark />} Tiếp tục với Google
      </button>
      <div className="my-5 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[.16em] text-[var(--muted)]"><i className="h-px flex-1 bg-[var(--line)]" /> hoặc dùng email <i className="h-px flex-1 bg-[var(--line)]" /></div>

      <form onSubmit={submit} className="space-y-3">
        {mode === "register" && <Field icon={UserRound}><span className="sr-only">Họ và tên</span><input required value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" placeholder="Họ và tên" className="h-14 min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none placeholder:font-medium placeholder:text-[var(--muted)]" /></Field>}
        <Field icon={Mail}><span className="sr-only">Email</span><input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" placeholder="Email công việc" className="h-14 min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none placeholder:font-medium placeholder:text-[var(--muted)]" /></Field>
        <Field icon={LockKeyhole}><span className="sr-only">Mật khẩu</span><input required minLength={mode === "register" ? 8 : 6} type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} autoComplete={mode === "register" ? "new-password" : "current-password"} placeholder="Mật khẩu" className="h-14 min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none placeholder:font-medium placeholder:text-[var(--muted)]" /><button type="button" onClick={() => setShowPassword((value) => !value)} className="rounded-lg p-2 text-[var(--muted)] hover:text-[var(--ink)]" aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></Field>
        {mode === "register" && <><div className="grid grid-cols-5 gap-1 px-1">{Array.from({ length: 5 }, (_, index) => <i key={index} className={`h-1 rounded-full transition ${index < strength ? strength >= 4 ? "bg-[var(--brand)]" : "bg-[var(--amber)]" : "bg-[var(--line)]"}`} />)}</div><Field icon={ShieldCheck}><span className="sr-only">Nhập lại mật khẩu</span><input required minLength={8} type={showPassword ? "text" : "password"} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} autoComplete="new-password" placeholder="Nhập lại mật khẩu" className="h-14 min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none placeholder:font-medium placeholder:text-[var(--muted)]" /></Field></>}

        {mode === "login" ? <div className="flex justify-end"><button type="button" onClick={resetPassword} disabled={busy} className="text-[12px] font-bold text-[var(--brand)] hover:underline">{loading === "reset" ? "Đang gửi…" : "Quên mật khẩu?"}</button></div> : <label className="flex cursor-pointer items-start gap-2.5 px-1 text-[11px] leading-5 text-[var(--muted)]"><input type="checkbox" checked={acceptedTerms} onChange={(event) => setAcceptedTerms(event.target.checked)} className="mt-1 accent-[var(--brand)]" /><span>Tôi đồng ý với điều khoản sử dụng và chính sách bảo mật của ORIGIN AI.</span></label>}

        {error && <p role="alert" className="flex items-start gap-2 rounded-xl bg-[var(--coral-soft)] px-4 py-3 text-sm leading-5 text-[var(--coral)]"><AlertCircle size={17} className="mt-0.5 shrink-0" />{error}</p>}
        {notice && <p role="status" className="flex items-start gap-2 rounded-xl bg-[var(--brand-soft)] px-4 py-3 text-sm leading-5 text-[var(--brand)]"><Check size={17} className="mt-0.5 shrink-0" />{notice}</p>}
        <button disabled={busy} className="focus-ring flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-500 px-5 py-4 text-sm font-black text-white shadow-[0_16px_36px_rgba(99,91,255,.28)] transition hover:-translate-y-0.5 disabled:opacity-60">{loading === "email" ? <LoaderCircle className="animate-spin" size={18} /> : <>{mode === "login" ? "Vào workspace" : "Tạo tài khoản"} <ArrowRight size={18} /></>}</button>
      </form>
    </div>
  );
}

function Field({ icon: Icon, children }: { icon: typeof Mail; children: React.ReactNode }) {
  return <label className="group flex items-center gap-3 rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-4 transition focus-within:border-[var(--brand)] focus-within:shadow-[0_0_0_4px_var(--brand-soft)]"><Icon size={18} className="shrink-0 text-[var(--muted)] group-focus-within:text-[var(--brand)]" />{children}</label>;
}

function GoogleMark() {
  return <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.4-.18-2.07H12v3.91h5.38a4.6 4.6 0 0 1-2 3.02v2.54h3.24c1.9-1.75 2.98-4.32 2.98-7.4Z"/><path fill="#34A853" d="M12 22c2.7 0 4.97-.9 6.62-2.42l-3.24-2.53c-.9.6-2.05.96-3.38.96-2.61 0-4.82-1.76-5.61-4.13H3.04v2.61A10 10 0 0 0 12 22Z"/><path fill="#FBBC05" d="M6.39 13.88A6 6 0 0 1 6.08 12c0-.65.11-1.28.31-1.88V7.51H3.04A10 10 0 0 0 2 12c0 1.61.38 3.14 1.04 4.49l3.35-2.61Z"/><path fill="#EA4335" d="M12 5.99c1.47 0 2.79.5 3.83 1.5L18.7 4.6A9.62 9.62 0 0 0 12 2a10 10 0 0 0-8.96 5.51l3.35 2.61C7.18 7.75 9.39 5.99 12 5.99Z"/></svg>;
}
