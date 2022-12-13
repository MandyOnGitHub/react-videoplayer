import { useState, useEffect } from 'react';
// import '../VideoPlayer.scss';

const useVideoPlayer = (
    videoElement,
    progressBarRef,
    volumeBarRef,
    selectionIndicatorRef,
    videoWrapperRef,
    overlayRef
) => {
    const [playerState, setPlayerState] = useState({
        isPlaying: false,
        progress: 0,
        speed: 1,
        isMuted: false,
        volume: 0.5,
        prevVolume: 0.5,
        currentTime: 0,
        duration: 0,
        fullscreen: false,
        hoveredSeconds: 0,
    });

    const controlsVisible = (visibility) => {
        visibility
            ? (overlayRef.current.style.opacity = 1)
            : (overlayRef.current.style.opacity = 0);
    };

    //****************** onload video **************************************************

    const onLoadedMetadata = () => {
        const seconds = Math.floor(videoElement.current.duration);

        setPlayerState({
            ...playerState,
            duration: seconds,
        });
        progressBarRef.current.max = seconds;
        volumeBarRef.current.style.setProperty('--volumeWidth', `50%`);
    };

    //****************** toggle play **************************************************

    const togglePlay = () => {
        setPlayerState({
            ...playerState,
            isPlaying: !playerState.isPlaying,
            duration: videoElement.current.duration,
        });
    };

    useEffect(() => {
        playerState.isPlaying
            ? videoElement.current.play()
            : videoElement.current.pause();
    }, [playerState.isPlaying, videoElement]);

    //****************** time updates *************************************************

    const handleOnTimeUpdate = () => {
        const progress =
            (videoElement.current.currentTime / videoElement.current.duration) *
            100;
        const currentTime = videoElement.current.currentTime;
        setPlayerState({
            ...playerState,
            progress,
            currentTime,
        });
        progressBarRef.current.style.setProperty(
            '--progressWidth',
            `${progress}%`
        );
    };

    //****************** video progress **********************************************

    const handleVideoProgress = (event) => {
        const manualChange = Number(event.target.value);
        videoElement.current.currentTime = manualChange;
        setPlayerState({
            ...playerState,
            progress: manualChange,
        });
    };

    //****************** show / hide video hover time  **************************************
    const showHoverTime = (event) => {
        let hoverProgress = 0;
        const rect = progressBarRef.current.getBoundingClientRect();
        const percent =
            Math.min(Math.max(0, event.clientX - rect.x), rect.width) /
            rect.width;

        setPlayerState({
            ...playerState,
            hoveredSeconds: percent * playerState.duration,
        });

        hoverProgress =
            (playerState.hoveredSeconds / videoElement.current.duration) * 100;
        selectionIndicatorRef.current.style.setProperty(
            '--hoverWidth',
            `${hoverProgress}%`
        );
        selectionIndicatorRef.current.style.visibility = 'visible';
    };

    const hideHoverTime = () => {
        selectionIndicatorRef.current.style.visibility = 'hidden';
    };

    //****************** video volume ************************************************

    const handleVideoVolume = (event) => {
        const volumeCurr = Number(event.target.value);

        videoElement.current.volume = volumeCurr;

        if (volumeCurr === 0) {
            setPlayerState({
                ...playerState,
                isMuted: true,
                volume: volumeCurr,
            });
        } else {
            setPlayerState({
                ...playerState,
                isMuted: false,
                volume: volumeCurr,
            });
        }

        volumeBarRef.current.style.setProperty(
            '--volumeWidth',
            `${volumeCurr * 100}%`
        );
    };


    //****************** mute **************************************************

    const toggleMute = () => {
        const prevValue = playerState.prevVolume;

        if (playerState.isMuted) videoElement.current.muted = false;
        else videoElement.current.muted = true;

        if (!playerState.isMuted) {
            setPlayerState((prevState) => ({
                ...prevState,
                prevVolume: playerState.volume,
                volume: 0,
                isMuted: true,
            }));

            volumeBarRef.current.style.setProperty(
                '--volumeWidth',
                `${playerState.volume}%`
            );
        } else {
            setPlayerState((prevState) => ({
                ...prevState,
                volume: prevValue,
                isMuted: false,
            }));

            volumeBarRef.current.style.setProperty(
                '--volumeWidth',
                `${playerState.prevVolume * 100}%`
            );
        }
    };

    //****************** fullscreen **********************************************

    useEffect(() => {
        document.addEventListener('fullscreenchange', handleFullscreen, false);
        return () => {
            document.removeEventListener(
                'fullscreenchange',
                handleFullscreen,
                false
            );
        };
    }, []);

    const toggleFullScreen = () => {
        if (videoElement.current) {
            videoWrapperRef.current.requestFullscreen();
            setPlayerState({
                ...playerState,
                fullscreen: true,
            });
        }
    };

    const exitFullscreen = () => {
        if (document.fullscreenElement) document.exitFullscreen();
        setPlayerState({
            ...playerState,
            fullscreen: false,
        });
    };

    const handleFullscreen = (e) => {
        setPlayerState((playerState) => ({
            ...playerState,
            fullscreen: Boolean(document.fullscreenElement),
        }));
    };

    useEffect(() => {
        if (document.fullscreenElement) {
            document.exitFullscreen();
        }
    }, [playerState.fullscreen]);

    //**************************************************************************

    return {
        playerState,
        togglePlay,
        handleOnTimeUpdate,
        handleVideoProgress,
        handleVideoVolume,
        toggleMute,
        toggleFullScreen,
        onLoadedMetadata,
        exitFullscreen,
        controlsVisible,
        showHoverTime,
        hideHoverTime,
    };
};

export default useVideoPlayer;