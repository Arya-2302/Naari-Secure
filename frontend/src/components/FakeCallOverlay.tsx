import { useState, useEffect, useRef } from 'react';
import { Phone, PhoneOff, User, Mic, MicOff, Volume2 } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

const FakeCallOverlay = () => {
    const { fakeCallActive, endFakeCall, fakeCallerName } = useApp();
    const [callDuration, setCallDuration] = useState(0);
    const [isAccepted, setIsAccepted] = useState(false);

    const audioRef = useRef<HTMLAudioElement | null>(null);
    const speechTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Audio context for generating a reliable "beep" if the file fails
    // Local custom ringtone path
    const ringtoneUrl = "/assets/audio/ringtone.mp3";
    const fallbackRingtoneUrl = "https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3";

    const voiceUrl = "/assets/audio/voice.m4a";

    const speakPhrases = () => {
        const phrases = [
            `Hello? Beta, where are you? It's getting late.`,
            `Hi! Where have you reached? I'm waiting for you at the gate.`,
            `Is everything okay? You're taking longer than expected.`,
            `I've prepared dinner, how much more time will you take?`
        ];

        const runFallbackSpeech = () => {
            if (!isAccepted || !fakeCallActive) return;

            const phrase = phrases[Math.floor(Math.random() * phrases.length)];
            const utterance = new SpeechSynthesisUtterance(phrase);
            utterance.rate = 0.9;
            utterance.pitch = 1.1;
            window.speechSynthesis.speak(utterance);

            speechTimeoutRef.current = setTimeout(runFallbackSpeech, 5000 + Math.random() * 5000);
        };

        // Try to play custom voice file first
        const voiceAudio = new Audio(voiceUrl);
        voiceAudio.play().then(() => {
            console.log("Custom voice audio playing...");
            audioRef.current = voiceAudio; // Track it so we can stop it if call ends
        }).catch(e => {
            console.warn("Custom voice.mp3 not found, falling back to text-to-speech", e);
            runFallbackSpeech();
        });
    };

    // Reset state when call ends/starts
    useEffect(() => {
        if (!fakeCallActive) {
            setIsAccepted(false);
            setCallDuration(0);
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
            if (speechTimeoutRef.current) {
                clearTimeout(speechTimeoutRef.current);
            }
            window.speechSynthesis.cancel();
            if (navigator.vibrate) navigator.vibrate(0);
        } else {
            // START RINGING
            if (navigator.vibrate) {
                // Stronger pulsing pattern: vibrate 400ms, pause 200ms, repeat
                navigator.vibrate([400, 200, 400, 200, 400, 200, 400, 200, 400, 200, 400, 200]);
            }
            try {
                const audio = new Audio(ringtoneUrl);
                audio.loop = true;

                audio.play().catch(e => {
                    console.warn("Local custom ringtone not found or blocked, trying fallback...", e);
                    // FALLBACK if the file doesn't exist or can't play
                    const fallbackAudio = new Audio(fallbackRingtoneUrl);
                    fallbackAudio.loop = true;
                    fallbackAudio.play().catch(err => console.error("Fallback audio play failed", err));
                    audioRef.current = fallbackAudio;
                });

                audioRef.current = audio;
            } catch (e) {
                console.error("Audio initialization error", e);
            }
        }

        return () => {
            if (audioRef.current) audioRef.current.pause();
            window.speechSynthesis.cancel();
        };
    }, [fakeCallActive]);

    // Cleanup audio on accept and start speaking
    useEffect(() => {
        if (isAccepted) {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
            if (navigator.vibrate) navigator.vibrate(0);

            // Start the fake conversation
            const voiceAudio = new Audio(voiceUrl);
            voiceAudio.play()
                .then(() => {
                    audioRef.current = voiceAudio;
                })
                .catch(() => {
                    // Fallback to dynamic speech synthesis if no file is found
                    speakPhrases();
                });
        }
    }, [isAccepted]);

    // Timer logic
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isAccepted && fakeCallActive) {
            interval = setInterval(() => {
                setCallDuration(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isAccepted, fakeCallActive]);

    if (!fakeCallActive) return null;

    const formatTime = (secs: number) => {
        const mins = Math.floor(secs / 60);
        const s = secs % 60;
        return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    // --- INCOMING CALL UI ---
    if (!isAccepted) {
        return (
            <div className="fixed inset-0 bg-gray-900 text-white flex flex-col items-center pt-20 pb-12 z-[100] animate-in fade-in">
                <div className="flex-1 flex flex-col items-center space-y-4">
                    <div className="w-32 h-32 rounded-full bg-gray-700 flex items-center justify-center mb-4">
                        <User className="w-16 h-16 text-gray-400" />
                    </div>
                    <h1 className="text-4xl font-medium tracking-tight">{fakeCallerName}</h1>
                    <p className="text-xl text-gray-400">Mobile</p>
                </div>

                <div className="w-full px-12 pb-16 flex justify-between items-end">
                    <div className="flex flex-col items-center gap-2">
                        <button
                            onClick={endFakeCall}
                            className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center animate-bounce shadow-lg"
                            style={{ animationDuration: '2s' }}
                        >
                            <PhoneOff className="w-10 h-10 text-white fill-current" />
                        </button>
                        <span className="text-sm font-medium">Decline</span>
                    </div>

                    <div className="flex flex-col items-center gap-2">
                        <button
                            onClick={() => setIsAccepted(true)}
                            className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center animate-bounce shadow-lg"
                            style={{ animationDuration: '2s', animationDelay: '0.1s' }}
                        >
                            <Phone className="w-10 h-10 text-white fill-current" />
                        </button>
                        <span className="text-sm font-medium">Accept</span>
                    </div>
                </div>
            </div>
        );
    }

    // --- ACTIVE CALL UI ---
    return (
        <div className="fixed inset-0 bg-gray-900 text-white flex flex-col items-center pt-20 pb-12 z-[100]">
            <div className="flex-1 flex flex-col items-center">
                <div className="w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center mb-6">
                    <User className="w-12 h-12 text-gray-400" />
                </div>
                <h1 className="text-3xl font-medium mb-2">{fakeCallerName}</h1>
                <p className="text-lg text-gray-300 mb-12">{formatTime(callDuration)}</p>

                <div className="grid grid-cols-2 gap-x-12 gap-y-12 mb-16 px-12">
                    <div className="flex flex-col items-center gap-2 opacity-50">
                        <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center">
                            <MicOff className="w-8 h-8" />
                        </div>
                        <span>Mute</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 opacity-50">
                        <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center">
                            <Volume2 className="w-8 h-8" />
                        </div>
                        <span>Speaker</span>
                    </div>
                </div>
            </div>

            <button
                onClick={endFakeCall}
                className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"
            >
                <PhoneOff className="w-10 h-10 text-white fill-current" />
            </button>
        </div>
    );
};

export default FakeCallOverlay;
