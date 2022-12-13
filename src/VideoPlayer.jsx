import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Button, Tooltip } from 'antd';
import { BsVolumeDown, BsVolumeUp, BsPlayFill, BsPauseFill, BsFullscreen, BsFullscreenExit } from "react-icons/bs";
import useVideoPlayer from './hooks/useVideoPlayer';
import { convertTimeToHMSorMS } from './utils/convertHMS';

import './VideoPlayer.scss';

export const VideoPlayer = ({ url, className }) => {
    const videoElement = useRef(null);
    const progressBarRef = useRef(null);
    const volumeBarRef = useRef(null);
    const selectionIndicatorRef = useRef(null);
    const overlayRef = useRef(null);
    const videoWrapperRef = useRef(null);

    const {
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
    } = useVideoPlayer(
        videoElement,
        progressBarRef,
        volumeBarRef,
        selectionIndicatorRef,
        videoWrapperRef,
        overlayRef
    );

    useEffect(() => {
        !playerState.isPlaying && controlsVisible(true);
    }, [playerState.isPlaying, controlsVisible]);

    return (
        <div className={`VideoPlayer ${className || ''}`}>
            <div
                id="video-wrapper"
                ref={videoWrapperRef}
                className={`video-wrapper ${
                    playerState.fullscreen && 'fullscreenMode'
                }`}
            >
                <video
                    src={url}
                    ref={videoElement}
                    onTimeUpdate={handleOnTimeUpdate}
                    preload="metadata"
                    onLoadedMetadata={onLoadedMetadata}
                />
                <div
                    ref={overlayRef}
                    className={`overlay ${
                        playerState.fullscreen ? 'fullscreenMode' : ''
                    }`}
                    onMouseEnter={() =>
                        playerState.isPlaying && controlsVisible(true)
                    }
                    onMouseLeave={() =>
                        playerState.isPlaying && controlsVisible(false)
                    }
                >
                    <div className="controls">
                      <Button
                            className="togglePlay"
                            type="primary"
                            size="medium"
                            icon={
                                playerState.isPlaying ? <BsPauseFill/> : <BsPlayFill/>
                            }
                            onClick={togglePlay}
                        />
                        <button className="toggleMute invisible" size="medium">
                            {playerState.isMuted 
                                        ? <BsVolumeDown   onClick={toggleMute}/>
                                        : <BsVolumeUp onClick={toggleMute}/>
                              
                            }
                            <div className="volumeTimeWrapper">
                                <span small className="volumeTimeWrapper-time"> 
                                    {playerState.currentTime ? (
                                        <>
                                            {convertTimeToHMSorMS(
                                                Math.floor(
                                                    playerState.currentTime
                                                )
                                            )}
                                        </>
                                    ) : (
                                        <>00:00</>
                                    )}
                                    <span className="separator">/</span>
                                    {playerState.duration ? (
                                        <>
                                            {convertTimeToHMSorMS(
                                                Math.floor(playerState.duration)
                                            )}{' '}
                                        </>
                                    ) : (
                                        <> 00:00</>
                                    )}
                                </span> 
                                <div className="volumeTimeWrapper-volume">
                                    <input
                                        className="volumeBar"
                                        ref={volumeBarRef}
                                        id="range"
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.01"
                                        value={playerState.volume}
                                        onChange={(e) => handleVideoVolume(e)}
                                    />
                                </div>
                            </div>
                        </button>
                        <div
                            className="progressWrapper"
                            onMouseMove={(e) => showHoverTime(e)}
                            onMouseOut={(e) =>
                                e.target.classList.contains(
                                    'progressWrapper'
                                ) && hideHoverTime(e)
                            }
                        >
                            <input
                                className="videoProgress"
                                ref={progressBarRef}
                                id="range"
                                type="range"
                                min="0"
                                step="any"
                                max={playerState.duration}
                                value={playerState.currentTime}
                                onChange={(e) => handleVideoProgress(e)}
                            />
                            <Tooltip 
                                title={convertTimeToHMSorMS(
                                    Math.floor(playerState.hoveredSeconds)
                                )}
                                trigger="hover"
                                zIndex={20000}
                                getPopupContainer={() =>
                                    document.querySelector(
                                        '.selectionIndicator'
                                    )
                                }
                            > 
                                <div
                                    className="selectionIndicator"
                                    ref={selectionIndicatorRef}
                                    onClick={() =>
                                        handleVideoProgress({
                                            target: {
                                                value: playerState.hoveredSeconds,
                                            },
                                        })
                                    }
                                ></div>
                            </Tooltip>
                        </div>
                        <Tooltip
                            title={
                                playerState.fullscreen
                                    ? <BsFullscreenExit/>
                                    : <BsFullscreen/>
                            }
                            // title={<BsFullscreen/>}
                            trigger="hover"
                            zIndex={20000}
                            getPopupContainer={() =>
                                document.querySelector('.fullscreenBtn')
                            }
                        />
                            <button className="fullscreenBtn invisible">
                                <span
                                    className="fullScreenIcon"
                                    onClick={
                                        playerState.fullscreen
                                            ? exitFullscreen
                                            : toggleFullScreen
                                    }
                                    // name={
                                    //     playerState.fullscreen
                                    //         ? 'FullscreenExit'
                                    //         : 'Fullscreen'
                                    // }
                                    // size="large"
                                >
                                { playerState.fullscreen 
                                            ? <BsFullscreenExit/>
                                            : <BsFullscreen/>
                                }
                                </span>
                            </button>
                        {/* </Tooltip> */}
                    </div>
                </div>
            </div>
        </div>
    );
};

VideoPlayer.propTypes = {
    /**
     * URL of video
     */
    url: PropTypes.string.isRequired,
}
