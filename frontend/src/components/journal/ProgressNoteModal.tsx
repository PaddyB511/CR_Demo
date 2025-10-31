import { ChangeEvent, useEffect, useState, type CSSProperties } from "react";
import type { JournalActivity } from "../../api/journal";

import pencilIcon from "../../assets/journal/Pencil.svg?url";
import listeningWatchingIcon from "../../assets/journal/listening-watching.svg?url";

const activityOptions: Array<{
  value: JournalActivity;
  label: string;
  icon?: string;
}> = [{ value: "listening_watching", label: "Listening/Watching", icon: listeningWatchingIcon }];

const attentionRateOptions = [
  { value: "active_80_100", label: "Active 80-100%" },
  { value: "passive_20_80", label: "Passive 20-80%" },
  { value: "background_0_20", label: "Background 0-20%" },
];

const realityRateOptions = [
  { value: "real_life", label: "100% Real life communication" },
  { value: "online_chat", label: "0% Online video chat" },
  { value: "videos_movies", label: "70% Videos, movies" },
  { value: "podcasts", label: "30% Podcasts" },
];

type RangeType = "day" | "period";

export interface ProgressNoteFormData {
  rangeType: RangeType;
  date: string;
  startDate: string;
  endDate: string;
  activity: JournalActivity;
  hours: number;
  minutes: number;
  attentionRate: string;
  inputComprehensibility: number;
  realityRates: string[];
  comment: string;
}

const defaultForm: ProgressNoteFormData = {
  rangeType: "day",
  date: "",
  startDate: "",
  endDate: "",
  activity: "listening_watching",
  hours: 1,
  minutes: 0,
  attentionRate: attentionRateOptions[0].value,
  inputComprehensibility: 70,
  realityRates: [realityRateOptions[2].value],
  comment: "",
};

interface ProgressNoteModalProps {
  open: boolean;
  onClose: () => void;
  onSave?: (data: ProgressNoteFormData) => void;
}

const chipBaseClasses =
  "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1";

const dateInputClasses =
  "w-[126px] h-9 appearance-none rounded-xl border border-transparent bg-[#F6F6F6] px-3 text-sm font-inter text-[#9C9C9C] focus:border-[#DB0000] focus:bg-white focus:text-[#2B1A1A] focus:outline-none focus:ring-2 focus:ring-[#FAD4D4]";

const dateInputStyle: CSSProperties = {
  fontFamily: "'Inter', sans-serif",
  color: "#9C9C9C",
};

const durationInputClasses =
  "mt-1 w-[60px] border-none bg-transparent text-[15px] font-semibold text-black focus:outline-none";

