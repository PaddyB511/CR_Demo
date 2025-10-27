import { useEffect, useState } from "react";

// ✅ Import SVGs as URLs so Vite rewrites paths for dev & build
import profileIconUrl from "@/assets/ProfileIcon.svg?url";
import plusIconUrl from "@/assets/PlusIcon.svg?url";
import addLanguageUrl from "@/assets/AddLanguage.svg?url";

type LanguageRow = { language: string; level: string };

type Props = {
  open: boolean;
  onClose: () => void;
  onGoPremium?: () => void;
  // seed values (optional)
  initialName?: string;
  initialEmail?: string;
  initialBirthday?: string; // "YYYY-MM-DD"
  initialNativeLanguage?: string;
  initialOtherLanguages?: LanguageRow[];
  initialEarForMusic?: boolean | null;
};

export default function AccountSettingsModal({
  open,
  onClose,
  onGoPremium,
  initialName = "",
  initialEmail = "",
  initialBirthday = "",
  initialNativeLanguage = "",
  initialOtherLanguages = [{ language: "English", level: "A2" }],
  initialEarForMusic = null,
}: Props) {
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [birthday, setBirthday] = useState(initialBirthday);
  const [password, setPassword] = useState(""); // masked/demo only
  const [nativeLanguage, setNativeLanguage] = useState(initialNativeLanguage);
  const [otherLanguages, setOtherLanguages] = useState<LanguageRow[]>(
    initialOtherLanguages
  );
  const [earForMusic, setEarForMusic] = useState<boolean | null>(
    initialEarForMusic
  );

  useEffect(() => {
    if (open) {
      // reset from props whenever re-opened
      setName(initialName);
      setEmail(initialEmail);
      setBirthday(initialBirthday);
      setNativeLanguage(initialNativeLanguage);
      setOtherLanguages(initialOtherLanguages);
      setEarForMusic(initialEarForMusic);
      setPassword("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const addLanguage = () =>
    setOtherLanguages((rows) => [...rows, { language: "", level: "A2" }]);

  const removeLanguage = (idx: number) =>
    setOtherLanguages((rows) => rows.filter((_, i) => i !== idx));

  const save = async () => {
    const payload = {
      name,
      email,
      birthday,
      nativeLanguage,
      otherLanguages,
      earForMusic,
    };
    console.log("Saving profile (stub):", payload);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center bg-black/40 p-4">
      <div className="relative w-full max-w-[560px] rounded-[22px] bg-white shadow-xl">
        {/* Header */}
        <div className="rounded-t-[22px] bg-[#FDF0F0] px-5 py-4">
          <div className="flex items-center gap-2">
            <h2 className="text-[18px] font-semibold text-black">
              Account Settings
            </h2>
            <svg className="h-4 w-4 text-[#DB0000]" viewBox="0 0 24 24" fill="none">
              <path d="M5 12h14" stroke="currentColor" strokeWidth="2" />
            </svg>
          </div>
        </div>

        {/* Body */}
        <div className="max-h-[82vh] overflow-y-auto px-5 pb-4 pt-5">
          {/* Top: avatar + subscription */}
          <div className="mb-6 flex items-start gap-4">
            <div className="relative">
              <img
                src={profileIconUrl}            // ✅ use imported URL
                alt="Profile"
                className="h-[92px] w-[92px] rounded-full"
              />
              <button
                className="absolute -right-2 -top-2"
                title="Change photo"
                type="button"
              >
                <img
                  src={plusIconUrl}             // ✅ use imported URL
                  alt="Add"
                  className="h-9 w-9"
                />
              </button>
            </div>

            <div className="flex-1 rounded-[16px] border border-[#F0D0D0] bg-white px-4 py-3">
              <div className="text-[15px] font-semibold text-black">
                Subscription: <span className="font-semibold">Basic</span>
              </div>
              <p className="mt-1 text-[12px] leading-snug text-[#6b7280]">
                Upgrade for premium features: Premium videos, Download audios &amp;
                transcriptions, Playlists, Offline use, Unlimited Time Tracking :)
              </p>
              <button
                onClick={onGoPremium}
                className="mt-2 inline-flex items-center rounded-full border border-[#DB0000] bg-[#FDF0F0] px-3 py-[6px] text-[13px] font-medium text-[#DB0000] hover:bg-[#fde6e6]"
              >
                Go Premium <span className="ml-1">→</span>
              </button>
            </div>
          </div>

          {/* Name */}
          <FormRow label="Name" required>
            <Input
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </FormRow>

          {/* Email */}
          <FormRow label="Email" required>
            <Input
              type="email"
              placeholder="iloveRussian@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </FormRow>

          {/* Birthday */}
          <FormRow label="Birthday">
            <Input
              type="date"
              value={birthday}
              onChange={(e) => setBirthday(e.target.value)}
            />
          </FormRow>

          {/* Password */}
          <div className="my-5 border-t border-[#eee]" />
          <div className="mb-2 text-[13px] font-semibold text-black">Password:</div>
          <Input
            type="password"
            placeholder="••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            className="mt-2 text-left text-[12px] text-[#DB0000] hover:underline"
          >
            I want to change my password
          </button>

          <div className="my-5 border-t border-[#eee]" />

          {/* Languages summary */}
          <p className="mb-3 text-[12px] text-[#6b7280]">
            Add languages you speak and the Roadmap milestones (hours of input per
            level) will adjust automatically for you.
          </p>

          {/* Native language */}
          <FormRow label="Native language" required>
            <select
              className="h-10 w-full rounded-lg border border-[#e5e7eb] bg-white px-3 text-[14px] outline-none"
              value={nativeLanguage}
              onChange={(e) => setNativeLanguage(e.target.value)}
            >
              <option value="">Select…</option>
              <option>English</option>
              <option>Russian</option>
              <option>Spanish</option>
              <option>German</option>
              <option>French</option>
            </select>
          </FormRow>

          {/* Other languages (repeatable rows) */}
          <div className="mt-3 space-y-2">
            {otherLanguages.map((row, idx) => (
              <div key={idx} className="grid grid-cols-2 gap-3">
                <select
                  className="h-10 w-full rounded-lg border border-[#e5e7eb] bg-white px-3 text-[14px] outline-none"
                  value={row.language}
                  onChange={(e) =>
                    setOtherLanguages((rows) =>
                      rows.map((r, i) =>
                        i === idx ? { ...r, language: e.target.value } : r
                      )
                    )
                  }
                >
                  <option value="">Other language…</option>
                  <option>English</option>
                  <option>Russian</option>
                  <option>Spanish</option>
                  <option>German</option>
                  <option>French</option>
                </select>

                <select
                  className="h-10 w-full rounded-lg border border-[#e5e7eb] bg-white px-3 text-[14px] outline-none"
                  value={row.level}
                  onChange={(e) =>
                    setOtherLanguages((rows) =>
                      rows.map((r, i) =>
                        i === idx ? { ...r, level: e.target.value } : r
                      )
                    )
                  }
                >
                  <option>A1</option>
                  <option>A2</option>
                  <option>B1</option>
                  <option>B2</option>
                  <option>C1</option>
                  <option>C2</option>
                </select>

                <div className="col-span-2 -mt-1">
                  <button
                    type="button"
                    onClick={() => removeLanguage(idx)}
                    className="text-[12px] text-[#9C9C9C] hover:underline"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add language button */}
          <button
            onClick={addLanguage}
            type="button"
            className="mt-3 inline-flex items-center"
            title="Add a language"
          >
            <img src={addLanguageUrl} className="h-[33px]" alt="Add a language" />
          </button>

          {/* Ear for music */}
          <div className="my-6">
            <div className="mb-2 text-[13px] font-semibold text-black">
              Do you have ear for music?
            </div>
            <div className="flex items-center gap-6 text-[14px]">
              <label className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  name="ear"
                  checked={earForMusic === true}
                  onChange={() => setEarForMusic(true)}
                />
                <span>Yes</span>
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  name="ear"
                  checked={earForMusic === false}
                  onChange={() => setEarForMusic(false)}
                />
                <span>No</span>
              </label>
            </div>
          </div>

          {/* Footer buttons */}
          <div className="mt-6 flex items-center justify-between">
            <button
              onClick={onClose}
              className="rounded-full bg-[#F6F6F6] px-4 py-2 text-[14px]"
            >
              ← Skip
            </button>
            <button
              onClick={save}
              className="inline-flex items-center rounded-full bg-[#DB0000] px-4 py-2 text-[14px] font-semibold text-white hover:brightness-110"
            >
              Save changes <span className="ml-1">→</span>
            </button>
          </div>
        </div>

        {/* Close (X) */}
        <button
          onClick={onClose}
          className="absolute right-3 top-3 rounded-full p-1 text-[#9C9C9C] hover:bg-[#f3f4f6]"
          aria-label="Close"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

/* ---------------- small form helpers ---------------- */

function FormRow({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-4">
      <div className="mb-1 text-[13px] font-semibold text-black">
        {label} {required && <span className="text-[#DB0000]">*</span>}
      </div>
      {children}
    </div>
  );
}

function Input(
  props: React.InputHTMLAttributes<HTMLInputElement> & { className?: string }
) {
  return (
    <input
      {...props}
      className={
        "h-10 w-full rounded-lg border border-[#e5e7eb] bg-white px-3 text-[14px] text-black outline-none " +
        (props.className ?? "")
      }
    />
  );
}
