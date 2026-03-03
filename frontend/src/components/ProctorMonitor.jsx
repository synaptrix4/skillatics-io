import { useState, useEffect, useRef } from 'react'
import { Camera, AlertTriangle, Eye, EyeOff } from 'lucide-react'

/**
 * Proctoring Component - Fixed bottom-right overlay
 * Features:
 * - Tab switching detection
 * - Webcam monitoring (compact overlay)
 * - Fullscreen enforcement
 */
export default function ProctorMonitor({ onViolation, testActive = false }) {
    const [webcamEnabled, setWebcamEnabled] = useState(false)
    const [tabSwitches, setTabSwitches] = useState(0)
    const [violations, setViolations] = useState([])
    const [isVisible, setIsVisible] = useState(true)
    const videoRef = useRef(null)
    const streamRef = useRef(null)

    const enableWebcam = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: 320, height: 240 },
                audio: false
            })
            if (videoRef.current) {
                videoRef.current.srcObject = stream
                streamRef.current = stream
                setWebcamEnabled(true)
            }
        } catch (err) {
            console.error('Webcam access denied:', err)
            logViolation('webcam_denied', 'Webcam access was denied')
        }
    }

    const disableWebcam = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop())
            streamRef.current = null
            setWebcamEnabled(false)
        }
    }

    const logViolation = (type, description) => {
        const violation = { type, description, timestamp: new Date().toISOString() }
        setViolations(prev => [...prev, violation])
        if (onViolation) onViolation(violation)
    }

    useEffect(() => {
        if (!testActive) return
        const handleVisibilityChange = () => {
            if (document.hidden) {
                setTabSwitches(prev => prev + 1)
                logViolation('tab_switch', 'User switched away from test tab')
            }
        }
        const handleBlur = () => logViolation('window_blur', 'Test window lost focus')
        document.addEventListener('visibilitychange', handleVisibilityChange)
        window.addEventListener('blur', handleBlur)
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange)
            window.removeEventListener('blur', handleBlur)
        }
    }, [testActive])

    useEffect(() => {
        if (!testActive) return
        const handleFullscreenChange = () => {
            if (!document.fullscreenElement) logViolation('exit_fullscreen', 'User exited fullscreen mode')
        }
        document.addEventListener('fullscreenchange', handleFullscreenChange)
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }, [testActive])

    useEffect(() => {
        return () => disableWebcam()
    }, [])

    useEffect(() => {
        if (testActive && !webcamEnabled) enableWebcam()
        else if (!testActive && webcamEnabled) disableWebcam()
    }, [testActive])

    if (!testActive) return null

    return (
        <div className="fixed bottom-4 right-4 z-50 w-52">
            {/* Compact Webcam Overlay */}
            <div className="rounded-xl overflow-hidden shadow-2xl border border-slate-700/50 bg-slate-900">
                {/* Title Bar */}
                <div className="flex items-center justify-between px-2.5 py-1.5 bg-slate-800/90">
                    <div className="flex items-center gap-1.5">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                        </span>
                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Proctoring</span>
                    </div>
                    <button
                        onClick={() => setIsVisible(!isVisible)}
                        className="text-slate-500 hover:text-slate-200 transition-colors"
                    >
                        {isVisible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                    </button>
                </div>

                {/* Webcam Feed */}
                {isVisible && (
                    <div className="relative">
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full aspect-video object-cover bg-black"
                        />
                        {!webcamEnabled && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black">
                                <Camera className="h-6 w-6 text-slate-600" />
                            </div>
                        )}
                    </div>
                )}

                {/* Status Bar */}
                <div className="px-2.5 py-1.5 bg-slate-800/80 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-400">Tab Switches</span>
                    <span className={`text-[10px] font-bold font-mono ${tabSwitches > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                        {tabSwitches} / 3
                    </span>
                </div>

                {/* Warning banner */}
                {tabSwitches > 0 && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-500/20 border-t border-amber-500/30">
                        <AlertTriangle className="h-3 w-3 text-amber-400 flex-shrink-0" />
                        <span className="text-[10px] text-amber-300 font-medium">Tab switching detected</span>
                    </div>
                )}
            </div>
        </div>
    )
}

export const getViolationData = (violations) => ({
    total_violations: violations.length,
    tab_switches: violations.filter(v => v.type === 'tab_switch').length,
    fullscreen_exits: violations.filter(v => v.type === 'exit_fullscreen').length,
    copy_attempts: violations.filter(v => v.type === 'copy_attempt').length,
    paste_attempts: violations.filter(v => v.type === 'paste_attempt').length,
    violations_log: violations
})
