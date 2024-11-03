// Santa's Sleigh Mate - AudioController.js
// Helper functions for controlling audio components in the Santa's Sleigh Mate game
import * as ecs from '@8thwall/ecs'  // Access the ecs library

// Given an entity id, play its audio component
const PlayAudio = (world, componentEID, audioType) => {
    if (ecs.Audio.has(world, componentEID)) {  // If the entity has an Audio component...
        const audio = ecs.Audio.cursor(world, componentEID)  // Get a reference to that Audio component
        switch(audioType) {
            case 'levelUp':
                audio.url = 'assets/level-up.mp3';  // Play level-up sound
                break;
            case 'gameOver':
                audio.url = 'assets/game-over.mp3';  // Play game-over sound
                break;
            case 'match':
                audio.url = 'assets/match.mp3';  // Play match success sound
                break;
            default:
                audio.url = 'assets/default.mp3';  // Default sound
        }
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