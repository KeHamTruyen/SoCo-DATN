import { useState, useCallback } from "react";
import { AI_LAB_TONES, AI_LAB_LENGTHS, type StudioMode } from "../utils/aiCreativeLabUtils";

const TONES = AI_LAB_TONES;
const LENGTHS = AI_LAB_LENGTHS;

export function useAiStudioForm() {
    const [mode, setMode] = useState<StudioMode>("text");
    const [prompt, setPrompt] = useState("");
    const [toneMode, setToneMode] = useState<"preset" | "custom">("preset");
    const [tonePreset, setTonePreset] = useState<(typeof TONES)[number]>("Excited");
    const [toneCustom, setToneCustom] = useState("");
    const [length, setLength] = useState<(typeof LENGTHS)[number]>("Medium");
    const [withHashtags, setWithHashtags] = useState(true);
    const [withCta, setWithCta] = useState(true);

    const effectiveTone = toneMode === "preset" ? tonePreset : toneCustom.trim();
    const displayTone = toneMode === "preset" ? tonePreset : toneCustom.trim() || "—";

    const resetForm = useCallback(() => {
        setMode("text");
        setPrompt("");
        setToneMode("preset");
        setTonePreset("Excited");
        setToneCustom("");
        setLength("Medium");
        setWithHashtags(true);
        setWithCta(true);
    }, []);

    return {
        mode, setMode,
        prompt, setPrompt,
        toneMode, setToneMode,
        tonePreset, setTonePreset,
        toneCustom, setToneCustom,
        length, setLength,
        withHashtags, setWithHashtags,
        withCta, setWithCta,
        effectiveTone,
        displayTone,
        resetForm
    };
}
