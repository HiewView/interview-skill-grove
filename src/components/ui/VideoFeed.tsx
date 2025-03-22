
import React, { useRef, useEffect, useState } from 'react';

interface VideoFeedProps {
  muted?: boolean;
  mirrored?: boolean;
  className?: string;
  onStreamReady?: (stream: MediaStream) => void;
}

const VideoFeed: React.FC<VideoFeedProps> = ({ 
  muted = false, 
  mirrored = true,
  className = "",
  onStreamReady
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState(true);
  const streamRef = useRef<MediaStream | null>(null);

  // Setup camera and handle mute state changes
  useEffect(() => {
    const setupCamera = async () => {
      try {
        setIsLoading(true);
        // If we already have a stream, stop all tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
        
        // Get a new stream with video and potentially audio
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: true
        });
        
        // Store the stream in the ref
        streamRef.current = stream;
        
        // Set the stream to the video element
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        
        // Update audio tracks based on muted state
        stream.getAudioTracks().forEach(track => {
          track.enabled = !muted;
        });
        
        // Call onStreamReady callback if provided
        if (onStreamReady) {
          onStreamReady(stream);
        }
        
        setHasPermission(true);
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasPermission(false);
      } finally {
        setIsLoading(false);
      }
    };

    setupCamera();

    // Cleanup function
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []); // Only run once on mount

  // Handle mute/unmute without recreating the stream
  useEffect(() => {
    if (streamRef.current) {
      // Toggle audio tracks based on muted state
      streamRef.current.getAudioTracks().forEach(track => {
        track.enabled = !muted;
      });
    }
  }, [muted]);

  return (
    <div className={`relative rounded-2xl overflow-hidden bg-black ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
        </div>
      )}
      
      {!hasPermission && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
          <p className="text-white mb-2">Camera access is required</p>
          <button 
            className="px-4 py-2 bg-primary rounded-lg text-white text-sm"
            onClick={() => setHasPermission(true)}
          >
            Enable camera
          </button>
        </div>
      )}
      
      <video 
        ref={videoRef}
        autoPlay 
        playsInline
        muted={true} // Always mute video element to prevent echo
        className={`h-full w-full object-cover ${mirrored ? 'scale-x-[-1]' : ''}`}
        onLoadedData={() => setIsLoading(false)}
      />

      <div className="absolute bottom-3 left-3 px-2 py-1 bg-black/40 backdrop-blur-sm rounded-md text-white text-xs">
        {muted ? 'Muted' : 'Live'}
      </div>
    </div>
  );
};

export default VideoFeed;