export function ProgressNoteModal({ open, onClose, onSave }: ProgressNoteModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [formData, setFormData] = useState<ProgressNoteFormData>(defaultForm);

  useEffect(() => {
    if (open) {
      setStep(1);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) {
      setFormData(defaultForm);
    }
  }, [open]);

  const handleRangeTypeChange = (rangeType: RangeType) => {
    setFormData((prev) => ({
      ...prev,
      rangeType,
    }));
  };

  const handleDateChange = (field: "date" | "startDate" | "endDate") =>
    (event: ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    };

  const handleNumberChange = (field: "hours" | "minutes") =>
    (event: ChangeEvent<HTMLInputElement>) => {
      const value = Number(event.target.value);
      if (Number.isNaN(value)) return;
      setFormData((prev) => ({
        ...prev,
        [field]: field === "minutes" ? Math.max(0, Math.min(59, value)) : Math.max(0, value),
      }));
    };

  const toggleRealityRate = (value: string) => {
    setFormData((prev) => {
      const alreadySelected = prev.realityRates.includes(value);
      return {
        ...prev,
        realityRates: alreadySelected
          ? prev.realityRates.filter((item) => item !== value)
          : [...prev.realityRates, value],
      };
    });
  };

  const handleSave = () => {
    onSave?.(formData);
    onClose();
  };

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div
        className="relative z-10 flex w-full max-w-[440px] flex-col overflow-hidden rounded-[28px] bg-white text-[#2B1A1A] shadow-2xl font-inter max-h-[90vh]"
        role="dialog"
        aria-modal="true"
      >
        <div className="relative flex items-center justify-center rounded-t-[28px] bg-[#FFF8CC] px-6 py-4">
          <div className="flex items-center gap-2 text-[#FFB200]">
            <span className="text-xs font-semibold uppercase tracking-[0.08em]">Progress note</span>
            <img src={pencilIcon} alt="" className="h-6 w-6" />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-[#8F2F2F] transition hover:bg-[#FFE7E7]"
            aria-label="Close progress note"
          >
            <span className="text-lg">×</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-6 pt-5">
          <div className="mb-5 text-sm font-semibold text-[#FFB200]">
            {step === 1 ? "Step 1/2. Activity" : "Step 2/2. Reflection"}
          </div>
          {step === 1 ? (
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex gap-2">
                  {([
                    { value: "day" as RangeType, label: "for a day" },
                    { value: "period" as RangeType, label: "for the period" },
                  ]).map((option) => {
                    const isActive = formData.rangeType === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleRangeTypeChange(option.value)}
                        className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#FFDEDE] focus:ring-offset-1 ${
                          isActive ? "bg-[#FFDEDE] text-[#8F2F2F]" : "bg-transparent text-[#8F2F2F]/70"
                        }`}
                      >
                        <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: isActive ? "#DB0000" : "#FFD6D6" }} />
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                {formData.rangeType === "day" ? (
                  <input
                    type="date"
                    value={formData.date}
                    onChange={handleDateChange("date")}
                    className={dateInputClasses}
                    style={dateInputStyle}
                  />
                ) : (
                  <div className="flex flex-wrap gap-3">
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={handleDateChange("startDate")}
                      className={dateInputClasses}
                      style={dateInputStyle}
                    />
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={handleDateChange("endDate")}
                      className={dateInputClasses}
                      style={dateInputStyle}
                    />
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-1 gap-2">
                  {activityOptions.map((option) => {
                    const isActive = formData.activity === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, activity: option.value }))}
                        className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm transition ${
                          isActive
                            ? "border-[#DB0000] bg-[#FFEBEB] text-[#8F2F2F]"
                            : "border-[#FFDEDE] bg-white text-[#2B1A1A]"
                        }`}
                      >
                        {option.icon ? (
                          <img src={option.icon} alt="" className="h-9 w-9" />
                        ) : (
                          <span className="grid h-9 w-9 place-items-center rounded-full bg-[#FFDEDE] text-base font-semibold text-[#8F2F2F]">
                            {option.label.charAt(0)}
                          </span>
                        )}
                        <span className="font-medium">{option.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex gap-3">
                  <label className="flex flex-col rounded-xl border border-transparent bg-[#F6F6F6] px-3 py-[6px]">
                    <span className="text-[11px] font-inter uppercase tracking-[0.1em] text-[#9C9C9C]">hrs</span>
                    <input
                      type="number"
                      min={0}
                      value={formData.hours}
                      onChange={handleNumberChange("hours")}
                      className={durationInputClasses}
                    />
                  </label>
                  <label className="flex flex-col rounded-xl border border-transparent bg-[#F6F6F6] px-3 py-[6px]">
                    <span className="text-[11px] font-inter uppercase tracking-[0.1em] text-[#9C9C9C]">mins</span>
                    <input
                      type="number"
                      min={0}
                      max={59}
                      value={formData.minutes}
                      onChange={handleNumberChange("minutes")}
                      className={durationInputClasses}
                    />
                  </label>
                </div>
              </div>

              <div className="space-y-3">
                <div className="text-sm font-inter font-semibold text-[#8F2F2F]">Attention rate</div>
                <div className="flex flex-wrap gap-2">
                  {attentionRateOptions.map((option) => {
                    const isActive = formData.attentionRate === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, attentionRate: option.value }))}
                        className={`${chipBaseClasses} border-[#FFDEDE] ${
                          isActive ? "bg-[#FFDEDE] text-[#8F2F2F]" : "bg-white text-[#2B1A1A]"
                        }`}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-inter font-semibold text-[#8F2F2F]">Input comprehensibility</span>
                  <span className="text-sm font-inter font-medium text-[#DB0000]">{formData.inputComprehensibility}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={formData.inputComprehensibility}
                  onChange={(event) =>
                    setFormData((prev) => ({ ...prev, inputComprehensibility: Number(event.target.value) }))
                  }
                  className="w-full accent-[#DB0000]"
                />
                <div className="flex justify-between text-[11px] uppercase tracking-wide text-[#8F2F2F]/70">
                  <span>0%</span>
                  <span>100%</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="text-sm font-semibold text-black font-inter">Reality rate</div>
                <div className="grid grid-cols-1 gap-2">
                  {realityRateOptions.map((option) => {
                    const isActive = formData.realityRates.includes(option.value);
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => toggleRealityRate(option.value)}
                        className={`flex items-center justify-between rounded-xl border border-transparent bg-[#F6F6F6] px-3 py-[7px] text-[13px] leading-[18px] font-inter transition ${
                          isActive ? "ring-2 ring-[#DB0000] text-[#2B1A1A]" : "text-[#9C9C9C]"
                        }`}
                      >
                        <span>{option.label}</span>
                        <span
                          className={`ml-3 grid h-6 w-6 place-items-center rounded-full border text-xs font-semibold ${
                            isActive ? "border-[#DB0000] bg-[#DB0000] text-white" : "border-[#F6F6F6] bg-white text-[#C56B6B]"
                          }`}
                        >
                          {isActive ? "✓" : "+"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="text-sm font-inter font-medium text-[#8F2F2F]/70 transition hover:text-[#8F2F2F]"
                >
                  Skip
                </button>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="rounded-full border border-[#DB0000] bg-[#FDF0F0] px-6 py-2 text-sm font-inter font-semibold text-[#DB0000] transition hover:bg-[#ffe1e1]"
                >
                  Step 2
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-lg font-inter font-semibold text-[#2B1A1A]">Comment</h2>
                <p className="text-sm font-inter text-[#9C9C9C]">
                  Please write your observations on progress — note any changes in your language abilities and describe which
                  strategies, techniques, or tools have helped you the most.
                </p>
              </div>

              <div className="relative">
                <textarea
                  id="progress-note-comment"
                  rows={6}
                  value={formData.comment}
                  onChange={(event) => setFormData((prev) => ({ ...prev, comment: event.target.value }))}
                  className="w-full resize-none rounded-2xl border border-transparent bg-[#F6F6F6] px-4 py-4 text-sm font-inter text-[#2B1A1A] focus:border-[#DB0000] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FAD4D4]"
                />
                {!formData.comment && (
                  <div className="pointer-events-none absolute inset-x-4 top-4 select-none text-sm font-inter">
                    <div className="text-black">Description</div>
                    <div className="text-xs text-[#C2C2C2]">E.g., name of TV show, podcast, etc.</div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="rounded-full bg-[#F6F6F6] px-5 py-2 text-sm font-inter font-medium text-[#9C9C9C] transition hover:bg-[#e8e8e8]"
                >
                  Skip
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="rounded-full border border-[#DB0000] bg-[#FDF0F0] px-6 py-2 text-sm font-inter font-semibold text-[#DB0000] transition hover:bg-[#ffe1e1]"
                >
                  Save
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProgressNoteModal;
