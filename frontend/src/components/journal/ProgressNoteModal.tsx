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
  inputComprehensibility: number | null;
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
  inputComprehensibility: null,
  realityRates: [realityRateOptions[2].value],
  comment: "",
};

interface ProgressNoteModalProps {
  open: boolean;
  onClose: () => void;
  onSave?: (data: ProgressNoteFormData) => void;
}

const chipBaseClasses =
  "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1";

const dateInputClasses =
  "w-[126px] h-9 appearance-none rounded-xl border border-transparent bg-[#F6F6F6] px-3 text-sm font-inter text-[#9C9C9C] focus:border-[#DB0000] focus:outline-none focus:ring-2 focus:ring-[#FAD4D4]";

const dateInputStyle: CSSProperties = {
  fontFamily: "'Inter', sans-serif",
  color: "#9C9C9C",
};

const durationInputClasses =
  "w-[40px] border-none bg-transparent text-sm font-semibold text-black focus:outline-none";

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

  const handleInputComprehensibilityChange = (event: ChangeEvent<HTMLInputElement>) => {
    const rawValue = event.target.value;
    const numericValue = rawValue === "" ? null : Math.max(0, Math.min(100, Number(rawValue)));
    if (Number.isNaN(numericValue ?? 0)) {
      return;
    }
    setFormData((prev) => ({
      ...prev,
      inputComprehensibility: numericValue,
    }));
  };

  const toggleRealityRate = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      realityRates: prev.realityRates.includes(value) ? [] : [value],
    }));
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
            {step === 1 ? "Step 1/2. Activity" : "Step 2/2. Comment"}
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
                        className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors focus:outline-none ${
                          isActive ? "text-[#DB0000]" : "text-[#9C9C9C]"
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
                  <label className="flex items-center rounded-xl border border-transparent bg-[#F6F6F6] px-3 py-[6px]">
                    <input
                      type="number"
                      min={0}
                      value={formData.hours}
                      onChange={handleNumberChange("hours")}
                      className={durationInputClasses}
                    />
                    <span className="ml-2 text-[11px] font-inter text-[#9C9C9C]">hrs</span>
                  </label>
                  <label className="flex items-center rounded-xl border border-transparent bg-[#F6F6F6] px-3 py-[6px]">
                    <input
                      type="number"
                      min={0}
                      max={59}
                      value={formData.minutes}
                      onChange={handleNumberChange("minutes")}
                      className={durationInputClasses}
                    />
                    <span className="ml-2 text-[11px] font-inter text-[#9C9C9C]">mins</span>
                  </label>
                </div>
              </div>

              <div className="space-y-3">
                <div className="text-sm font-inter font-semibold text-black">Attention rate:</div>
                <div className="flex flex-wrap gap-2">
                  {attentionRateOptions.map((option) => {
                    const isActive = formData.attentionRate === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, attentionRate: option.value }))}
                        className={`${chipBaseClasses} ${
                          isActive
                            ? "bg-[#FDF0F0] text-[#DB0000]"
                            : "bg-[#F6F6F6] text-[#9C9C9C]"
                        }`}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="space-y-2">
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={formData.inputComprehensibility ?? ""}
                    onChange={handleInputComprehensibilityChange}
                    className="w-full rounded-xl border border-transparent bg-[#FDF0F0] px-4 py-3 pr-10 text-sm font-inter text-[#2B1A1A] placeholder-[#F7ACAC] focus:border-[#DB0000] focus:outline-none focus:ring-2 focus:ring-[#FAD4D4]"
                  />
                  {formData.inputComprehensibility === null && (
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-inter text-[#F7ACAC]">
                      Input Comprehensibility
                    </span>
                  )}
                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-inter font-semibold text-[#DB0000]">
                    %
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="text-sm font-semibold text-black font-inter">Reality rate:</div>
                <div className="grid grid-cols-1 gap-2">
                  {realityRateOptions.map((option) => {
                    const isActive = formData.realityRates.includes(option.value);
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => toggleRealityRate(option.value)}
                        className={`flex items-center rounded-lg px-3 py-2 text-xs font-inter transition ${
                          isActive
                            ? "bg-[#FDF0F0] text-[#DB0000]"
                            : "bg-[#F6F6F6] text-[#9C9C9C]"
                        }`}
                      >
                        <span className="truncate">{option.label}</span>
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
