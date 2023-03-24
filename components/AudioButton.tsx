import { AudioRecorder } from 'react-audio-voice-recorder'

export default function AudioButton ({ getWhisperResponse }: { getWhisperResponse: (blob: Blob) => void }) {
  return (
    <AudioRecorder
      onRecordingComplete={async (blob) => getWhisperResponse(blob)}
      classes={{
        AudioRecorderStartSaveClass: 'audio-recorder-svg-color',
        AudioRecorderPauseResumeClass: 'audio-recorder-svg-color',
        AudioRecorderDiscardClass: 'audio-recorder-svg-color'
      }}
    />
  )
}
