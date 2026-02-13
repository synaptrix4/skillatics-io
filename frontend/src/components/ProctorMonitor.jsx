import { useState, useEffect, useRef } from 'react'
import { Camera, AlertTriangle, Eye, EyeOff } from 'lucide-react'

/**
 * Proctoring Component - Basic test monitoring
 * Features:
 * - Tab switching detection
 * - Webcam monitoring
 * - Fullscreen enforcement
 * - Activity logging
 */
export default function ProctorMonitor({ onViolation, testActive = false }) {
    const [webcamEnabled, setWebcamEnabled] = useState(false)
    const [tabSwitches, setTabSwitches] = useState(0)
    const [violations, setViolations] = useState([])
    const [isVisible, setIsVisible] = useState(true)
    const videoRef = useRef(null)
    const streamRef = useRef(null)

    // Request webcam access
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

    // Stop webcam
    const disableWebcam = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop())
            streamRef.current = null
            setWebcamEnabled(false)
        }
    }

    // Log violation
    const logViolation = (type, description) => {
        const violation = {
            type,
            description,
            timestamp: new Date().toISOString()
        }

        setViolations(prev => [...prev, violation])

        if (onViolation) {
            onViolation(violation)
        }
    }

    // Tab switching detection
    useEffect(() => {
        if (!testActive) return

        const handleVisibilityChange = () => {
            if (document.hidden) {
                setIsVisible(false)
                setTabSwitches(prev => prev + 1)
                logViolation('tab_switch', 'User switched away from test tab')
            } else {
                setIsVisible(true)
            }
        }

        const handleBlur = () => {
            logViolation('window_blur', 'Test window lost focus')
        }

        document.addEventListener('visibilitychange', handleVisibilityChange)
        window.addEventListener('blur', handleBlur)

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange)
            window.removeEventListener('blur', handleBlur)
        }
    }, [testActive])

    // Fullscreen monitoring
    useEffect(() => {
        if (!testActive) return

        const handleFullscreenChange = () => {
            if (!document.fullscreenElement) {
                logViolation('exit_fullscreen', 'User exited fullscreen mode')
            }
        }

        document.addEventListener('fullscreenchange', handleFullscreenChange)

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange)
        }
    }, [testActive])

    // Copy/Paste detection (optional)
    useEffect(() => {
        if (!testActive) return

        const handleCopy = (e) => {
            logViolation('copy_attempt', 'User attempted to copy content')
        }

        const handlePaste = (e) => {
            logViolation('paste_attempt', 'User attempted to paste content')
        }

        document.addEventListener('copy', handleCopy)
        document.addEventListener('paste', handlePaste)

        return () => {
            document.removeEventListener('copy', handleCopy)
            document.removeEventListener('paste', handlePaste)
        }
    }, [testActive])

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            disableWebcam()
        }
    }, [])

    // Auto-enable webcam when test starts
    useEffect(() => {
        if (testActive && !webcamEnabled) {
            enableWebcam()
        } else if (!testActive && webcamEnabled) {
            disableWebcam()
        }
    }, [testActive])

    if (!testActive) {
        return null
    }

    return (
        <div className="fixed bottom-4 right-4 z-50">
            {/* Webcam Preview */}
            <div className="bg-white rounded-lg shadow-lg border-2 border-gray-300 overflow-hidden">
                <div className="bg-gray-800 px-3 py-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Camera className="h-4 w-4 text-white" />
                        <span className="text-xs font-medium text-white">Proctoring Active</span>
                    </div>
                    <button
                        onClick={() => setIsVisible(!isVisible)}
                        className="text-white hover:text-gray-300"
                    >
                        {isVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </button>
                </div>

                {isVisible && (
                    <>
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-64 h-48 bg-black"
                        />

                        {/* Status Info */}
                        <div className="p-2 bg-gray-50 border-t border-gray-200">
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-600">Tab Switches:</span>
                                <span className={`font-semibold ${tabSwitches > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                    {tabSwitches}
                                </span>
                            </div>

                            {tabSwitches > 0 && (
                                <div className="mt-2 flex items-start gap-1 text-xs text-amber-700 bg-amber-50 p-2 rounded">
                                    <AlertTriangle className="h-3 w-3 flex-shrink-0 mt-0.5" />
                                    <span>Tab switching detected. This may affect your score.</span>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* Warning Toast for Tab Switches */}
            {!isVisible && tabSwitches > 0 && (
                <div className="mt-2 bg-red-50 border-2 border-red-500 rounded-lg p-3 shadow-lg max-w-xs">
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                        <div>
                            <p className="text-sm font-semibold text-red-900">Warning!</p>
                            <p className="text-xs text-red-700">Return to the test immediately</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

// Export function to get violation data
export const getViolationData = (violations) => {
    return {
        total_violations: violations.length,
        tab_switches: violations.filter(v => v.type === 'tab_switch').length,
        fullscreen_exits: violations.filter(v => v.type === 'exit_fullscreen').length,
        copy_attempts: violations.filter(v => v.type === 'copy_attempt').length,
        paste_attempts: violations.filter(v => v.type === 'paste_attempt').length,
        violations_log: violations
    }
}
