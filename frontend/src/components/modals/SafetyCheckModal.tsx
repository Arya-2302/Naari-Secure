import React, { useEffect, useState } from 'react';
import { AlertTriangle, ShieldCheck, PhoneCall } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface SafetyCheckModalProps {
    isOpen: boolean;
    isMidJourney?: boolean;
    onSafe: () => void;
    onSOS: () => void;
}

const SafetyCheckModal: React.FC<SafetyCheckModalProps> = ({ isOpen, isMidJourney, onSafe, onSOS }) => {
    const { t } = useLanguage();
    const [timeLeft, setTimeLeft] = useState(60); // 60 seconds to respond

    useEffect(() => {
        if (!isOpen) {
            setTimeLeft(60);
            return;
        }

        // --- AUDIO PROMPT LOGIC ---
        const playSafetyAudio = () => {
            console.log("[SAFETY] playSafetyAudio triggered");

            if (!('speechSynthesis' in window)) {
                console.error("[SAFETY] SpeechSynthesis not supported");
                return;
            }

            const speakText = () => {
                window.speechSynthesis.cancel();

                const utterance1 = new SpeechSynthesisUtterance("Are you safe?");
                utterance1.lang = 'en-US';
                utterance1.volume = 1;
                utterance1.rate = 1;

                const utterance2 = new SpeechSynthesisUtterance("aap surakshit hain?");
                utterance2.lang = 'hi-IN';
                utterance2.volume = 1;
                utterance2.rate = 1;

                utterance1.onstart = () => console.log("[SAFETY] Speaking EN...");
                utterance1.onerror = (e) => console.error("[SAFETY] EN Error:", e);
                utterance2.onstart = () => console.log("[SAFETY] Speaking HI...");
                utterance2.onerror = (e) => console.error("[SAFETY] HI Error:", e);

                window.speechSynthesis.speak(utterance1);
                window.speechSynthesis.speak(utterance2);
            };

            // Ensure voices are loaded (Chrome fix)
            if (window.speechSynthesis.getVoices().length === 0) {
                console.log("[SAFETY] Voices not loaded yet, waiting...");
                window.speechSynthesis.onvoiceschanged = () => {
                    console.log("[SAFETY] Voices loaded via onvoiceschanged");
                    speakText();
                };
            } else {
                speakText();
            }
        };

        // Small delay to ensure browser is ready after modal animation
        const audioTimeout = setTimeout(playSafetyAudio, 800);

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    onSOS(); // Auto-trigger SOS if no response
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            clearInterval(timer);
            clearTimeout(audioTimeout);
            window.speechSynthesis.cancel(); // Stop speaking if modal closes
        };
    }, [isOpen, onSOS]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className={`bg-card w-full max-w-md rounded-2xl shadow-2xl border-2 ${isMidJourney ? 'border-indigo-500' : 'border-destructive'} p-6 animate-in zoom-in-95 duration-300`}>

                <div className="text-center space-y-4">
                    <div className={`w-16 h-16 rounded-full ${isMidJourney ? 'bg-indigo-100' : 'bg-destructive/10'} flex items-center justify-center mx-auto animate-pulse`}>
                        <AlertTriangle className={`w-8 h-8 ${isMidJourney ? 'text-indigo-600' : 'text-destructive'}`} />
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold text-foreground">
                            {isMidJourney ? "Night Travel Check-in" : "Are you safe?"}
                        </h2>
                        <p className="text-muted-foreground mt-1">
                            {isMidJourney
                                ? "You're halfway through your night journey. Just checking in!"
                                : "We detected a delay in your journey."}
                        </p>
                    </div>

                    <div className="py-4">
                        <div className={`text-3xl font-mono font-bold ${isMidJourney ? 'text-indigo-600' : 'text-destructive'}`}>
                            00:{timeLeft.toString().padStart(2, '0')}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Auto-SOS in seconds</p>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                        <button
                            onClick={onSafe}
                            className="w-full py-4 rounded-xl bg-green-500 hover:bg-green-600 text-white font-bold text-lg flex items-center justify-center gap-2 transition-all"
                        >
                            <ShieldCheck className="w-6 h-6" />
                            Yes, I am Safe
                        </button>

                        <button
                            onClick={onSOS}
                            className="w-full py-4 rounded-xl bg-destructive hover:bg-destructive/90 text-destructive-foreground font-bold text-lg flex items-center justify-center gap-2 transition-all"
                        >
                            <PhoneCall className="w-6 h-6" />
                            NO, HELP ME!
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SafetyCheckModal;
