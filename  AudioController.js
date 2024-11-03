//AudioController.js
// Helper functions for controlling audio components
import * as ecs from '@8thwall/ecs'  // This is how you access the ecs library

// Given an entity id, play its audio component
const PlayAudio = (world, componentEID) => {
    if (ecs.Audio.has(world, componentEID)) {  // If the supplied entity has an Audio component...
        const audio = ecs.Audio.cursor(world, componentEID)  // Get a reference to that Audio component
        audio.paused = false  // And play the assigned audio source
    }
}

// Given an entity id, pause its audio component if it is playing
const PauseAudio = (world, componentEID) => {
    if (ecs.Audio.has(world, componentEID)) {
        const audio = ecs.Audio.cursor(world, componentEID)
        audio.paused = true
    }
}

// Given an entity id with an audio component, change its audio source
const ChangeAudio = (world, componentEID, newAudio) => {
    if (ecs.Audio.has(world, componentEID)) {
        const audio = ecs.Audio.cursor(world, componentEID)
        audio.url = newAudio
    }
}

export {PauseAudio, PlayAudio, ChangeAudio}
