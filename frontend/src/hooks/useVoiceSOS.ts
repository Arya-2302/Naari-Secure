import { useEffect, useRef } from "react";
import { useApp } from "@/contexts/AppContext";
import { useToast } from "@/hooks/use-toast";

const useVoiceSOS = (enabled: boolean, onDetect: () => void) => {
    const { toast } = useToast();
    const recognitionRef = useRef<any>(null);
    const manualStopRef = useRef(false);
    const onDetectRef = useRef(onDetect);

    // Keep the callback ref up to date without triggering effect restarts
    useEffect(() => {
        onDetectRef.current = onDetect;
    }, [onDetect]);

    useEffect(() => {
        if (!enabled) {
            if (recognitionRef.current) {
                console.log("Voice SOS: Manually disabling mic...");
                manualStopRef.current = true;
                recognitionRef.current.stop();
                recognitionRef.current = null;
            }
            return;
        }

        console.log("Voice SOS: Initializing listening...");
        manualStopRef.current = false;

        const SpeechRecognition =
            (window as any).SpeechRecognition ||
            (window as any).webkitSpeechRecognition;

        if (!SpeechRecognition) {
            toast({
                title: "Voice SOS Not Supported",
                description: "Your browser doesn't support voice recognition.",
                variant: "destructive"
            });
            return;
        }

        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;

        recognition.continuous = true;
        recognition.interimResults = true;

        // Let browser decide language for better compatibility if en-IN is failing
        // Or stick to en-US which is most robustly supported
        recognition.lang = "en-US";

        recognition.onresult = (event: any) => {
            let finalTranscript = "";
            let interimTranscript = "";

            for (let i = event.resultIndex; i < event.results.length; ++i) {
                const transcript = event.results[i][0].transcript.toLowerCase();
                if (event.results[i].isFinal) {
                    finalTranscript += transcript;
                } else {
                    interimTranscript += transcript;
                }
            }

            const combined = (finalTranscript + " " + interimTranscript).trim();
            if (!combined) return;

            // Log for debugging
            console.log("Speech Heard:", combined);

            const dangerWords = [
                "help", "sos", "emergency", "police", "bachao", "madad",
                "save me", "help me", "danger", "save", "musaibat",
                "bachavo", "madavo", "bachao bachao", "help help"
            ];

            const detected = dangerWords.some(word => combined.includes(word));

            if (detected) {
                console.log("!!! VOICE SOS TRIGGERED !!! Keyword found in:", combined);
                if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
                onDetectRef.current();
            }
        };

        recognition.onstart = () => {
            console.log("Speech Recognition: Service Started");
            toast({
                title: "Voice Protection Active",
                description: "Listening for 'HELP', 'SOS', 'BACHAO'...",
                variant: "default"
            });
        };

        recognition.onsoundstart = () => console.log("Speech Recognition: Sound detected...");
        recognition.onspeechstart = () => console.log("Speech Recognition: Speech detected...");

        recognition.onerror = (event: any) => {
            console.error("Speech Recognition Error:", event.error);
            if (event.error === 'not-allowed') {
                toast({
                    title: "Microphone Access Denied",
                    description: "Please check browser and system-level microphone permissions.",
                    variant: "destructive"
                });
            }
        };

        recognition.onend = () => {
            console.log("Speech Recognition: Service Ended. Manual Stop:", manualStopRef.current);
            if (enabled && !manualStopRef.current) {
                const restart = () => {
                    try {
                        if (enabled && !manualStopRef.current) {
                            console.log("Voice SOS: Auto-restarting...");
                            recognition.start();
                        }
                    } catch (e) {
                        // Ignore restart collisions
                    }
                };
                setTimeout(restart, 1000);
            }
        };

        const startRecognition = async () => {
            try {
                // Try to wake up hardware
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                stream.getTracks().forEach(track => track.stop());

                if (enabled && !manualStopRef.current) {
                    recognition.start();
                }
            } catch (err: any) {
                console.error("Mic Initiation Error:", err.name);
                // Fallback attempt
                if (enabled && !manualStopRef.current) {
                    try { recognition.start(); } catch (e) { }
                }
            }
        };

        startRecognition();

        return () => {
            manualStopRef.current = true;
            if (recognitionRef.current) {
                recognitionRef.current.stop();
                recognitionRef.current = null;
            }
        };
    }, [enabled, toast]);
};

export default useVoiceSOS;
