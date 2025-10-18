import { useEffect, useState } from "react";

/** ONLY keep this subtle card background (faint floral/wave pattern) */
const BG_CARD = "/src/assets/auth/BackgroundStyle.svg";

/** Brand color */
const RED = "#DB0000";

type Step =
  | "newAccount"
  | "createPassword"
  | "background"
  | "trackedHours"
  | "startingLevel"
  | "beg0";

export interface SignUpWizardProps {
  open: boolean;
  onClose: () => void;
  onCreateAccount?: (data: {
    name: string;
    email: string;
    password: string;
    nativeLanguage?: string;
    otherLanguages?: { lang: string; level: string }[];
    trackedHours?: number;
    startingLevel?: "Beg0" | "Beg1" | "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
  }) => Promise<void> | void;
}

export default function SignUpWizard({
  open,
  onClose,
  onCreateAccount,
}: SignUpWizardProps) {
  const [step, setStep] = useState<Step>("newAccount");

  // form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);

  const [nativeLang, setNativeLang] = useState("");
  const [otherLangs, setOtherLangs] = useState<
    { lang: string; level: string }[]
  >([{ lang: "", level: "A2" }]);

  const [hours, setHours] = useState<number | "">("");
  const [startingLevel, setStartingLevel] = useState<
    "Beg0" | "Beg1" | "A1" | "A2" | "B1" | "B2" | "C1" | "C2" | ""
  >("");

  // reset on close
  useEffect(() => {
    if (!open) {
      setStep("newAccount");
      setName("");
      setEmail("");
      setPassword("");
      setShowPw(false);
      setNativeLang("");
      setOtherLangs([{ lang: "", level: "A2" }]);
      setHours("");
      setStartingLevel("");
    }
  }, [open]);

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) onClose();
    };
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [open, onClose]);

  if (!open) return null;

  // ---- nav helpers ----
  const goNext = () => {
    setStep((s) => {
      switch (s) {
        case "newAccount":
          return "createPassword";
        case "createPassword":
          return "background";
        case "background":
          return "trackedHours";
        case "trackedHours":
          return "startingLevel";
        case "startingLevel":
          return "beg0";
        case "beg0":
          return "beg0";
      }
    });
  };

  const goPrev = () => {
    setStep((s) => {
      switch (s) {
        case "createPassword":
          return "newAccount";
        case "background":
          return "createPassword";
        case "trackedHours":
          return "background";
        case "startingLevel":
          return "trackedHours";
        case "beg0":
          return "startingLevel";
        case "newAccount":
          return "newAccount";
      }
    });
  };

  const submitAll = async () => {
    if (onCreateAccount) {
      await onCreateAccount({
        name,
        email,
        password,
        nativeLanguage: nativeLang || undefined,
        otherLanguages: otherLangs.filter((l) => l.lang.trim()),
        trackedHours: hours === "" ? undefined : Number(hours),
        startingLevel: startingLevel || undefined,
      });
    }
    onClose();
  };

  // ---- shared view bits ----
  const Title = () => {
    const t =
      step === "newAccount"
        ? "New account"
        : step === "createPassword"
        ? "Create password"
        : step === "background"
        ? "Background"
        : step === "trackedHours"
        ? "Tracked hours"
        : step === "startingLevel"
        ? "Choose your starting level"
        : "Welcome!";
    return (
      <h2 className="text-center text-[22px] font-semibold text-black">
        {t}
      </h2>
    );
  };

  // decorative chip like your mock
  const HeaderChip = () => (
    <div className="inline-flex items-center rounded-full bg-white px-3 py-1 text-[13px] font-semibold text-[#DB0000] ring-1 ring-[#F2D6D6]">
      Create account <span className="ml-1">✎</span>
    </div>
  );

  // button components in brand style
  const BtnGhost = (props: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button
      {...props}
      className={
        "inline-flex h-10 items-center gap-2 rounded-full border border-neutral-300 bg-white px-4 text-[14px] font-medium text-black hover:bg-neutral-50 " +
        (props.className ?? "")
      }
    />
  );

  const BtnPrimary = (props: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button
      {...props}
      className={
        "inline-flex h-10 items-center gap-2 rounded-full bg-[#DB0000] px-5 text-[14px] font-semibold text-white hover:brightness-95 " +
        (props.className ?? "")
      }
    />
  );

  // ---- views per step (no art images, only form UI) ----
  const StepView = () => {
    switch (step) {
      case "newAccount":
        return (
          <>
            <div className="grid gap-2">
              <label className="text-[12px] font-medium text-black">
                Name<span className="text-[#DB0000]">*</span>
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="h-11 rounded-xl border border-[#E7E7E7] bg-white px-4 text-sm text-black caret-black outline-none placeholder:text-[#9C9C9C] focus:border-[#DB0000]"
              />
            </div>

            <div className="grid gap-2">
              <label className="text-[12px] font-medium text-black">
                Email<span className="text-[#DB0000]">*</span>
              </label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="iloveRussian@example.com"
                className="h-11 rounded-xl border border-[#E7E7E7] bg-white px-4 text-sm text-black caret-black outline-none placeholder:text-[#9C9C9C] focus:border-[#DB0000]"
                type="email"
              />
            </div>

            <div className="pt-1 text-[12px] text-[#666]">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => alert("TODO: open login flow")}
                className="font-semibold text-[#DB0000] underline-offset-2 hover:underline"
              >
                Log in
              </button>
            </div>
          </>
        );

      case "createPassword":
        return (
          <>
            <div className="grid gap-2">
              <label className="text-[12px] font-medium text-black">
                Your password
              </label>
              <div className="relative">
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type={showPw ? "text" : "password"}
                  className="h-11 w-full rounded-xl border border-[#E7E7E7] bg-white px-4 pr-12 text-sm text-black caret-black outline-none placeholder:text-[#9C9C9C] focus:border-[#DB0000]"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-[12px] text-[#DB0000] hover:bg-black/5"
                >
                  {showPw ? "Hide" : "Show"}
                </button>
              </div>
              <p className="text-[12px] text-[#666]">
                Use at least 6 characters.
              </p>
            </div>
          </>
        );

      case "background":
        return (
          <>
            <p className="text-[12px] text-[#666]">
              Add languages you speak. Roadmap milestones and daily goal can
              adjust automatically.
            </p>

            <div className="grid gap-2">
              <label className="text-[12px] font-medium text-black">
                Native language<span className="text-[#DB0000]">*</span>
              </label>
              <input
                value={nativeLang}
                onChange={(e) => setNativeLang(e.target.value)}
                placeholder="Choose native language"
                className="h-11 rounded-xl border border-[#E7E7E7] bg-white px-4 text-sm text-black caret-black outline-none placeholder:text-[#9C9C9C] focus:border-[#DB0000]"
              />
            </div>

            <div className="mt-2 space-y-2">
              <div className="text-[12px] font-medium text-black">
                Other languages
              </div>
              {otherLangs.map((row, i) => (
                <div
                  key={i}
                  className="grid grid-cols-[1fr,110px,36px] items-center gap-2"
                >
                  <input
                    value={row.lang}
                    onChange={(e) => {
                      const v = [...otherLangs];
                      v[i].lang = e.target.value;
                      setOtherLangs(v);
                    }}
                    placeholder="English"
                    className="h-11 rounded-xl border border-[#E7E7E7] bg-white px-4 text-sm text-black caret-black outline-none placeholder:text-[#9C9C9C] focus:border-[#DB0000]"
                  />
                  <select
                    value={row.level}
                    onChange={(e) => {
                      const v = [...otherLangs];
                      v[i].level = e.target.value;
                      setOtherLangs(v);
                    }}
                    className="h-11 rounded-xl border border-[#E7E7E7] bg-white px-3 text-sm text-black caret-black outline-none focus:border-[#DB0000]"
                  >
                    {["A1", "A2", "B1", "B2", "C1", "C2"].map((lv) => (
                      <option key={lv}>{lv}</option>
                    ))}
                  </select>
                  <button
                    onClick={() =>
                      setOtherLangs((arr) =>
                        arr.length > 1 ? arr.filter((_, idx) => idx !== i) : arr
                      )
                    }
                    className="rounded-lg p-2 text-[#DB0000] hover:bg-black/5"
                    aria-label="Remove language"
                  >
                    −
                  </button>
                </div>
              ))}
              <button
                onClick={() =>
                  setOtherLangs((arr) => [...arr, { lang: "", level: "A2" }])
                }
                className="mt-1 text-left text-[13px] font-medium  text-[#DB0000] hover:underline"
              >
                + Add a language
              </button>
            </div>
          </>
        );

      case "trackedHours":
        return (
          <>
            <div className="grid gap-2">
              <label className="text-[12px] font-medium text-black">
                Have you tracked your hours?
              </label>
              <input
                value={hours}
                onChange={(e) =>
                  setHours(
                    e.target.value === ""
                      ? ""
                      : Math.max(0, Number(e.target.value)) || 0
                  )
                }
                type="number"
                min={0}
                placeholder="0"
                className="h-11 rounded-xl border border-[#E7E7E7] bg-white px-4 text-sm text-black caret-black outline-none placeholder:text-[#9C9C9C] focus:border-[#DB0000]"
              />
              <div className="text-[12px] text-[#666]">
                Enter the approximate total hours you’ve already spent learning
                Russian.
              </div>
            </div>
          </>
        );

      case "startingLevel":
        return (
          <>
            <div className="grid grid-cols-2 gap-2 text-black caret-black">
              {(["Beg0", "Beg1", "A1", "A2", "B1", "B2", "C1", "C2"] as const).map(
                (lv) => (
                  <button
                    key={lv}
                    onClick={() => setStartingLevel(lv)}
                    className={`h-10 rounded-xl border text-sm ${
                      startingLevel === lv
                        ? "border-[#DB0000] bg-[#DB0000]/10 text-[#DB0000]"
                        : "border-[#E7E7E7] hover:border-[#DB0000]/50"
                    }`}
                  >
                    {lv}
                  </button>
                )
              )}
            </div>
            <div className="text-[12px] text-[#666]">
              You can change it later in your profile.
            </div>
          </>
        );

      case "beg0":
        return (
          <div className="space-y-3">
            <div className="text-[14px]">
              You’re set! Click **Start learning** to enter the app.
            </div>
            <BtnPrimary onClick={submitAll}>Start learning</BtnPrimary>
          </div>
        );
    }
  };

  const canNext =
    (step === "newAccount" && !!name.trim() && !!email.trim()) ||
    (step === "createPassword" && password.length >= 6) ||
    step === "background" ||
    step === "trackedHours" ||
    step === "startingLevel";

  return (
    <div className="fixed inset-0 z-[1000]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="absolute inset-0 flex items-center justify-center p-3 sm:p-6">
        <div className="relative w-full max-w-[900px] overflow-hidden rounded-2xl bg-white shadow-2xl">
          {/* faint decorative background */}
          <img
            src={BG_CARD}
            alt=""
            className="pointer-events-none absolute inset-0 h-full w-full select-none object-cover opacity-100"
          />

          {/* content */}
          <div className="relative z-10 p-6 sm:p-8">
            {/* header: chip + title */}
            <div className="mb-4 flex w-full items-center justify-between">
              <HeaderChip />
              <button
                onClick={onClose}
                className="rounded-lg p-2 text-neutral-500 hover:bg-black/5"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <Title />

            <div className="mt-6 grid gap-5">
              <StepView />
            </div>

            {/* footer: prev/cancel + next */}
            <div className="mt-8 flex items-center justify-between">
              {step === "newAccount" ? (
                <BtnGhost onClick={onClose}>← Cancel</BtnGhost>
              ) : (
                <BtnGhost onClick={goPrev}>← Previous</BtnGhost>
              )}

              {step !== "beg0" && (
                <BtnPrimary onClick={goNext} disabled={!canNext}>
                  Next →
                </BtnPrimary>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
