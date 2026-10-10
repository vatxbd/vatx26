import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, Volume2, Loader2, MessageSquare, Bot, AlertCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LiveAgentProps {
  onClose?: () => void;
}

export default function LiveAgent({ onClose }: LiveAgentProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [transcription, setTranscription] = useState<{ user?: string; model?: string }>({});
  const [error, setError] = useState<string | null>(null);
  const [volume, setVolume] = useState(0);

  const recognitionRef = useRef<any>(null);
  const isMutedRef = useRef(false);
  isMutedRef.current = isMuted;

  const stopSession = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsConnected(false);
    setIsConnecting(false);
    setVolume(0);
  }, []);

  const speakText = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window) || isMutedRef.current) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onstart = () => setVolume(0.8);
    utterance.onend = () => setVolume(0);
    utterance.onerror = () => setVolume(0);
    window.speechSynthesis.speak(utterance);
  };

  const handleUserSpeech = async (speechText: string) => {
    if (!speechText.trim()) return;
    setTranscription(prev => ({ ...prev, user: speechText }));
    setVolume(0.5);

    try {
      const res = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: speechText,
          systemInstruction: "You are an intelligent, friendly voice assistant for VATX.BD (Tax, VAT, and business consultant in Bangladesh). Keep spoken answers concise, informative, and conversational (under 3 sentences)."
        })
      });

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      const data = await res.json();
      const reply = data.text || "I understood your query. How else can I assist with your tax and VAT needs?";
      setTranscription(prev => ({ ...prev, model: reply }));
      speakText(reply);
    } catch (err: any) {
      console.error("Voice AI error:", err);
      const fallback = "I'm having trouble processing that right now. Please try asking again.";
      setTranscription(prev => ({ ...prev, model: fallback }));
      speakText(fallback);
    }
  };

  const startSession = async () => {
    setIsConnecting(true);
    setError(null);

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        throw new Error("Speech recognition is not supported in this browser. Please use Chrome or Edge.");
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsConnected(true);
        setIsConnecting(false);
        const welcome = "Hello! I am your VATX live AI consultant. Ask me any tax or VAT question.";
        setTranscription({ model: welcome });
        speakText(welcome);
      };

      recognition.onresult = (event: any) => {
        if (isMutedRef.current) return;
        const current = event.resultIndex;
        const transcript = event.results[current][0].transcript;
        handleUserSpeech(transcript);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech Recognition Error:", event.error);
        if (event.error === 'not-allowed') {
          setError("Microphone permission denied. Please allow microphone access.");
          stopSession();
        }
      };

      recognition.onend = () => {
        if (isConnected && !isMutedRef.current && recognitionRef.current) {
          try {
            recognition.start();
          } catch (e) {}
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.error("Failed to start session:", err);
      setError(err.message || "Could not access microphone or initialize live assistant.");
      setIsConnecting(false);
    }
  };

  useEffect(() => {
    return () => {
      stopSession();
    };
  }, [stopSession]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-zinc-900 border border-zinc-800 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[600px]"
      >
        {/* Header */}
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-zinc-600'}`} />
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <Bot className="w-5 h-5 text-indigo-400" />
              Gemini Live Voice Consultant
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-zinc-800 rounded-full transition-colors text-zinc-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-8 flex flex-col items-center justify-center relative overflow-hidden">
          {/* Background Animation */}
          <div className="absolute inset-0 pointer-events-none opacity-20">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/30 rounded-full blur-[120px]" />
          </div>

          <AnimatePresence mode="wait">
            {!isConnected && !isConnecting ? (
              <motion.div 
                key="start"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center z-10"
              >
                <div className="w-24 h-24 bg-indigo-600/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-indigo-500/30">
                  <Bot className="w-12 h-12 text-indigo-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Ready to talk?</h3>
                <p className="text-zinc-400 mb-8 max-w-xs mx-auto">
                  Experience real-time interactive voice conversation with Gemini for Bangladesh Tax & VAT.
                </p>
                <button
                  onClick={startSession}
                  className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-bold text-lg transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-indigo-600/20"
                >
                  Start Conversation
                </button>
              </motion.div>
            ) : isConnecting ? (
              <motion.div 
                key="connecting"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center z-10"
              >
                <Loader2 className="w-16 h-16 text-indigo-500 animate-spin mx-auto mb-6" />
                <h3 className="text-xl font-medium text-white">Connecting to Gemini...</h3>
                <p className="text-zinc-500 mt-2">Setting up voice channel</p>
              </motion.div>
            ) : (
              <motion.div 
                key="active"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full h-full flex flex-col items-center justify-between z-10"
              >
                {/* Visualizer */}
                <div className="flex items-center justify-center gap-1 h-32">
                  {[...Array(12)].map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{ 
                        height: isMuted ? 4 : Math.max(4, (volume > 0 ? volume : 0.15) * 120 * (0.5 + Math.random() * 0.5)) 
                      }}
                      className="w-2 bg-indigo-500 rounded-full"
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    />
                  ))}
                </div>

                {/* Transcriptions */}
                <div className="w-full space-y-6 max-h-[200px] overflow-y-auto px-4 custom-scrollbar">
                  {transcription.user && (
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex gap-3 items-start"
                    >
                      <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center flex-shrink-0">
                        <MessageSquare className="w-4 h-4 text-zinc-400" />
                      </div>
                      <div className="bg-zinc-800/50 p-3 rounded-2xl rounded-tl-none border border-zinc-700/50">
                        <p className="text-zinc-300 text-sm">{transcription.user}</p>
                      </div>
                    </motion.div>
                  )}
                  {transcription.model && (
                    <motion.div 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex gap-3 items-start justify-end"
                    >
                      <div className="bg-indigo-600/20 p-3 rounded-2xl rounded-tr-none border border-indigo-500/20 max-w-[80%]">
                        <p className="text-indigo-100 text-sm">{transcription.model}</p>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-indigo-600/30 flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4 text-indigo-400" />
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Controls */}
                <div className="flex items-center gap-6 mt-8">
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className={`p-5 rounded-full transition-all ${isMuted ? 'bg-red-500/20 text-red-500 border-red-500/30' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'} border`}
                  >
                    {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                  </button>
                  <button
                    onClick={stopSession}
                    className="px-10 py-4 bg-red-600 hover:bg-red-500 text-white rounded-full font-bold transition-all shadow-lg shadow-red-600/20"
                  >
                    End Call
                  </button>
                  <div className="p-5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
                    <Volume2 className="w-6 h-6" />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-4 left-4 right-4 bg-red-500/10 border border-red-500/20 p-3 rounded-xl flex items-center gap-3 text-red-400 text-sm"
            >
              <AlertCircle className="w-4 h-4" />
              {error}
            </motion.div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-zinc-950/50 text-center">
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">
            Powered by Gemini 3.8 Flash
          </p>
        </div>
      </motion.div>
    </div>
  );
}
